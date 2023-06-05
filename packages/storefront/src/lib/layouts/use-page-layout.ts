import type { RouteContext } from '@@sf/ssr-context';
import type { LayoutContent } from '@@sf/content';
import type { Props as UseShopHeaderProps } from '@@sf/composables/use-shop-header';
import { parseLayoutContent } from '@@sf/composables/use-pitch-bar';

type ShopHeaderProps = Omit<UseShopHeaderProps, 'header'> & {
  serviceLinks?: LayoutContent['service_links'],
};

export interface Props {
  routeContext: RouteContext;
}

const usePageLayout = async ({ routeContext }: Props) => {
  const { apiState, getContent } = routeContext;
  const layoutContent = await getContent('layout');
  const {
    header: headerContent,
    service_links: serviceLinks,
  } = layoutContent;
  const pitchBar = parseLayoutContent(layoutContent);
  const shopHeader: ShopHeaderProps = {
    categories: apiState.categories || [],
    menuCategorySlugs: headerContent.inline_menu_categories?.featured,
    menuRandomCategories: headerContent.inline_menu_categories?.random,
    isAlphabeticalSortSubmenu: headerContent.alphabetical_sort_submenu,
    serviceLinks,
  };
  return {
    pitchBar,
    shopHeader,
  };
};

export default usePageLayout;

export { usePageLayout };

export type { ShopHeaderProps };
