import Koa from 'koa';
import Logger from '@cardstack/logger';
import autoBind from 'auto-bind';
import DatabaseManager from '../services/database-manager';
import { inject } from '../di/dependency-injection';
let log = Logger('route:prepaid-card-color-schemes');

export default class PrepaidCardColorSchemesRoute {
  databaseManager: DatabaseManager = inject('database-manager', { as: 'databaseManager' });

  constructor() {
    autoBind(this);
  }

  async get(ctx: Koa.Context) {
    let db = await this.databaseManager.getClient();
    try {
      let result = await db.query(
        'SELECT id, background, pattern_color, text_color, description FROM prepaid_card_color_schemes'
      );
      let data = result.rows.map((row) => {
        return {
          id: row.id,
          type: 'prepaid-card-color-schemes',
          attributes: {
            background: row.background,
            'pattern-color': row.pattern_color,
            'text-color': row.text_color,
            description: row.description,
          },
        };
      });
      ctx.status = 200;
      ctx.body = {
        data,
      };
      ctx.type = 'application/vnd.api+json';
    } catch (e) {
      log.error(e);
    }
  }
}

declare module '@cardstack/hub/di/dependency-injection' {
  interface KnownServices {
    'prepaid-card-color-schemes-route': PrepaidCardColorSchemesRoute;
  }
}
