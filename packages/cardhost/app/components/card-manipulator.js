import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import ENV from '@cardstack/cardhost/config/environment';
import { fieldCards } from '../utils/scaffolding';
import cloneDeep from 'lodash/cloneDeep';
import { canonicalURLToCardId } from '@cardstack/core/card-id';

const { environment } = ENV;

export default class CardManipulator extends Component {
  @service data;
  @service router;
  @service cardstackSession;
  @service cssModeToggle;

  @tracked statusMsg;
  @tracked card;
  @tracked catalogEntries;
  @tracked parentCard;
  @tracked grandParentCard;
  @tracked selectedField;
  @tracked selectedFieldName;
  @tracked selectedFieldType;
  @tracked isDragging;
  @tracked cardId;
  @tracked cardSelected = true;
  @tracked addFieldPromise;

  constructor(...args) {
    super(...args);

    this.card = this.args.card;
    this.originalCard = this.args.card;
    this.load.perform();
  }

  get cardJson() {
    if (!this.card) {
      return null;
    }
    return JSON.stringify(this.card.document.jsonapi, null, 2);
  }

  @(task(function*() {
    /**
      Returns field name in the form field-12, incrementing from the highest
      existing field number. Ex: if the highest is field-15, this will return
      field-16. If there are no fields, it returns field-1.
    */
    let existingFields = yield this.card.fields();
    let autogeneratedFieldNames = existingFields.map(field => field.name).filter(name => /^field-\d+$/.test(name));
    let fieldNumbers = autogeneratedFieldNames.map(item => Number(item.split('-')[1]));
    let newNumber = fieldNumbers.length ? Math.max(...fieldNumbers) + 1 : 1;
    return `field-${newNumber}`;
  }).drop())
  getNewFieldName;

  @(task(function*(cardId, evt) {
    let doc = this.card.document;
    // TODO need to set the position too (add new csFieldPositions prop...)
    let fieldName = yield this.getNewFieldName.perform();
    let csFieldSets = cloneDeep(this.card.csFieldSets) || { isolated: [], embedded: [] };
    csFieldSets.isolated = csFieldSets.isolated || [];
    csFieldSets.isolated.push(fieldName);

    doc.withField(fieldName, canonicalURLToCardId(cardId)).withAttributes({ csFieldSets });
    let patchedCard = yield this.patchCard.perform(doc);
    let field = yield patchedCard.field(fieldName);
    this.card = patchedCard;

    if (this.addFieldResolve) {
      this.addFieldResolve();
    }
    this.selectField(field, evt);
  }).enqueue())
  handleNewFieldAdded;

  @(task(function*() {
    if (!this.selectedField) {
      return;
    }

    let fieldType = yield this.selectedField.adoptsFrom();
    this.selectedFieldType = fieldType.csTitle;
  }).restartable())
  loadSelectedField;

  @task(function*() {
    let [catalogEntries, parentCard] = yield Promise.all([fieldCards(this.data), this.args.card.adoptsFrom()]);

    this.catalogEntries = catalogEntries;
    this.parentCard = parentCard;
    if (parentCard) {
      this.grandParentCard = yield parentCard.adoptsFrom();
    }
  })
  load;

  @(task(function*(doc) {
    return yield this.card.patch(doc.jsonapi);
  }).enqueue())
  patchCard;

  // TODO rework for new API
  @task(function*() {
    // this.statusMsg = null;
    // try {
    //   yield this.card.delete();
    // } catch (e) {
    //   console.error(e); // eslint-disable-line no-console
    //   this.statusMsg = `card ${this.card.name} was NOT successfully deleted: ${e.message}`;
    //   return;
    // }
    // this.router.transitionTo('index');
  })
  deleteCard;

  @(task(function*(oldFieldName, newFieldName) {
    let field = yield this.card.field(oldFieldName);
    let doc = this.card.document;
    let csFieldSets = cloneDeep(this.card.csFieldSets) || { isolated: [], embedded: [] };

    for (let format of ['isolated', 'embedded']) {
      if (Array.isArray(csFieldSets[format]) && csFieldSets[format].includes(oldFieldName)) {
        csFieldSets[format] = [...csFieldSets[format].filter(i => i !== oldFieldName), newFieldName];
      }
    }
    doc
      .withoutField(oldFieldName)
      .withField(newFieldName, field.document, field.csFieldArity)
      .withAttributes({ csFieldSets });

    let patchedCard = yield this.patchCard.perform(doc);
    this.card = patchedCard;
    this.selectedFieldName = newFieldName;
  }).restartable())
  setFieldName;

  @(task(function*(fieldName, property, value) {
    let field = yield this.card.field(fieldName);
    let doc = this.card.document.withField(fieldName, field.document, field.csFieldArity, {
      [property]: value,
    });
    let patchedCard = yield this.patchCard.perform(doc);
    this.card = patchedCard;
  }).restartable())
  setFieldCardValue;

  @(task(function*(field, value) {
    let doc = this.card.document.withAttributes({
      [field]: value,
    });
    let patchedCard = yield this.patchCard.perform(doc);
    this.card = patchedCard;
  }).restartable())
  setCardValue;

  @(task(function*(field, cardId) {
    let doc = this.card.document.withRelationships({
      [field]: cardId,
    });
    let patchedCard = yield this.patchCard.perform(doc);
    this.card = patchedCard;
  }).restartable())
  setCardReference;

