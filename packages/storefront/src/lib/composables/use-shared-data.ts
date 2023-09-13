import { EventEmitter } from 'node:events';

export interface Props {
  field: string;
  value?: any;
  timeout?: number;
}

const emitter = new EventEmitter();

const useSharedData = async ({ field, value, timeout = 1000 }: Props) => {
  const $data = global.$storefront.data;
  if (value) {
    $data[field] = value;
    emitter.emit(field, value);
  } else if ($data[field]) {
    value = $data[field];
  } else {
    value = await new Promise((resolve) => {
      const callback = (_value: any) => {
        resolve(_value);
        // eslint-disable-next-line no-use-before-define
        clearTimeout(timer);
      };
      const abort = () => {
        resolve(null);
        emitter.removeListener(field, callback);
      };
      const timer = setTimeout(abort, timeout);
      emitter.once(field, callback);
    });
  }
  return {
    value,
    inlineClientJS: `
window.$storefront.data['${field}'] = ${JSON.stringify(value)};`,
  };
};

export default useSharedData;

export { useSharedData };
