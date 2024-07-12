import { computed } from 'vue';
import { parseShippingPhrase } from '@@sf/state/modules-info';

/* Can't generate props type from CMS fields (`InferCmsOutput`) while
https://github.com/vuejs/core/issues/8286#issuecomment-1545659320 */
export type Props = {
  img?: string;
  alt?: string;
  mobileImg?: string;
  href?: string;
  title?: string;
  subtitle?: string;
  buttonLink?: string;
  buttonText?: string;
}

export const useBanner = (props: Props) => {
  const parsedTitle = computed(() => {
    return props.title ? parseShippingPhrase(props.title).value : '';
  });
  const parsedSubtitle = computed(() => {
    return props.subtitle ? parseShippingPhrase(props.subtitle).value : '';
  });
  const parsedButtonText = computed(() => {
    return props.buttonText ? parseShippingPhrase(props.buttonText).value : '';
  });
  const hasHeader = computed(() => {
    return Boolean(parsedTitle.value || parsedSubtitle.value || parsedButtonText.value);
  });
  return {
    parsedTitle,
    parsedSubtitle,
    parsedButtonText,
    hasHeader,
  };
};

export default useBanner;
