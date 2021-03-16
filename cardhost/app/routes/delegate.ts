import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import CardsService from '../services/cards';

export default class Delegate extends Route {
  @inject declare cards: CardsService;

  model(params: {
    pathname: string;
  }): Promise<{ model: any; component: unknown }> {
    return this.cards.loadForRoute(params.pathname);
  }
}
