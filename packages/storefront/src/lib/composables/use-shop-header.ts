import type { Ref } from 'vue';
import type { Categories } from '@cloudcommerce/api/types';
import { ref, computed, watch } from 'vue';
import { watchOnce } from '@vueuse/core';
import { getSearchUrl } from '@@sf/sf-lib';
import { totalItems } from '@@sf/state/shopping-cart';
import useStickyHeader from '@@sf/composables/use-sticky-header';

type PartCategory = Partial<Categories>;

export interface Props {
  header: Ref<HTMLElement | null>;
  searchInput?: Ref<HTMLInputElement | null>;
  categories?: PartCategory[];
  menuCategorySlugs?: string[];
  menuRandomCategories?: number;
  isAlphabeticalSortSubmenu?: boolean;
}

type MainCategory = PartCategory & {
  name: string,
  slug: string,
  parent: undefined,
};
type Subcategory = PartCategory & {
  name: string,
  slug: string,
  parent: Exclude<Categories['parent'], undefined>,
};

export type SubcategoryTree = Subcategory & {
  subcategories: Array<SubcategoryTree>,
};

export type CategoryTree = MainCategory & {
  subcategories: Array<SubcategoryTree>,
};

const filterMainCategories = (
  categories: PartCategory[],
  featuredSlugs?: string[],
) => {
  const mainCategories = categories.filter(({ name, slug, parent }) => {
    return name && slug && !parent;
  }) as Array<MainCategory>;
  if (featuredSlugs?.length) {
    mainCategories.sort((a, b) => {
      const indexA = featuredSlugs.indexOf(a.slug);
      const indexB = featuredSlugs.indexOf(b.slug);
      if (indexA > -1) {
        if (indexB === -1 || indexA < indexB) return -1;
        return 1;
      }
      if (indexB > -1) return 1;
      return 0;
    });
  }
  return mainCategories;
};

const filterSubcategories = (
  categories: PartCategory[],
  parentCategory: PartCategory,
  isAlphabeticalSort = false,
) => {
  const subcategories = categories.filter(({ name, slug, parent }) => {
    if (name && slug && parent) {
      return (parent._id && parent._id === parentCategory._id)
        || (parent.slug && parent.slug === parentCategory.slug);
    }
    return false;
  }) as Array<Subcategory>;
  if (isAlphabeticalSort) {
    subcategories.sort((a, b) => {
      if (a.name < b.name) return -1;
      return 1;
    });
  }
  return subcategories;
};

const useShopHeader = (props: Props) => {
  const {
    header,
    searchInput,
    categories = (globalThis.$storefront.data.categories || []) as PartCategory[],
    menuCategorySlugs,
    menuRandomCategories = 7,
    isAlphabeticalSortSubmenu,
  } = props;
  const {
    isSticky,
    staticHeight,
    staticY,
  } = useStickyHeader({ header });
  const positionY = computed(() => {
    return isSticky.value ? header.value?.offsetHeight : staticY.value;
  });
  const mainCategories = filterMainCategories(categories, menuCategorySlugs);
  const getSubcategories = (parentCategory: PartCategory) => {
    return filterSubcategories(
      categories,
      parentCategory,
      !!isAlphabeticalSortSubmenu,
    );
  };
  const getCategoryTree = <T extends PartCategory>(parentCategory: T):
  T & { subcategories: SubcategoryTree[] } => {
    return {
      ...parentCategory,
      subcategories: getSubcategories(parentCategory).map((subcategory) => {
        return getCategoryTree(subcategory);
      }),
    };
  };
  const categoryTrees = mainCategories.map(getCategoryTree);
  let countRandom = 0;
  const inlineMenuTrees = categoryTrees.filter(({ slug }) => {
    if (menuCategorySlugs?.includes(slug)) {
      return true;
    }
    if (countRandom < menuRandomCategories) {
      countRandom += 1;
      return true;
    }
    return false;
  });

  const isSearchOpen = ref(false);
  const isSearchOpenOnce = ref(false);
  watchOnce(isSearchOpen, () => {
    isSearchOpenOnce.value = true;
  });
  const searchTerm = ref('');
  const isSearchPage = !import.meta.env.SSR && /^\/s\/?/.test(window.location.pathname);
  let urlSearchQ: string | null | undefined;
  if (isSearchPage) {
    const { pathname, search } = window.location;
    urlSearchQ = new URLSearchParams(search).get('q');
    if (!urlSearchQ && pathname.startsWith('/s/')) {
      urlSearchQ = decodeURIComponent(pathname.split('/')[2]);
    }
  }
  if (typeof urlSearchQ === 'string') {
    searchTerm.value = urlSearchQ;
  }
  const quickSearchTerm = computed(() => {
    if (searchTerm.value && searchTerm.value.length >= 2
      && searchTerm.value !== urlSearchQ) {
      return searchTerm.value;
    }
    return '';
  });
  const toggleSearch = (ev: Event) => {
    ev.preventDefault();
    if (isSearchOpen.value && searchTerm.value) {
      window.location.href = getSearchUrl(searchTerm.value);
      return;
    }
    isSearchOpen.value = !isSearchOpen.value;
    if (isSearchOpen.value && searchInput) {
      setTimeout(() => {
        if (!searchInput.value) return;
        const { length } = searchTerm.value;
        searchInput.value.setSelectionRange(length, length);
        searchInput.value.focus();
      }, 50);
    }
  };
  const isCartOpen = ref(false);
  const isCartOpenOnce = ref(false);
  watchOnce(isCartOpen, () => {
    isCartOpenOnce.value = true;
  });
  const delayedCartItems = ref(0);
  const handleOnMounted = () => {
    watch(totalItems, (newTotalItems, prevTotalItems) => {
      if (typeof prevTotalItems === 'number') {
        if (prevTotalItems < newTotalItems) {
          isCartOpen.value = true;
        } else if (prevTotalItems && !newTotalItems) {
          isCartOpen.value = false;
        }
      }
      delayedCartItems.value = newTotalItems;
    }, {
      immediate: true,
    });
  };

  return {
    isSticky,
    staticHeight,
    staticY,
    positionY,
    mainCategories,
    getSubcategories,
    getCategoryTree,
    categoryTrees,
    inlineMenuTrees,
    isSearchOpen,
    isSearchOpenOnce,
    searchTerm,
    quickSearchTerm,
    toggleSearch,
    isCartOpen,
    isCartOpenOnce,
    cartTotalItems: delayedCartItems,
    handleOnMounted,
  };
};

export default useShopHeader;

export {
  useShopHeader,
  filterMainCategories,
  filterSubcategories,
};
