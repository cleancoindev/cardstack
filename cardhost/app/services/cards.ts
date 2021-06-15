import Service from '@ember/service';
import { macroCondition, isTesting } from '@embroider/macros';
import Component from '@glimmer/component';
import { hbs } from 'ember-cli-htmlbars';
import { setComponentTemplate } from '@ember/component';
import { task } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';

import { Format, DeserializerName } from '@cardstack/core/src/interfaces';
import { cardJSONReponse } from '@cardstack/server/src/interfaces';
import { encodeCardURL } from '@cardstack/core/src/utils';
import serializers, { Serializer } from '@cardstack/core/src/serializers';
import config from 'cardhost/config/environment';
import { inject } from '@ember/service';
import { Store } from 'ember-orbit';

const { cardServer } = config; // Environment types arent working

export interface LoadedCard {
  model: any;
  component: unknown;
}

function buildURL(url: string, format?: Format): string {
  let fullURL = [cardServer, 'cards/', encodeCardURL(url)];
  if (format) {
    fullURL.push('?' + new URLSearchParams({ format }).toString());
  }
  return fullURL.join('');
}

export default class Cards extends Service {
  @inject declare store: Store;

  async load(
    url: string,
    format: Format
  ): Promise<{ model: any; component: unknown }> {
    // let fullURL = buildURL(url, format);
    return this.internalLoad.perform(url);
  }

  async loadForRoute(
    pathname: string
  ): Promise<{ model: any; component: unknown }> {
    return this.internalLoad.perform(`${cardServer}cardFor${pathname}`);
  }

  @task
  private internalLoad = taskFor(
    async (cardID: string): Promise<LoadedCard> => {
      // let card = await fetchCard(url);
      // let card = await this.store.findRecord('cards', cardID);
      let card = await this.store.liveQuery((qb) =>
        qb.findRecord({ type: 'card', id: cardID })
      );
      debugger;
      // let model = await deserializeResponse(card);

      // let { componentModule } = card.data.meta;
      let cardComponent: unknown;
      if (macroCondition(isTesting())) {
        // in tests, our fake server inside mirage just defines these modules
        // dynamically
        cardComponent = window.require(componentModule)['default'];
      } else {
        if (!componentModule.startsWith('@cardstack/compiled/')) {
          throw new Error(
            `${url}'s meta.componentModule does not start with '@cardstack/compiled/`
          );
        }
        componentModule = componentModule.replace('@cardstack/compiled/', '');
        cardComponent = (
          await import(
            /* webpackExclude: /schema\.js$/ */
            `@cardstack/compiled/${componentModule}`
          )
        ).default;
      }

      // TODO: @set should be conditional?
      let CallerComponent = setComponentTemplate(
        hbs`<this.card @model={{this.model}} @set={{this.setters}} />`,
        class extends Component<{
          set: (segments: string[], value: any) => void;
        }> {
          card = cardComponent;
          model = model;

          get setters() {
            return makeSetter(this.args.set);
          }
        }
      );

      return {
        model,
        component: CallerComponent,
      };
    }
  );

  async save(cardURL: string, data: unknown): Promise<void> {
    await this.saveTask.perform(cardURL, data);
  }

  @task saveTask = taskFor(
    async (cardURL: string, data: any): Promise<void> => {
      await fetch(buildURL(cardURL), {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    }
  );
}

function makeSetter(
  callback: (segments: string[], value: any) => void,
  segments: string[] = []
): any {
  let s = (value: any) => {
    callback(segments, value);
  };
  (s as any).setters = new Proxy(
    {},
    {
      get: (target: object, prop: string, receiver: unknown) => {
        console.log('PROXY GET', target, prop, receiver);
        if (typeof prop === 'string') {
          return makeSetter(callback, [...segments, prop]);
        } else {
          return Reflect.get(target, prop, receiver);
        }
      },
    }
  );
  return s;
}
// async function fetchCard(url: string): Promise<cardJSONReponse> {
//   let response = await fetch(url);

//   if (response.status !== 200) {
//     throw new Error(`unable to fetch card ${url}: status ${response.status}`);
//   }

//   return await response.json();
// }

function deserializeResponse(response: cardJSONReponse): any {
  let { deserializationMap } = response.data.meta;
  let attrs = response.data.attributes;

  if (attrs && deserializationMap) {
    for (const type in deserializationMap) {
      let serializer = serializers[type as DeserializerName];
      let paths = deserializationMap[type as DeserializerName];

      for (const path of paths) {
        deserializeAttribute(attrs, path, serializer);
      }
    }
  }

  let model = Object.assign({ id: response.data.id }, attrs);

  return model;
}

function deserializeAttribute(
  attrs: { [name: string]: any },
  path: string,
  serializer: Serializer
) {
  let [key, ...tail] = path.split('.');
  let value = attrs[key];
  if (!value) {
    throw new MissingDataError(path);
  }

  if (tail.length) {
    let tailPath = tail.join('.');
    if (Array.isArray(value)) {
      for (let row of value) {
        deserializeAttribute(row, tailPath, serializer);
      }
    } else {
      deserializeAttribute(attrs[key], tailPath, serializer);
    }
  } else {
    attrs[path] = serializer.deserialize(value);
  }
}

class MissingDataError extends Error {
  constructor(path: string) {
    super(path);
    this.message = `Server response said ${path} would need to be deserialized, but that path didnt exist`;
  }
}
