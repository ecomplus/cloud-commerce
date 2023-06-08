import type { RouteContext } from '@@sf/ssr-context';
import useHeroSection from '@@sf/layouts/sections/use-hero-section';

export interface Props {
  routeContext: RouteContext;
}

const useHomeMain = async ({ routeContext }: Props) => {
  return {
    ...(await useHeroSection({ routeContext })),
  };
};

export default useHomeMain;

export { useHomeMain };
