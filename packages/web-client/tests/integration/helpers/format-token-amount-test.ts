import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { toWei, toBN } from 'web3-utils';

module('Integration | Helper | format-token-amount', function (hooks) {
  setupRenderingTest(hooks);

  test('It should return a precise value up to 18 decimals', async function (assert) {
    this.set('inputValue', toBN('123456789123456789'));
    await render(hbs`{{format-token-amount this.inputValue}}`);
    assert.dom(this.element).hasText('0.123456789123456789');
  });

  test('It should add zeros to fulfil the required precision', async function (assert) {
    this.set('inputValue', toWei(toBN('1')));
    this.set('minPrecision', 1);
    await render(
      hbs`{{format-token-amount this.inputValue this.minPrecision}}`
    );
    assert.dom(this.element).hasText('1.0');

    this.set('minPrecision', 2);
    assert.dom(this.element).hasText('1.00');
  });

  test('It should respect existing non-zero floating decimals when adding zeros', async function (assert) {
    // 1.1
    this.set('inputValue', toWei(toBN('11')).div(toBN('10')));
    this.set('minPrecision', 3);
    await render(
      hbs`{{format-token-amount this.inputValue this.minPrecision}}`
    );
    assert.dom(this.element).hasText('1.100');

    // 1.11
    this.set('inputValue', toWei(toBN('111')).div(toBN('100')));
    assert.dom(this.element).hasText('1.110');
  });

  test('It should have a minPrecision of 2 by default', async function (assert) {
    this.set('inputValue', toWei(toBN('1')));
    await render(hbs`{{format-token-amount this.inputValue}}`);

    assert.dom(this.element).hasText('1.00');
  });

  test('It should have a minPrecision of 2 if an invalid minPrecision is provided', async function (assert) {
    this.set('inputValue', toWei(toBN('1')));
    this.set('minPrecision', 'beep');
    await render(
      hbs`{{format-token-amount this.inputValue this.minPrecision}}`
    );

    assert.dom(this.element).hasText('1.00');

    this.set('minPrecision', -30);
    assert.dom(this.element).hasText('1.00');
  });

  test('It should not add floating zeros if minPrecision is 0', async function (assert) {
    this.set('inputValue', toWei(toBN('1')));
    this.set('minPrecision', 0);
    await render(
      hbs`{{format-token-amount this.inputValue this.minPrecision}}`
    );
    assert.dom(this.element).hasText('1');
  });
});
