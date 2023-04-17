import type { PageContext } from '@@sf/ssr-context';
import useHeroSection from '@@sf/layouts/sections/use-hero-section';

export interface Props {
  pageContext: PageContext;
}

const useHomeMain = async ({ pageContext }: Props) => {
  return {
    ...(await useHeroSection({ pageContext })),
  };
};

export default useHomeMain;

export { useHomeMain };
