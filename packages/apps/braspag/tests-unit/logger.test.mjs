import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

/*
 * `lib-mjs` is plain JS, out of the type check: a logger method the platform
 * doesn't have only fails at runtime. `logger.debug` on the SOP token threw on
 * every `list_payments` and took the credit card off checkout (v2.65.1).
 */
const readFile = (url) => fs.readFileSync(fileURLToPath(new URL(url, import.meta.url)), 'utf8');

const platformLoggerMethods = () => {
  const source = readFile('../../../firebase/src/config.ts');
  const block = source.slice(source.indexOf('export const logger = {'));
  const methods = [...block.slice(0, block.indexOf('\n};')).matchAll(/^ {2}(\w+)\(/gm)]
    .map(([, method]) => method);
  // `logger.log` is set as an alias of `info` right after the object
  return [...methods, 'log'];
};

const listFiles = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .flatMap((entry) => {
    const filePath = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(filePath) : [filePath];
  })
  .filter((filePath) => filePath.endsWith('.mjs'));

test('app code only calls methods the platform logger has', () => {
  const methods = platformLoggerMethods();
  assert.ok(methods.includes('info') && methods.includes('error'), methods.join());
  const libDir = fileURLToPath(new URL('../lib-mjs', import.meta.url));
  const calls = listFiles(libDir).flatMap((filePath) => {
    return [...fs.readFileSync(filePath, 'utf8').matchAll(/\blogger\.(\w+)\(/g)]
      .map(([, method]) => ({ file: path.relative(libDir, filePath), method }));
  });
  assert.ok(calls.length > 0, 'no logger calls found');
  assert.deepStrictEqual(calls.filter(({ method }) => !methods.includes(method)), []);
});
