import type { Ref } from 'vue';
import type { CategoriesList } from '@cloudcommerce/api/types';
import type { CmsHeader } from '@@sf/cms';
import { ref, computed } from 'vue';
import useStickyHeader from '@@sf/composables/use-sticky-header';

export interface Props {
  header: Ref<HTMLElement>;
  categories: CategoriesList;
  cmsHeader?: CmsHeader;
}

type CategoryTree = CategoriesList[0] & {
  subcategories: Array<CategoryTree>,
};

const filterMainCategories = (
  categories: CategoriesList,
  featuredSlugs?: string[],
) => {
  const mainCategories = categories.filter(({ slug, parent }) => {
    return slug && !parent;
  });
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
  categories: CategoriesList,
  parentCategory: CategoriesList[0],
  isAlphabeticalSort = false,
) => {
  const subcategories = categories.filter(({ slug, parent }) => {
    if (slug && parent) {
      return parent._id === parentCategory._id
        || (parent.slug && parent.slug === parentCategory.slug);
    }
    return false;
  });
  if (isAlphabeticalSort) {
    subcategories.sort((a, b) => {
      if (a.name < b.name) return -1;
      return 1;
    });
  }
  return subcategories;
};

const useShopHeader = (props: Props) => {
  const { header } = props;
  const {
    isSticky,
    staticHeight,
    staticY,
  } = useStickyHeader({ header });
  const positionY = computed(() => {
    return isSticky.value ? header.value.offsetHeight : staticY.value;
  });
  const categoriesList = props.cmsHeader?.categories_list;
  const mainCategories = filterMainCategories(props.categories, categoriesList?.featured);
  const getSubcategories = (parentCategory: CategoriesList[0]) => {
    return filterSubcategories(
      props.categories,
      parentCategory,
      !!props.cmsHeader?.alphabetical_order_submenu,
    );
  };
  const getCategoryTree = (parentCategory: CategoriesList[0]): CategoryTree => {
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
    if (categoriesList?.featured.includes(slug)) {
      return true;
    }
    if (countRandom < categoriesList?.random) {
      countRandom += 1;
      return true;
    }
    return false;
  });
  const isSidenavOpen = ref(false);
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
    isSidenavOpen,
  };
};

export default useShopHeader;

export {
  useShopHeader,
  filterMainCategories,
  filterSubcategories,
};

export type { CategoryTree };
