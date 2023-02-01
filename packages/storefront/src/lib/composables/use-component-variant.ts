import { computed } from 'vue';

const useComponentVariant = (props: Record<string, any>, stringProps?: string[]) => {
  return computed(() => {
    let variantName = '';
    Object.keys(props).forEach((prop) => {
      if (props[prop] === true && prop !== 'modelValue') {
        variantName += ` ${prop.replace(/^(is|has)/, '')}`;
      } else if (stringProps && stringProps.includes(prop)) {
        variantName += ` ${prop}:${props[prop]}`;
      }
    });
    return variantName.slice(1);
  });
};

export default useComponentVariant;
