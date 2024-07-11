import { computed } from 'vue';
import { parseShippingPhrase } from '@@sf/state/modules-info';

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

const useBanner = (props: Props) => {
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

export { useBanner };
