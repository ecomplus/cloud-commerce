import type { Ref } from 'vue';
import type { CategoriesList } from '@cloudcommerce/api/types';
import { ref, computed } from 'vue';
import useStickyHeader from '@@sf/composables/use-sticky-header';

export interface Props {
  header: Ref<HTMLElement>;
  categories: CategoriesList;
}

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
  const mainCategories = props.categories.filter(({ slug, parent }) => {
    return slug && !parent;
  });
  const isSidenavOpen = ref(false);
  return {
    isSticky,
    staticHeight,
    staticY,
    positionY,
    mainCategories,
    isSidenavOpen,
  };
};

export default useShopHeader;
