import { EventEmitter } from 'node:events';

export interface Props {
  field: string;
  value?: any;
}

const emitter = new EventEmitter();

const useSharedData = async ({ field, value }: Props) => {
  const $data = global.$storefront.data;
  if (value) {
    $data[field] = value;
    emitter.emit(field, value);
  } else if ($data[field]) {
    value = $data[field];
  } else {
    value = await new Promise((resolve) => {
      emitter.once(field, resolve);
    });
  }
  return {
    value,
    inlineClientJS: `
window.$storefront.data['${field}'] = ${JSON.stringify(value)};`,
  };
};

export default useSharedData;

export {
  useSharedData,
};
