import assert from 'node:assert';
import fs from 'node:fs';
import test, { describe } from 'node:test';
import vm from 'node:vm';
// eslint-disable-next-line import/no-extraneous-dependencies
import { minify } from 'uglify-js';
import {
  CARD_CLIENT_URI,
  ONLOAD_EXPRESSION_MAX_LENGTH,
  fitOnloadExpression,
} from '../lib-mjs/lib/braspag/js-client.mjs';

const readFile = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const { version } = JSON.parse(readFile('../package.json'));
// Same minification as the build (scripts/assets-minification.mjs)
const loader = minify(readFile('../assets/braspag-onload-expression.js')).code;

const vars = {
  _braspagAccessToken: 'a'.repeat(200),
  _braspagIsSandbox: false,
  _braspagFingerprintApp: 'f'.repeat(64),
};
// Production 3DS token measured on 2026-10-13: 1226 characters
const vars3ds = (tokenLength, isRequired = true) => ({
  _braspag3dsToken: 't'.repeat(tokenLength),
  _braspag3dsIsSandbox: false,
  _braspag3dsRequired: isRequired,
  _braspag3dsTimeout: 300000,
});

describe('Card script on checkout', () => {
  test('card client pinned to the package major version on jsDelivr', () => {
    const major = version.split('.')[0];
    assert.strictEqual(
      CARD_CLIENT_URI,
      `https://cdn.jsdelivr.net/npm/@cloudcommerce/app-braspag@${major}/assets/braspag-card-client.min.js`,
    );
  });

  test('fits the Modules API limit with a 3DS token bigger than the production one', () => {
    const { expression, has3ds } = fitOnloadExpression({
      vars, vars3ds: vars3ds(1600), isRequired3ds: true, loader,
    });
    assert.strictEqual(has3ds, true);
    assert.ok(expression.length <= ONLOAD_EXPRESSION_MAX_LENGTH, `${expression.length} characters`);
    assert.ok(expression.includes('t'.repeat(1600)));
    assert.ok(expression.endsWith(loader));
  });

  test('optional 3DS over the limit: card listed without 3DS, stale vars reset', () => {
    const { expression, has3ds } = fitOnloadExpression({
      vars, vars3ds: vars3ds(3000, false), isRequired3ds: false, loader,
    });
    assert.strictEqual(has3ds, false);
    assert.ok(expression.length <= ONLOAD_EXPRESSION_MAX_LENGTH);
    assert.ok(!expression.includes('t'.repeat(100)));
    // A previous response with 3DS may have set the `window` vars already:
    // the card client must not try the 3DS with a stale token
    assert.ok(expression.includes('window._braspag3dsToken=null;'));
    assert.ok(expression.includes('window._braspag3dsRequired=null;'));
  });

  test('required 3DS over the limit: card unlisted, never an invalid response', () => {
    const { expression } = fitOnloadExpression({
      vars, vars3ds: vars3ds(3000), isRequired3ds: true, loader,
    });
    assert.strictEqual(expression, null);
  });

  test('variables are set as valid JS, unset ones skipped', () => {
    const { expression } = fitOnloadExpression({
      vars: { _braspagAccessToken: 'a"b', _braspagFingerprintApp: undefined },
      loader: '',
    });
    const window = {};
    vm.runInNewContext(expression, { window });
    assert.strictEqual(window._braspagAccessToken, 'a"b');
    assert.strictEqual(window._braspagCardClientUri, CARD_CLIENT_URI);
    assert.ok(!('_braspagFingerprintApp' in window));
  });
});
