import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class BaseEditor extends Component {
  @tracked fieldValue;

  constructor(...args) {
    super(...args);

    this.load.perform();
  }

  // Note that this.args.card is actually a FieldCard. Typescript will eventually make this more obvious...
  @(task(function*() {
    this.fieldValue = yield this.args.card.enclosingCard.value(this.args.card.name);
  }).drop())
  load;

  @(task(function*(value) {
    this.fieldValue = value;
    yield this.args.setCardValue.linked().perform(this.args.card.name, value);
  }).restartable())
  updateFieldValue;

  @task(function*(evt) {
    if (this.args.card.csFieldArity === 'plural' && evt.which === 13) {
      let values = [...this.fieldValue, evt.target.value];
      this.fieldValue = values;
      yield this.args.setCardValue.linked().perform(this.args.card.name, values);
    }
  })
  add;

  @task(function*(index) {
    this.fieldValue = this.fieldValue.filter((el, i) => i !== index);
    yield this.args.setCardValue.linked().perform(this.args.card.name, this.fieldValue);
  })
  remove;
}
