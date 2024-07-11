import type { ResourceId, Products, Grids } from '@cloudcommerce/api/types';
import {
  ref,
  computed,
  reactive,
  shallowReactive,
  watch,
  toRef,
} from 'vue';
import {
  specValueByText as getSpecValueByText,
  specTextValue as getSpecTextValue,
  variationsGrids as getVariationsGrids,
  gridTitle as _getGridTitle,
} from '@ecomplus/utils';

export type Props = {
  variations: Exclude<Products['variations'], undefined>;
  variationId?: ResourceId | null;
  grids?: Array<Partial<Grids>>;
}

const useSkuSelector = (props: Props) => {
  const grids = shallowReactive(
    props.grids
    || globalThis.$storefront.data.grids
    || [],
  );
  if (!grids.length && !import.meta.env.SSR) {
    window.addEventListener('storefront:data:grids', () => {
      globalThis.$storefront.data.grids?.forEach((grid) => grids.push(grid));
    }, { once: true });
  }
  const variationsGrids = reactive<Record<string, string[]>>({});
  const activeVariationsGrids = reactive<Record<string, string[]>>({});
  watch(toRef(props, 'variations'), () => {
    Object.assign(activeVariationsGrids, getVariationsGrids(props, undefined, true));
    const allVariationsGrids = getVariationsGrids(props);
    Object.keys(allVariationsGrids).forEach((gridId) => {
      if (activeVariationsGrids[gridId]) {
        variationsGrids[gridId] = activeVariationsGrids[gridId];
      } else {
        delete variationsGrids[gridId];
      }
    });
  }, { immediate: true });

  const orderedGridIds = computed(() => Object.keys(variationsGrids));
  const selectedOptions = reactive<Record<string, string>>({});
  const variationId = ref<ResourceId | null | undefined>();
  const selectOption = ({ optionText, gridId, gridIndex }: {
    optionText: string,
    gridId: string,
    gridIndex: number,
  }) => {
    selectedOptions[gridId] = optionText;
    const filteredGrids = {};
    for (let i = 0; i <= gridIndex; i++) {
      const _gridId = orderedGridIds[i];
      if (selectedOptions[_gridId]) {
        filteredGrids[_gridId] = selectedOptions[_gridId];
      }
    }
    const nextFilteredGrids = getVariationsGrids(props, filteredGrids, true);
    for (let i = gridIndex + 1; i < orderedGridIds.value.length; i++) {
      const _gridId = orderedGridIds[i];
      const options = nextFilteredGrids[_gridId];
      activeVariationsGrids[_gridId] = options;
      if (selectedOptions[_gridId] && !options.includes(selectedOptions[_gridId])) {
        delete selectedOptions[_gridId];
      }
    }
    const variations = props.variations.slice(0);
    for (let i = 0; i < variations.length; i++) {
      const variation = variations[i];
      const { specifications } = variation;
      const gridIds = Object.keys(specifications);
      for (let ii = 0; ii < gridIds.length; ii++) {
        const _gridId = gridIds[ii];
        // @ts-ignore
        if (selectedOptions[_gridId] !== getSpecTextValue(variation, _gridId)) {
          variations.splice(i, 1);
          i -= 1;
          break;
        }
      }
    }
    variationId.value = variations[0]?._id || null;
  };
  watch(toRef(props, 'variationId'), (_variationId) => {
    if (!_variationId || _variationId === variationId.value) {
      return;
    }
    const selectedVariation = props.variations.find((variation) => {
      return variation._id === _variationId;
    });
    if (!selectedVariation) {
      variationId.value = null;
      return;
    }
    const { specifications } = selectedVariation;
    const specs = Object.keys(specifications);
    const nextSpec = (specIndex = 0) => {
      const gridId = specs[specIndex];
      if (
        specs[specIndex]
        && specifications[gridId]
        && specifications[gridId].length === 1
      ) {
        const optionText = specifications[gridId][0].text;
        if (variationsGrids[gridId].find((option) => option === optionText)) {
          selectOption({
            optionText,
            gridId,
            gridIndex: orderedGridIds.value.indexOf(gridId),
          });
          nextSpec(specIndex + 1);
        }
      }
    };
    nextSpec();
  }, { immediate: true });

  const getGridTitle = (gridId: string) => {
    return _getGridTitle(gridId, grids);
  };
  const getColorOptionBg = (optionText: string) => {
    const rgbs = optionText.split(',').map((colorName) => {
      return getSpecValueByText(props.variations, colorName.trim(), 'colors');
    });
    return rgbs.length > 1
      ? `background:linear-gradient(to right bottom, ${rgbs[0]} 50%, ${rgbs[1]} 50%)`
      : `background:${rgbs[0]}`;
  };

  return {
    grids,
    variationsGrids,
    activeVariationsGrids,
    selectOption,
    selectedOptions,
    variationId,
    getGridTitle,
    getColorOptionBg,
  };
};

export default useSkuSelector;

export { useSkuSelector };
