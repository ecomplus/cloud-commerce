import type { PageContext } from '@@sf/ssr-context';
import type { CmsHome } from '@@sf/cms';
import type { Props as UseHeroSliderProps } from '@@sf/composables/use-hero-slider';

export type HeroSliderProps = Omit<UseHeroSliderProps, 'slides'> & {
  slides: Array<Omit<UseHeroSliderProps['slides'][0], 'img'> & { img: string }>,
};

export interface Props {
  pageContext: PageContext;
}

const useHeroSection = async ({ pageContext }: Props) => {
  const { cmsContent } = pageContext;
  const heroSlider: HeroSliderProps = { slides: [] };
  const cmsHero: CmsHome['hero'] | undefined = cmsContent?.hero;
  if (cmsHero) {
    heroSlider.autoplay = cmsHero.autoplay;
    const now = Date.now();
    cmsHero.slides?.forEach(({
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
