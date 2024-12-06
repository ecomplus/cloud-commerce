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
  buttonText?: string;
  buttonLink?: string;
}

export const bannerCmsFields = ({
  img: {
    widget: 'image',
    label: { pt: 'Imagem', en: 'Image' },
  },
  alt: {
    widget: 'string',
    label: { pt: 'Texto alternativo', en: 'Alt text' },
  },
  mobileImg: {
    widget: 'image',
    label: { pt: 'Imagem em celular', en: 'Mobile image' },
  },
  href: {
    widget: 'string',
    label: { pt: 'Link no banner', en: 'Link in banner' },
  },
  title: {
    widget: 'string',
    label: { pt: 'Título sobreposto', en: 'Overlapping title' },
  },
  subtitle: {
    widget: 'string',
    label: { pt: 'Subtítulo', en: 'Subtitle' },
  },
  buttonText: {
    widget: 'string',
    label: { pt: 'Botão', en: 'Button' },
  },
  buttonLink: {
    widget: 'number',
    label: { pt: 'Link do botão', en: 'Button link' },
  },
}) as const;

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
