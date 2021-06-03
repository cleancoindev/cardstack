import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupCardMocking from '../helpers/card-mocking';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { templateOnlyComponentTemplate } from '@cardstack/core/tests/helpers/templates';
import click from '@ember/test-helpers/dom/click';

const EDIT = '[data-test-edit-button]';
const MODAL = '[data-test-modal]';

module('Acceptance | Card Editing', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupCardMocking(hooks, { routingCard: 'https://mirage/cards/my-routes' });
  let personURL = 'https://mirage/cards/person';

  hooks.beforeEach(function () {
    this.createCard({
      url: 'https://mirage/cards/my-routes',
      schema: 'schema.js',
      files: {
        'schema.js': `
          export default class MyRoutes {
            routeTo(path) {
              if (path === '/person') {
                return '${personURL}';
              }
            }
          }`,
      },
    });

    this.createCard({
      url: personURL,
      schema: 'schema.js',
      isolated: 'isolated.js',
      data: {
        name: 'Arthur',
      },
      files: {
        'schema.js': `
          import { contains } from "@cardstack/types";
          import './isolated.css'
          import string from "https://cardstack.com/base/string";
          export default class Person {
            @contains(string)
            name;
          }`,
        'isolated.js': templateOnlyComponentTemplate(
          `<div class="person-isolated" data-test-person>Hi! I am <@fields.name/></div>`,
          { IsolatedStyles: './isolated.css' }
        ),
        'isolated.css': '.person-isolated { background: red }',
      },
    });
  });

  test('Editing a card', async function (assert) {
    await visit('/person');
    assert.equal(currentURL(), '/person');
    await click(EDIT);
    assert.dom(MODAL).exists();
    await this.pauseTest();
    // TODO: Change form input
    // TODO: Click Save
    // TODO: Assert mirage endpoint hit with correct payload
    // TODO: Assert modal closes and isolated view has correct content
  });
});
