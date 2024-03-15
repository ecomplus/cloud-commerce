import { AsyncLocalStorage } from 'node:async_hooks';

export const asyncLocalStorage = new AsyncLocalStorage();

/* eslint-disable import/prefer-default-export */
export function onRequest(ctx, next) {
  return asyncLocalStorage.run({ sid: `${Date.now() + Math.random()}` }, next);
}
