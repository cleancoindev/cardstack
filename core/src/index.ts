import * as syntax from '@glimmer/syntax';
import { transformSync } from '@babel/core';
// @ts-ignore
import decoratorsPlugin from '@babel/plugin-proposal-decorators';
// @ts-ignore
import classPropertiesPlugin from '@babel/plugin-proposal-class-properties';

import cardPlugin, { getMeta } from './card-babel-plugin';
import cardGlimmerPlugin from './card-glimmer-plugin';

interface RawCard {
  url?: string;
  'schema.js': string;
  'isolated.hbs'?: string;
}

interface CompiledCard {
  url: string | undefined;
  modelSource: string;
  fields: {
    [key: string]: {
      type: 'hasMany' | 'belongsTo' | 'contains' | 'containsMany';
      card: CompiledCard;
    };
  };
  templateSources: {
    [key: string]: string;
  };
}

export class Compiler {
  async compile(cardSource: RawCard): Promise<CompiledCard> {
    let options = {};

    let out = transformSync(cardSource['schema.js'], {
      plugins: [
        [cardPlugin, options],
        [
          decoratorsPlugin,
          {
            decoratorsBeforeExport: false,
          },
        ],
        classPropertiesPlugin,
      ],
    });

    let meta = getMeta(options);

    let fields: CompiledCard['fields'] = {};
    for (let [name, { cardURL, type }] of Object.entries(meta.fields)) {
      fields[name] = {
        card: await this.lookup(cardURL),
        type,
      };
    }

    let templateSources: CompiledCard['templateSources'] = {};

    if (cardSource['isolated.hbs']) {
      templateSources.isolated = syntax.print(
        syntax.preprocess(cardSource['isolated.hbs'], {
          mode: 'codemod',
          plugins: {
            ast: [cardGlimmerPlugin],
          },
        })
      );
    }

    return {
      url: cardSource.url,
      modelSource: out!.code!,
      fields,
      templateSources,
    };
  }

  async lookup(cardURL: string): Promise<CompiledCard> {
    switch (cardURL) {
      case 'https://cardstack.com/base/models/string':
        return {
          url: cardURL,
          modelSource: '',
          fields: {},
          templateSources: {
            embedded: `{{this}}`,
          },
        };
      case 'https://localhost/base/models/person':
        return {
          url: cardURL,
          modelSource: '',
          fields: {},
          templateSources: {
            embedded: `{{this}}`,
          },
        };
      case 'https://localhost/base/models/comment':
        return {
          url: cardURL,
          modelSource: '',
          fields: {},
          templateSources: {
            embedded: `{{this}}`,
          },
        };
      case 'https://localhost/base/models/tag':
        return {
          url: cardURL,
          modelSource: '',
          fields: {},
          templateSources: {
            embedded: `{{this}}`,
          },
        };
      default:
        throw new Error(`unknown card ${cardURL}`);
    }
  }
}

export function field(/*card: CompiledCard*/) {
  return function (desc: {
    key: string;
    initializer: ((initialValue: any) => any) | undefined;
  }) {
    function initializer(value: any) {
      return value;
    }
    desc.initializer = initializer;
    return desc;
  };
}
