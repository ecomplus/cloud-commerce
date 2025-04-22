import mitt from 'mitt';

export const initEmitter = mitt();

export default initEmitter;

const storefrontInitEv = 'storefront';
let isStorefrontInitSent = false;
initEmitter.on(storefrontInitEv, () => {
  isStorefrontInitSent = true;
});

export const emitStorefrontInit = () => {
  initEmitter.emit(storefrontInitEv);
};

export const onStorefrontInit = (callback: () => void) => {
  if (isStorefrontInitSent) {
    callback();
    return;
  }
  const cb = function cb() {
    callback();
    initEmitter.off(storefrontInitEv, cb);
  };
  initEmitter.on(storefrontInitEv, cb);
};
