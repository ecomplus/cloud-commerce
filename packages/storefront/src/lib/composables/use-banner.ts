import type { InferInput } from 'valibot';
import { computed } from 'vue';
import { looseObject, string, optional } from 'valibot';
import { parseShippingPhrase } from '@@sf/state/modules-info';

export const BannerProps = looseObject({
  img: optional(string()),
  alt: optional(string()),
  mobileImg: optional(string()),
  href: optional(string()),
  title: optional(string()),
  subtitle: optional(string()),
  buttonLink: optional(string()),
  buttonText: optional(string()),
});

export type Props = InferInput<typeof BannerProps>;

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
