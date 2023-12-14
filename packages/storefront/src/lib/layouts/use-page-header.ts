import type { RouteContext } from '@@sf/ssr-context';
import type { Props as UseShopHeaderProps } from '@@sf/composables/use-shop-header';
import api from '@cloudcommerce/api';
import { useSharedData } from '@@sf/composables/use-shared-data';
import { parseLayoutContent } from '@@sf/composables/use-pitch-bar';

type ShopHeaderProps = Omit<UseShopHeaderProps, 'header'>;

export interface Props {
  routeContext: RouteContext;
  listedCategoryFields?: readonly string[] | null;
}

const usePageHeader = async ({ routeContext, listedCategoryFields }: Props) => {
  const { apiState, getContent } = routeContext;
  const layoutContent = await getContent('layout');
  const {
    header: {
      inlineMenuCategories,
      isAlphabeticalSortSubmenu,
    },
  } = layoutContent;
  const pitchBar = parseLayoutContent(layoutContent);
  let { categories } = apiState;
  if (categories) {
    useSharedData({ field: 'categories', value: categories });
  } else if (listedCategoryFields !== null) {
    try {
      categories = (await api.get('categories', {
        fields: listedCategoryFields || ([
          'name',
          'slug',
          'parent.slug',
          'icon.url',
          'icon.size',
          'pictures.0.url',
          'pictures.0.size',
        ] as const),
      })).data.result;
    } catch (err) {
      categories = [];
      console.error(err);
    }
  }
  const shopHeader: ShopHeaderProps = {
    categories,
    menuCategorySlugs: inlineMenuCategories?.featured,
    menuRandomCategories: inlineMenuCategories?.random,
    isAlphabeticalSortSubmenu,
  };
  /*
  if (import.meta.env.DEV) {
    await new Promise((resolve) => {
      setTimeout(() => {
        console.log('> This log must come after sections');
        resolve(true);
      }, 2000);
    });
  }
  */
  return {
    pitchBar,
    shopHeader,
  };
};

export default usePageHeader;

export { usePageHeader };

export type { ShopHeaderProps };
