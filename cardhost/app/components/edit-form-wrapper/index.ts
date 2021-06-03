import CardsService, { LoadedCard } from '../../services/cards';
import Component from '@glimmer/component';
import { inject } from '@ember/service';

interface EditFormWrapperArgs {
  card: LoadedCard;
}

export default class EditFormWrapper extends Component<EditFormWrapperArgs> {
  @inject declare cards: CardsService;
}
