import Session from '@cardstack/plugin-utils/session';
import { declareInjections } from '@cardstack/di';
import { todo } from '@cardstack/plugin-utils/todo-any';
import {
  SingleResourceDoc,
  CollectionResourceDoc,
} from 'jsonapi-typescript';
import cardUtils from './indexing/card-utils';

const {
  adaptCardToFormat,
  adaptCardCollectionToFormat
} = cardUtils;

export = declareInjections({
  writers: 'hub:writers',
  searchers: 'hub:searchers',
  currentSchema: 'hub:current-schema'
},

class CardServices {
  searchers: todo;
  currentSchema: todo;
  writers: todo;

  async get(session: Session, id: string, format: string) {
    let card: SingleResourceDoc = await this.searchers.get(session, 'local-hub', id, id, { format }) as SingleResourceDoc;
    return await adaptCardToFormat(await this.currentSchema.getSchema(), card, format);
  }

  async search(session: Session, format: string, query: todo) {
    let cards: CollectionResourceDoc = await this.searchers.search(session, query, { format }) as CollectionResourceDoc;
    return await adaptCardCollectionToFormat(await this.currentSchema.getSchema(), cards, format);
  }

  async create(session: Session, card: SingleResourceDoc) {
    return await this.writers.create(session, 'cards', card);
  }
});