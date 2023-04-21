import type { PageContext } from '@@sf/ssr-context';
import type { CmsLayout } from '@@sf/cms';
import type { Props as PitchBarProps } from '@@sf/composables/use-pitch-bar';
import type { Props as UseShopHeaderProps } from '@@sf/composables/use-shop-header';

type ShopHeaderProps = Omit<UseShopHeaderProps, 'header'> & {
  serviceLinks?: CmsLayout['service_links'],
};

export interface Props {
  pageContext: PageContext;
}

const usePageLayout = async ({ pageContext }: Props) => {
  const { apiState, cms } = pageContext;
  const {
    header: cmsHeader,
    service_links: cmsServiceLinks,
  } = await cms('layout');
  const pitchBar: PitchBarProps = { slides: [] };
  if (cmsHeader?.pitch_bar) {
    pitchBar.slides = cmsHeader.pitch_bar;
  }
  const shopHeader: ShopHeaderProps = {
    categories: apiState.categories || [],
    menuCategorySlugs: cmsHeader.inline_menu_categories?.featured,
    menuRandomCategories: cmsHeader.inline_menu_categories?.random,
    isAlphabeticalSortSubmenu: cmsHeader.alphabetical_sort_submenu,
    serviceLinks: cmsServiceLinks,
  };
  return {
    pitchBar,
    shopHeader,
  };
};

export default usePageLayout;

export { usePageLayout };

export type { PitchBarProps, ShopHeaderProps };
