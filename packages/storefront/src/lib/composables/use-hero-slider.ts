import type { Props as UseBannerProps } from '@@sf/composables/use-banner';
import { computed } from 'vue';
import useBanner from '@@sf/composables/use-banner';

export interface Props {
  autoplay?: number;
  slides: Array<UseBannerProps>;
}

const useHeroSlider = (props: Props) => {
  const parsedSlides = computed(() => {
    return props.slides.map((slide) => {
      return {
        ...slide,
        ...useBanner(slide),
      };
    });
  });
  return {
    parsedSlides,
  };
};

export default useHeroSlider;

export { useHeroSlider };
