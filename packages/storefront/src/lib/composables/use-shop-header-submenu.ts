import type { CategoryTree } from '@@sf/composables/use-shop-header';
import { computed } from 'vue';

export interface Props {
  categoryTree: CategoryTree;
  megaMenuMaxCols?: number;
}

const useShopHeaderSubmenu = (props: Props) => {
  const categoryPicture = computed(() => {
    const picture = props.categoryTree.pictures?.[0];
    if (picture && !picture.alt) {
      return {
        alt: props.categoryTree.name,
        ...picture,
      };
    }
    return undefined;
  });
  const subcategoriesWithChild = computed(() => {
    return props.categoryTree.subcategories
      .filter(({ subcategories }) => subcategories.length);
  });
  const maxMenuCols = computed(() => {
    let _maxMenuCols = subcategoriesWithChild.value.length;
    if (categoryPicture.value) {
      _maxMenuCols += 1;
    }
    if (subcategoriesWithChild.value.length < props.categoryTree.subcategories.length) {
      _maxMenuCols += 1;
    }
    return _maxMenuCols;
  });
  const isMegaMenu = computed(() => {
    return (props.megaMenuMaxCols || 7) >= maxMenuCols.value;
  });
  const subcategoryLinks = computed(() => {
    return isMegaMenu.value
      ? props.categoryTree.subcategories
        .filter(({ subcategories }) => !subcategories.length)
      : props.categoryTree.subcategories;
  });
  const subcategoryCols = computed(() => {
    return isMegaMenu.value
      ? props.categoryTree.subcategories
        .filter(({ subcategories }) => subcategories.length)
      : props.categoryTree.subcategories;
  });
  const countMenuCols = computed(() => {
    if (isMegaMenu.value) return maxMenuCols.value;
    return categoryPicture.value ? 2 : 1;
  });
  return {
    categoryPicture,
    isMegaMenu,
    subcategoryLinks,
    subcategoryCols,
    countMenuCols,
  };
};

export default useShopHeaderSubmenu;

export { useShopHeaderSubmenu };
