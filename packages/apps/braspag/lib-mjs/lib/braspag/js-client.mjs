import fs from 'node:fs';
import { join as joinPath } from 'node:path';
import url from 'node:url';

const packageDir = url.fileURLToPath(new URL('../../../', import.meta.url));

/**
 * Modules API schema limit for `js_client.onload_expression`, from
 * `packages/modules/schemas/list_payments.cjs` (`js_client.onload_expression`
 * `maxLength`). Over it the response fails validation and the checkout drops
 * every Braspag method, Pix and billet included.
 */
export const ONLOAD_EXPRESSION_MAX_LENGTH = 3000;

const { version } = JSON.parse(fs.readFileSync(joinPath(packageDir, 'package.json'), 'utf8'));
const majorVersion = version.split('.')[0];

/**
 * Card client published with this package (`assets/` is in `files`), pinned
 * to the major version: a fix on the card client reaches the stores without
 * waiting for each one to update the app. Within a major, the `window`
 * variables and the card hash format are a browser/server contract, see the
 * header of `assets/braspag-card-client.js`.
 * `BRASPAG_CARD_CLIENT_URI` replaces it to test unreleased code, e.g.
 * `https://cdn.jsdelivr.net/gh/ecomplus/cloud-commerce@<commit>/packages/apps/braspag/assets/braspag-card-client.js`.
 */
export const CARD_CLIENT_URI = process.env.BRASPAG_CARD_CLIENT_URI || (
  'https://cdn.jsdelivr.net/npm/'
  + `@cloudcommerce/app-braspag@${majorVersion}/assets/braspag-card-client.min.js`
);

let loaderScript;
const readLoaderScript = () => {
  if (!loaderScript) {
    loaderScript = fs.readFileSync(
      joinPath(packageDir, 'assets/braspag-onload-expression.min.js'),
      'utf8',
    );
  }
  return loaderScript;
};

/**
 * `window` variables read by the card client, followed by its loader.
 * `undefined` vars are skipped, `null` ones are written: they reset leftovers
 * from a previous `list_payments` response on the same page.
 */
export const getOnloadExpression = (vars, loader = readLoaderScript()) => {
  const allVars = { _braspagCardClientUri: CARD_CLIENT_URI, ...vars };
  return Object.keys(allVars)
    .filter((key) => allVars[key] !== undefined)
    .map((key) => `window.${key}=${JSON.stringify(allVars[key])};`)
    .join('') + loader;
};

/**
 * A requote may come without 3DS (token failed, or over the limit with
 * optional 3DS) after a response with it: the old `_braspag3ds*` must be
 * cleared, or the card client would try the 3DS with a stale token and wait
 * for it until the timeout.
 */
const RESET_3DS_VARS = {
  _braspag3dsToken: null,
  _braspag3dsIsSandbox: null,
  _braspag3dsRequired: null,
  _braspag3dsTimeout: null,
};

/**
 * Expression with 3DS when it fits the limit. Otherwise without 3DS if it's
 * optional, or `null` to unlist the credit card: never let the card script
 * take Pix and billet down with it.
 */
export const fitOnloadExpression = ({
  vars,
  vars3ds,
  isRequired3ds,
  loader,
}) => {
  if (vars3ds) {
    const expression = getOnloadExpression({ ...vars3ds, ...vars }, loader);
    if (expression.length <= ONLOAD_EXPRESSION_MAX_LENGTH) {
      return { expression, has3ds: true };
    }
    if (isRequired3ds) {
      return { expression: null, has3ds: false };
    }
  }
  const expression = getOnloadExpression({ ...RESET_3DS_VARS, ...vars }, loader);
  return {
    expression: expression.length <= ONLOAD_EXPRESSION_MAX_LENGTH ? expression : null,
    has3ds: false,
  };
};
