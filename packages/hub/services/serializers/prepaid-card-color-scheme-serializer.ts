import { inject } from '../../di/dependency-injection';
import DatabaseManager from '../database-manager';

interface PrepaidCardColorScheme {
  id: string;
  background: string;
  patternColor: string;
  textColor: string;
  description: string;
}
interface JSONAPIDocument {
  data: any;
  includes?: any[];
}

export default class PrepaidCardColorSchemeSerializer {
  databaseManager: DatabaseManager = inject('database-manager', { as: 'databaseManager' });

  async serialize(id: string): Promise<JSONAPIDocument>;
  async serialize(model: PrepaidCardColorScheme): Promise<JSONAPIDocument>;
  async serialize(content: string | PrepaidCardColorScheme): Promise<JSONAPIDocument> {
    if (typeof content === 'string') {
      content = await this.loadPrepaidCardColorScheme(content);
    }
    let data = {
      id: content.id,
      type: 'prepaid-card-color-schemes',
      attributes: {
        background: content.background,
        'pattern-color': content.patternColor,
        'text-color': content.textColor,
        description: content.description,
      },
    };
    let result = {
      data,
    } as JSONAPIDocument;
    return result;
  }

  async loadPrepaidCardColorScheme(id: string): Promise<PrepaidCardColorScheme> {
    let db = await this.databaseManager.getClient();
    let queryResult = await db.query(
      'SELECT id, background, pattern_color, text_color, description FROM prepaid_card_color_schemes WHERE id = $1',
      [id]
    );
    if (queryResult.rowCount === 0) {
      return Promise.reject(new Error(`No prepaid_card_color_scheme record found with id ${id}`));
    }
    let row = queryResult.rows[0];
    return {
      id: row['id'],
      background: row['background'],
      patternColor: row['pattern_color'],
      textColor: row['text_color'],
      description: row['description'],
    };
  }
}

declare module '@cardstack/hub/di/dependency-injection' {
  interface KnownServices {
    'prepaid-card-color-scheme-serializer': PrepaidCardColorSchemeSerializer;
  }
}
