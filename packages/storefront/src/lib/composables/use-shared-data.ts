import type { Categories, Brands } from '@cloudcommerce/api/types';
import { EventEmitter } from 'node:events';

export type Props<T extends string = string> = {
  field: T;
  value?: T extends 'categories' ? Partial<Categories>[]
    : T extends 'brands' ? Partial<Brands>[]
    : any;
  timeout?: number;
}

const emitter = new EventEmitter();

const useSharedData = async <T extends string = string>(props: Props<T>) => {
  const { field, timeout = 1000 } = props;
  let value: typeof props.value | null = props.value;
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
    getInlineClientJS: () => `
window.$storefront.data['${field}'] = ${JSON.stringify(value)};
window.dispatchEvent(new Event('storefront:data:${field}'));`,
  };
};

export default useSharedData;

export { useSharedData };
