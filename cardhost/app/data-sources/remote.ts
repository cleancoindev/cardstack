import {
  buildSerializerClassFor,
  buildSerializerSettingsFor,
} from '@orbit/serializers';
import JSONAPISource, {
  JSONAPIResourceSerializer,
  JSONAPISerializers,
  JSONAPIURLBuilder,
} from '@orbit/jsonapi';

import config from 'cardhost/config/environment';

class CardURLBuilder extends JSONAPIURLBuilder {
  resourcePath(type: string, id?: string): string {
    if (type !== 'card') {
      return super.resourcePath(type, id);
    }
    let path = ['cards'];
    if (id) {
      path.push(encodeURIComponent(id));
    }
    return path.join('/');
  }
}

class CardResourceSerializer extends JSONAPIResourceSerializer {}

export default {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  // create(settings: Partial<JSONAPISourceSettings>) {
  create(settings: any) {
    settings.name = 'remote';
    settings.host = config.cardServer;
    settings.URLBuilderClass = CardURLBuilder;
    // settings.RequestProcessorClass = CardRequestProcessor;

    // INFO: How to override serializers: https://github.com/orbitjs/orbit/pull/758
    return new JSONAPISource(
      Object.assign(settings, {
        serializerFor: buildSerializerClassFor({
          [JSONAPISerializers.Resource]: CardResourceSerializer,
        }),
        serializerSettingsFor: buildSerializerSettingsFor({
          settingsByType: {
            [JSONAPISerializers.ResourceType]: {
              serializationOptions: { inflectors: ['pluralize'] },
            },
          },
        }),
      })
    );
  },
};
