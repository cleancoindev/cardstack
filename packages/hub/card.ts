import CardstackError from './error';
import { loadIndexer, loadWriter, patch, buildValueExpression } from './scaffolding';
import { WriterFactory } from './writer';
import { PristineDocument, UpstreamDocument, UpstreamIdentity, PristineCollection } from './document';
import { SingleResourceDoc } from 'jsonapi-typescript';
import cloneDeep from 'lodash/cloneDeep';
import { CardExpression } from './pgsearch/util';
import { ResponseMeta } from './pgsearch/pgclient';
import * as J from 'json-typescript';
import { IndexerFactory } from './indexer';
import { myOrigin } from './origin';

export const apiPrefix = '/api';

export function canonicalURLToCardId(url: string) {
  let parts = url.split('/');
  let localId = parts.pop()!;
  let nextPart = parts.pop()!;
  let originalRealm;
  if (nextPart !== 'cards') {
    originalRealm = nextPart;
    parts.pop();
  }
  return {
    realm: parts.join('/'),
    originalRealm: originalRealm == null ? undefined : decodeURIComponent(originalRealm),
    localId: decodeURIComponent(localId),
  };
}

export function canonicalURL(id: CardId) {
  let isHome = id.originalRealm === id.realm;
  let base = `${myOrigin}${apiPrefix}/realms`;
  let localRealmId = id.realm.slice(base.length + 1);
  if (isHome) {
    return [base, localRealmId, 'cards', encodeURIComponent(id.localId)].join('/');
  } else {
    return [
      base,
      localRealmId,
      'cards',
      encodeURIComponent(id.originalRealm ?? id.realm),
      encodeURIComponent(id.localId),
    ].join('/');
  }
}

export async function makePristineCollection(cards: Card[], meta: ResponseMeta): Promise<PristineCollection> {
  let pristineDocs = await Promise.all(cards.map(card => card.asPristineDoc()));
  // TODO includeds
  return new PristineCollection({
    data: pristineDocs.map(doc => doc.jsonapi.data),
    meta: (meta as unknown) as J.Object,
  });
}

class BaseCard {
  // Almost everyone should treat this as opaque and only valid on the current
  // hub. (The only exception is some code within the hub itself that may
  // optimize by pulling these apart.)
  get id(): string | undefined {
    if (typeof this.localId === 'string') {
      return [this.realm, this.originalRealm, this.localId].map(encodeURIComponent).join('/');
    }
    return undefined;
  }

  // This is the realm the card is stored in.
  realm: string;

  // this is the realm the card was first created in. As a card is copied to
  // other realms, `card.realm` changes but `card.originalRealm` does not.
  originalRealm: string;

  // the localId distinguishes the card within its originalRealm. In some cases
  // it may be chosen by the person creating the card. In others it may be
  // chosen by the hub.
  localId: string | undefined;

  private jsonapi: SingleResourceDoc;

  // Identity invariants:
  //
  //  - within a given originalRealm, localId is unique.
  //
  //  - [originalRealm, localId] is the globally unique *semantic* identity of a
  //    card. In other words, two Cards with the same [originalRealm, localId]
  //    are "the same card" from the user's perspective, but might be different
  //    "versions" of it, stored in different realms.
  //
  //  - within a given realm, [originalRealm, localId] is unique. That is, we
  //    only allow one version of the same card per realm.
  //
  //  - [realm, originalRealm, id] is globally unique, such that there are
  //    exactly zero or one cards that match it, across all hubs.

  constructor(jsonapi: SingleResourceDoc, realm: string) {
    this.jsonapi = jsonapi;
    this.realm = realm;
    this.originalRealm =
      typeof jsonapi.data.attributes?.originalRealm === 'string' ? jsonapi.data.attributes.originalRealm : realm;

    if (typeof jsonapi.data.attributes?.localId === 'string') {
      this.localId = jsonapi.data.attributes?.localId;
    }
  }

  async field(name: string): Promise<any> {
    let model = this.jsonapi.data.attributes?.model as { attributes: { [name: string]: any } };
    return model?.attributes[name];
  }

  protected regenerateJSONAPI(): SingleResourceDoc {
    let copied = cloneDeep(this.jsonapi);
    if (!copied.data.attributes) {
      copied.data.attributes = {};
    }
    copied.data.attributes.realm = this.realm;
    copied.data.attributes.originalRealm = this.originalRealm;
    if (this.localId) {
      copied.data.attributes.localId = this.localId;
    }
    copied.data.id = this.id;
    return copied;
  }

  async asPristineDoc(): Promise<PristineDocument> {
    return new PristineDocument(this.regenerateJSONAPI());
  }

  async asUpstreamDoc(): Promise<UpstreamDocument> {
    return new UpstreamDocument(this.jsonapi);
  }

  patch(otherDoc: SingleResourceDoc): void {
    patch(this.jsonapi, otherDoc);
  }

  // This is the way that data source plugins think about card IDs. The
  // upstreamId is only unique *within* a realm.
  get upstreamId(): UpstreamIdentity | null {
    if (this.realm === this.originalRealm) {
      if (typeof this.localId === 'string') {
        return this.localId;
      } else {
        return null;
      }
    } else {
      if (typeof this.localId === 'string') {
        return { originalRealm: this.originalRealm, localId: this.localId };
      } else {
        throw new CardstackError(`A card originally from a different realm must already have a local-id`, {
          status: 400,
        });
      }
    }
  }

  async adoptsFrom(): Card {
    debugger;
  }
}

export class UnsavedCard extends BaseCard {
  asSavedCard(): Card {
    if (typeof this.localId !== 'string') {
      throw new CardstackError(`card missing required attribute "localId"`);
    }
    return new Card(this.regenerateJSONAPI());
  }
}

export class Card extends UnsavedCard {
  // these are non-null because of the assertion in our construction that
  // ensures localId is present.
  id!: string;
  localId!: string;

  constructor(jsonapi: SingleResourceDoc) {
    if (typeof jsonapi.data.attributes?.realm !== 'string') {
      throw new CardstackError(`card missing required attribute "realm": ${JSON.stringify(jsonapi)}`);
    }
    let realm = jsonapi.data.attributes.realm;
    super(jsonapi, realm);

    // this is initialized in super() by typescript can't see it.
    if ((this as any).localId == null) {
      throw new Error(`Bug: tried to use an UnsavedCard as a Card`);
    }
  }

  async loadFeature(featureName: 'writer'): Promise<WriterFactory | null>;
  async loadFeature(featureName: 'indexer'): Promise<IndexerFactory<J.Value> | null>;
  async loadFeature(featureName: 'buildValueExpression'): Promise<(expression: CardExpression) => CardExpression>;
  async loadFeature(featureName: any): Promise<any> {
    switch (featureName) {
      case 'writer':
        return await loadWriter(this);
      case 'indexer':
        return await loadIndexer(this);
      case 'buildValueExpression':
        return buildValueExpression;
      default:
        throw new Error(`unimplemented loadFeature("${featureName}")`);
    }
  }

  get canonicalURL(): string {
    return canonicalURL(this);
  }
}

export interface CardId {
  realm: string;
  originalRealm?: string; // if not set, its implied that its equal to `realm`.
  localId: string;
}
