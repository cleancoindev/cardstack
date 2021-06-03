import { Format } from '@cardstack/core/src/interfaces';
import Service, { inject } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { task } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';

import { LoadedCard } from './cards';
import CardsService from '../services/cards';

export default class Modal extends Service {
  @inject declare cards: CardsService;

  @tracked isShowing = false;
  @tracked loadedCard?: LoadedCard;
  @tracked format?: Format;

  @task openWithCard = taskFor(
    async (url: string, format: Format): Promise<void> => {
      this.isShowing = true;

      this.format = format;
      this.loadedCard = await this.cards.load(url, format);
    }
  );

  close(): void {
    this.isShowing = false;
    this.loadedCard = undefined;
    this.format = undefined;
  }
}
