import { module, test } from 'qunit';
import { click, find, visit, currentURL, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import Fixtures from '@cardstack/test-support/fixtures'
import { setFieldValue, createCards } from '../helpers/card-helpers';
import { setupMockUser, login } from '../helpers/login';

const timeout = 5000;
const card1Id = 'millenial-puppies';
const qualifiedCard1Id = `local-hub::${card1Id}`;
const card2Id = 'van-gogh';
const qualifiedCard2Id = `local-hub::${card2Id}`;
const card3Id = 'hassan';
const qualifiedCard3Id = `local-hub::${card3Id}`;

const scenario = new Fixtures({
  create(factory) {
    setupMockUser(factory);
  },
  destroy() {
    return [
      { type: 'cards', id: qualifiedCard1Id },
      { type: 'cards', id: qualifiedCard2Id },
      { type: 'cards', id: qualifiedCard3Id },
    ];
  }
});

module('Acceptance | card edit', function(hooks) {
  setupApplicationTest(hooks);
  scenario.setupTest(hooks);

  test(`setting a string field`, async function(assert) {
    await login();
    await createCards({
      [card1Id]: [
        ['body', 'string', false, 'test body']
      ]
    });
    await visit(`/cards/${card1Id}/edit`);
    assert.equal(currentURL(), `/cards/${card1Id}/edit`);

    await setFieldValue('body', 'updated body');

    await click('[data-test-card-editor-save-btn]');
    await waitFor(`[data-test-card-view="${card1Id}"]`, { timeout });

    assert.equal(currentURL(), `/cards/${card1Id}`);
    assert.dom('[data-test-field="body"] [data-test-string-field-viewer-value]').hasText(`updated body`);

    let card = JSON.parse(find('.code-block').textContent);
    assert.equal(card.data.attributes.body, `updated body`);
  });

  test('setting a case-insensitive field', async function(assert) {
    await login();
    await createCards({
      [card1Id]: [
        ['email', 'case-insensitive string', false, 'vangogh@nowhere.dog']
      ]
    });
    await visit(`/cards/${card1Id}/edit`);
    assert.equal(currentURL(), `/cards/${card1Id}/edit`);

    await setFieldValue('email', 'hassan@nowhere.dog');

    await click('[data-test-card-editor-save-btn]');
    await waitFor(`[data-test-card-view="${card1Id}"]`, { timeout });

    assert.equal(currentURL(), `/cards/${card1Id}`);
    assert.dom('[data-test-field="email"] [data-test-case-insensitive-field-viewer-value]').hasText(`hassan@nowhere.dog`);

    let card = JSON.parse(find('.code-block').textContent);
    assert.equal(card.data.attributes.email, `hassan@nowhere.dog`);
  });

  test('setting a date field', async function(assert) {
    await login();
    await createCards({
      [card1Id]: [
        ['created', 'date', false, '2019-10-07']
      ]
    });
    await visit(`/cards/${card1Id}/edit`);
    assert.equal(currentURL(), `/cards/${card1Id}/edit`);

    await setFieldValue('created', '2019-10-08');

    await click('[data-test-card-editor-save-btn]');
    await waitFor(`[data-test-card-view="${card1Id}"]`, { timeout });

    assert.equal(currentURL(), `/cards/${card1Id}`);
    assert.dom('[data-test-field="created"] [data-test-date-field-viewer-value]').hasText(`2019-10-08`);

    let card = JSON.parse(find('.code-block').textContent);
    assert.equal(card.data.attributes.created, `2019-10-08`);
  });

  test('setting an integer field', async function(assert) {
    await login();
    await createCards({
      [card1Id]: [
        ['likes', 'integer', false, 100]
      ]
    });
    await visit(`/cards/${card1Id}/edit`);
    assert.equal(currentURL(), `/cards/${card1Id}/edit`);

    await setFieldValue('likes', 110);

    await click('[data-test-card-editor-save-btn]');
    await waitFor(`[data-test-card-view="${card1Id}"]`, { timeout });

    assert.equal(currentURL(), `/cards/${card1Id}`);
    assert.dom('[data-test-field="likes"] [data-test-integer-field-viewer-value]').hasText(`110`);

    let card = JSON.parse(find('.code-block').textContent);
    assert.equal(card.data.attributes.likes, 110);
  });

  test('setting a boolean field', async function(assert) {
    await login();
    await createCards({
      [card1Id]: [
        ['published', 'boolean', false, true]
      ]
    });
    await visit(`/cards/${card1Id}/edit`);
    assert.equal(currentURL(), `/cards/${card1Id}/edit`);

    await setFieldValue('published', false);

    await click('[data-test-card-editor-save-btn]');
    await waitFor(`[data-test-card-view="${card1Id}"]`, { timeout });

    assert.equal(currentURL(), `/cards/${card1Id}`);
    assert.dom('[data-test-field="published"] [data-test-boolean-field-viewer-value]').hasText(`false`);

    let card = JSON.parse(find('.code-block').textContent);
    assert.equal(card.data.attributes.published, false);
  });

  test('setting a has-many cards field', async function(assert) {
    await login();
    await createCards({
      [card1Id]: [
        ['reviewers', 'related cards', true, `${card3Id}`],
      ],
      [card2Id]: [
        ['name', 'string', true, 'Van Gogh'],
        ['email', 'case-insensitive string', false, 'vangogh@nowhere.dog'],
      ],
      [card3Id]: [
        ['name', 'string', true, 'Hassan Abdel-Rahman'],
        ['email', 'case-insensitive string', false, 'hassan@nowhere.dog'],
      ],
    });
    await visit(`/cards/${card1Id}/edit`);

    await setFieldValue('reviewers', `${card2Id},${card3Id}`);

    await click('[data-test-card-editor-save-btn]');
    await waitFor(`[data-test-card-view="${card1Id}"]`, { timeout });

    assert.equal(currentURL(), `/cards/${card1Id}`);
    assert.dom(`[data-test-field="reviewers"] [data-test-embedded-card="${card2Id}"] [data-test-field="name"] [data-test-string-field-viewer-value]`).hasText('Van Gogh');
    assert.dom(`[data-test-field="reviewers"] [data-test-embedded-card="${card3Id}"] [data-test-field="name"] [data-test-string-field-viewer-value]`).hasText('Hassan Abdel-Rahman');
    assert.deepEqual([...document.querySelectorAll(`[data-test-field="reviewers"] [data-test-embedded-card]`)].map(i => i.getAttribute('data-test-embedded-card')), [card2Id, card3Id ]);
    assert.dom(`[data-test-field="reviewers"] [data-test-embedded-card="${card2Id}"] [data-test-field="email"]`).doesNotExist();
    assert.dom(`[data-test-field="reviewers"] [data-test-embedded-card="${card3Id}"] [data-test-field="email"]`).doesNotExist();

    let card = JSON.parse(find('.code-block').textContent);
    assert.deepEqual(card.data.relationships.reviewers.data, [{ type: 'cards', id: qualifiedCard2Id }, { type: 'cards', id: qualifiedCard3Id }]);
    let userCard1 = card.included.find(i => `${i.type}/${i.id}` === `cards/${qualifiedCard2Id}`);
    assert.equal(userCard1.attributes.name, 'Van Gogh');
    assert.equal(userCard1.attributes.email, undefined);
    let userCard2 = card.included.find(i => `${i.type}/${i.id}` === `cards/${qualifiedCard3Id}`);
    assert.equal(userCard2.attributes.name, 'Hassan Abdel-Rahman');
    assert.equal(userCard2.attributes.email, undefined);
  });

  test(`setting a belongs-to card field`, async function(assert) {
    await login();
    await createCards({
      [card1Id]: [
        ['author', 'related card', true],
      ],
      [card2Id]: [
        ['name', 'string', true, 'Van Gogh'],
        ['email', 'case-insensitive string', false, 'vangogh@nowhere.dog'],
      ]
    });
    await visit(`/cards/${card1Id}/edit`);

    await setFieldValue('author', card2Id);

    await click('[data-test-card-editor-save-btn]');
    await waitFor(`[data-test-card-view="${card1Id}"]`, { timeout });

    assert.equal(currentURL(), `/cards/${card1Id}`);
    assert.dom(`[data-test-field="author"] [data-test-embedded-card="${card2Id}"] [data-test-field="name"] [data-test-string-field-viewer-value]`).hasText('Van Gogh');
    assert.dom(`[data-test-field="author"] [data-test-embedded-card="${card2Id}"] [data-test-field="email"]`).doesNotExist();

    let card = JSON.parse(find('.code-block').textContent);
    assert.deepEqual(card.data.relationships.author.data, { type: 'cards', id: qualifiedCard2Id });
    let userCard = card.included.find(i => `${i.type}/${i.id}` === `cards/${qualifiedCard2Id}`);
    assert.equal(userCard.attributes.name, 'Van Gogh');
    assert.equal(userCard.attributes.email, undefined);
  });

  test(`deleting a card`, async function(assert) {
    await login();
    await createCards({
      [card1Id]: [
        ['body', 'string', false, 'test body']
      ]
    });
    await visit(`/cards/${card1Id}/edit`);

    await click('[data-test-card-editor-delete-btn]');
    await waitFor('a[href="/cards/new"]', { timeout });

    await visit(`/cards/${card1Id}`);
    assert.dom('h2').includesText('Not Found');
  });
});