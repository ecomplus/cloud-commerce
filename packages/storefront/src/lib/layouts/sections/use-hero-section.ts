import type { RouteContext } from '@@sf/ssr-context';
import type { PageContent } from '@@sf/content';
import type { Props as UseHeroSliderProps } from '@@sf/composables/use-hero-slider';

export type HeroSliderProps = Omit<UseHeroSliderProps, 'slides'> & {
  slides: Array<Omit<UseHeroSliderProps['slides'][0], 'img'> & { img: string }>,
};

export interface Props {
  routeContext: RouteContext;
}

const useHeroSection = async ({ routeContext }: Props) => {
  const { cmsContent } = routeContext;
  const heroSlider: HeroSliderProps = { slides: [] };
  const heroContent: PageContent['hero'] | undefined = cmsContent?.hero;
  if (heroContent) {
    heroSlider.autoplay = heroContent.autoplay;
    const now = Date.now();
    heroContent.slides?.forEach(({
      img,
      start,
      end,
      mobile_img: mobileImg,
      button_link: buttonLink,
      button_text: buttonText,
      ...rest
    }) => {
      if (!img) return;
      if (start && new Date(start).getTime() < now) return;
      if (end && new Date(end).getTime() > now) return;
      heroSlider.slides.push({
        ...rest,
        img,
        mobileImg,
        buttonLink,
        buttonText,
      });
    });
  }
  return {
    heroSlider,
  };
};

export default useHeroSection;

export { useHeroSection };
