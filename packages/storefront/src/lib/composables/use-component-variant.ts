import { computed } from 'vue';

export default (props: Record<string, any>) => {
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