  @(task(function*(fieldName, neededWhenEmbedded, evt) {
    // this prevents 2-way data binding from trying to alter the Field
    // instance's neededWhenEmbedded value, which is bound to the input
    // that fired this action. Our data service API is very unforgiving when
    // you try to change the Field's state outside of the official API
    // (which is what ember is trying to do). Ember gets mad when it sees
    // that it can't alter the Field's state via the 2-way binding and
    // makes lots of noise. interestingly, this issue only seems to happen
    // when running tests. This work around has yucky visual side effects,
    // so only performing in the test env. A better solution would be to use/make
    // a one-way input control for setting the field.neededWhenEmbedded value.
    // The <Input> component is unfortunately, is not a one-way input helper
    if (environment === 'test') {
      evt.preventDefault();
    }

    let doc = this.card.document;
    let csFieldSets = cloneDeep(this.card.csFieldSets) || { isolated: [], embedded: [] };
    if (neededWhenEmbedded && Array.isArray(csFieldSets.embedded) && !csFieldSets.embedded.includes(fieldName)) {
      csFieldSets.embedded.push(fieldName);
    } else if (!neededWhenEmbedded && Array.isArray(csFieldSets.embedded) && csFieldSets.embedded.includes(fieldName)) {
      csFieldSets.embedded = csFieldSets.embedded.filter(i => i !== fieldName);
    }

    doc.withAttributes({ csFieldSets });

    let patchedCard = yield this.patchCard.perform(doc);
    this.card = patchedCard;
  }).restartable())
  setNeededWhenEmbedded;

  @(task(function*(fieldName) {
    let doc = this.card.document;
    let csFieldSets = cloneDeep(this.card.csFieldSets) || { isolated: [], embedded: [] };

    for (let format of ['isolated', 'embedded']) {
      if (Array.isArray(csFieldSets[format]) && csFieldSets[format].includes(fieldName)) {
        csFieldSets[format] = [...csFieldSets[format].filter(i => i !== fieldName)];
      }
    }
    doc.withoutField(fieldName).withAttributes({ csFieldSets });

    let patchedCard = yield this.patchCard.perform(doc);
    this.card = patchedCard;
    if (this.selectedField.name === fieldName || this.selectedFieldName === fieldName) {
      this.cardSelected = true;
      this.selectedFieldName = null;
      this.selectedField = null;
      this.selectedFieldType = null;
    }
  }).drop())
  removeField;

  @action
  setPosition(fieldName, position) {
    if (!fieldName || !this.card || position == null) {
      return;
    }

    let card = this.card;
    card.moveField(card.getField(fieldName), position);
  }

  @action
  preview() {
    this.router.transitionTo('cards.card.edit.layout', this.card);
  }

  @action
  delete() {
    this.deleteCard.perform();
  }

  @action
  initDrag() {
    this.isDragging = true;
  }

  @action dropField(position, onFinishDrop, evt) {
    if (this.addFieldResolve) {
      this.addFieldResolve();
    }
    // This is to address race conditions around the asynchronicity of creating
    // a new field and removing the "drop shadow" of the field to be dropped. We
    // are providing the card-renderer a promise for the patching of the card
    // with a new field, as well as the ability to see the state of the promise
    // before it tries to await the promise which is important to get the timing
    // of the shadow disappearance correct.
    this.addFieldPromise = queryablePromise(
      new Promise(resolve => {
        this.addFieldResolve = resolve;
      })
    );

    onFinishDrop();
    let field;
    let cardId = evt.dataTransfer.getData('text/cardId');
    if (cardId) {
      this.handleNewFieldAdded.perform(cardId, evt);
    } else {
      let fieldName = evt.dataTransfer.getData('text/field-name');
      if (fieldName) {
        field = this.card.getField(fieldName);
        let newPosition = field.position < position ? position - 1 : position;
        this.setPosition(fieldName, newPosition);
      }
    }
    this.isDragging = false;

    if (field) {
      // TODO need to reimplement this--not sure if we should return the field
      // card (which is async meaning we need to use EC) or just the field
      // card's ID (sync). Since patching the doc above is async, probably we
      // should go for the async solution here...
      this.selectField(field, evt);
    }
  }

  @action selectField(field, evt) {
    if (field && field.isDestroyed) {
      return;
    }

    // Toggling the selected field in tests is baffling me, using something more brute force
    if (environment === 'test' && this.selectedField.name === field.name) {
      return;
    }

    // we have to focus the clicked element to take focus away from the card.
    // to do that we have to give the element tabindex = 0 temporarily.
    // but if the element already has a tabindex (i.e. an input), we need
    // to make sure not to clobber it's original tabindex
    let tabIndex = evt.target.tabIndex;
    if (tabIndex === -1) {
      evt.target.tabIndex = 0;
      evt.target.focus();
      evt.target.blur();
      evt.target.tabIndex = tabIndex;
    } else {
      evt.target.focus();
    }

    this.selectedField = field;
    // I'm treating both the selectedField and the selectedFieldName separately
    // because renaming a field creates a whole new field instance, which has
    // some really awkward animation side effects--so renamed fields still
    // operate against the older field instance (from before the rename). This
    // is _not_ ideal.... A better approach would be to use a modal to prompt a
    // user for the field name when they change it. Then things would look much
    // more consistent when the new field is instantiated.
    this.selectedFieldName = null;
    this.cardSelected = false;
    this.loadSelectedField.perform();
  }

  @action startDragging(field, evt) {
    evt.dataTransfer.setData('text', evt.target.id);
    evt.dataTransfer.setData('text/cardId', field.canonicalURL);
  }
}

function queryablePromise(promise) {
  if (promise.isResolved) return promise;

  let isPending = true;
  let isRejected = false;
  let isFulfilled = false;

  let result = promise.then(
    resolve => {
      isFulfilled = true;
      isPending = false;
      return resolve;
    },
    reject => {
      isRejected = true;
      isPending = false;
      throw reject;
    }
  );

  result.isFulfilled = function() {
    return isFulfilled;
  };
  result.isPending = function() {
    return isPending;
  };
  result.isRejected = function() {
    return isRejected;
  };
  return result;
}
