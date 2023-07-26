export interface Props {
  field: string;
  value: any;
}

const useSharedData = ({ field, value }: Props) => {
  global.$storefront.data[field] = value;
  return {
    inlineClientJS: `
window.$storefront.data['${field}'] = ${JSON.stringify(value)};`,
  };
};

export default useSharedData;

export {
  useSharedData,
};
