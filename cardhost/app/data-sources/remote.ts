import SourceClass from '@orbit/jsonapi';
import { JSONAPIURLBuilder } from '@orbit/jsonapi';

import config from 'cardhost/config/environment';
import { encodeCardURL } from '@cardstack/core/src/utils';

class CardURLBuilder extends JSONAPIURLBuilder {
  resourcePath(type: string, id?: string): string {
    if (type !== 'card') {
      return super.resourcePath(type, id);
    }
    let path = [this.serializer.resourceType(type)];
    if (id) {
      path.push(encodeCardURL(id));
    }
    return path.join('/');
  }
}

export default {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  create(settings: any) {
    settings.name = 'remote';
    settings.host = config.cardServer;
    // settings.URLBuilderClass = CardURLBuilder;
    return new SourceClass(settings);
  },
};
