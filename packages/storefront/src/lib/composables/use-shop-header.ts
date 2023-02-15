import type { Ref } from 'vue';
import type { CategoriesList } from '@cloudcommerce/api/types';
import { ref, computed } from 'vue';
import useStickyHeader from '@@sf/composables/use-sticky-header';

export interface Props {
  header: Ref<HTMLElement>;
  categories: CategoriesList;
}

type CategoryTree = CategoriesList[0] & {
  subcategories: Array<CategoryTree>,
};

const filterMainCategories = (categories: CategoriesList) => {
  return categories.filter(({ slug, parent }) => {
    return slug && !parent;
  });
};

const filterSubcategories = (
  categories: CategoriesList,
  parentCategory: CategoriesList[0],
) => {
  return categories.filter(({ slug, parent }) => {
    if (slug && parent) {
      return parent._id === parentCategory._id
        || (parent.slug && parent.slug === parentCategory.slug);
    }
    return false;
  });
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
  const mainCategories = filterMainCategories(props.categories);
  const getSubcategories = (parentCategory: CategoriesList[0]) => {
    return filterSubcategories(props.categories, parentCategory);
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
