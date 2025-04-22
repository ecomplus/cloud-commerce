import { EventEmitter } from 'node:events';

export const initEmitter = new EventEmitter();

export default initEmitter;

const storefrontInitEv = 'storefront';

export const emitStorefrontInit = () => initEmitter.emit(storefrontInitEv);

export const onStorefrontInit = (callback: () => void) => {
  initEmitter.once(storefrontInitEv, callback);
};
