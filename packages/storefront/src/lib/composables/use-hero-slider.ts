import { computed } from 'vue';
import { parseShippingPhrase } from '@@sf/state/modules-info';

export interface Props {
  autoplay?: number;
  slides: Array<{
    img?: string;
    alt?: string;
    mobileImg?: string;
    href?: string;
    title?: string;
    subtitle?: string;
    buttonLink?: string;
    buttonText?: string;
  }>;
}

const useHeroSlider = (props: Props) => {
  const parsedSlides = computed(() => {
    return props.slides.map((slide) => {
      const title = slide.title
        ? parseShippingPhrase(slide.title).value : '';
      const subtitle = slide.subtitle
        ? parseShippingPhrase(slide.subtitle).value : '';
      const buttonText = slide.buttonText
        ? parseShippingPhrase(slide.buttonText).value : '';
      return {
        ...slide,
        hasHeader: Boolean(title || subtitle || buttonText),
      };
    });
  });
  return {
    parsedSlides,
  };
};

export default useHeroSlider;

export { useHeroSlider };
