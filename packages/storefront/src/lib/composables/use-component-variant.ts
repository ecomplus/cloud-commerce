import { computed } from 'vue';

const useComponentVariant = (props: Record<string, any>) => {
  return computed(() => {
    let variantName = '';
    Object.keys(props).forEach((prop) => {
      if (props[prop] === true) {
        variantName += ` ${prop.replace(/^(is|has)/, '')}`;
      }
    });
    return variantName.slice(1);
  });
};

export default useComponentVariant;
