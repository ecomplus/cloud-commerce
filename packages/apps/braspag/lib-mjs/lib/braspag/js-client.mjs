import fs from 'node:fs';
import { join as joinPath } from 'node:path';
import url from 'node:url';

const packageDir = url.fileURLToPath(new URL('../../../', import.meta.url));

/**
 * Modules API schema limit for `js_client.onload_expression`. Over it the
 * response fails validation and the checkout drops every Braspag method,
 * Pix and billet included.
 */
export const ONLOAD_EXPRESSION_MAX_LENGTH = 3000;

const { version } = JSON.parse(fs.readFileSync(joinPath(packageDir, 'package.json'), 'utf8'));

/**
 * Card client published with this package (`assets/` is in `files`), pinned
 * to the running version so browser and server code always match.
 * `BRASPAG_CARD_CLIENT_URI` replaces it to test unreleased code, e.g.
 * `https://cdn.jsdelivr.net/gh/ecomplus/cloud-commerce@<commit>/packages/apps/braspag/assets/braspag-card-client.js`.
 */
export const CARD_CLIENT_URI = process.env.BRASPAG_CARD_CLIENT_URI || (
  'https://cdn.jsdelivr.net/npm/'
  + `@cloudcommerce/app-braspag@${version}/assets/braspag-card-client.min.js`
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
 */
export const getOnloadExpression = (vars, loader = readLoaderScript()) => {
  const allVars = { _braspagCardClientUri: CARD_CLIENT_URI, ...vars };
  return Object.keys(allVars)
    .filter((key) => allVars[key] !== undefined && allVars[key] !== null)
    .map((key) => `window.${key}=${JSON.stringify(allVars[key])};`)
    .join('') + loader;
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
  const expression = getOnloadExpression(vars, loader);
  return {
    expression: expression.length <= ONLOAD_EXPRESSION_MAX_LENGTH ? expression : null,
    has3ds: false,
  };
};
