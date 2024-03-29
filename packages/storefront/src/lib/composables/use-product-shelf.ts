import type { ResourceId, Collections, SearchItem } from '@cloudcommerce/types';
import type { SectionPreviewProps } from '@@sf/state/use-cms-preview';
import { ref, shallowReactive } from 'vue';
import api from '@cloudcommerce/api';
import { inStock as checkInStock } from '@ecomplus/utils';
import { i19relatedProducts } from '@@i18n';
import { useSectionPreview } from '@@sf/state/use-cms-preview';

export interface Props extends Partial<SectionPreviewProps> {
  collectionId?: ResourceId | null;
  searchQuery?: `&${string}` | '';
  sort?: '-sales' | '-created_at' | 'price' | '-price' | '-price_discount' | string;
  title?: string | null;
  titleLink?: string | null;
  isShuffle?: boolean;
  limit?: number;
  page?: number;
  products?: SearchItem[];
  orderedProductIds?: ResourceId[];
  isRelatedProducts?: boolean;
}

const useProductShelf = (props: Props) => {
  const title = ref<string | null>(props.title || '');
  const titleLink = ref<string | null>(props.titleLink || '');
  const isFetching = ref(false);
  let fetching: Promise<void> | null = null;
  const fetchError = ref<Error | null>(null);
  const products = shallowReactive<SearchItem[]>(props.products || []);
  useSectionPreview(props, { title, titleLink, products });

  if (!props.products) {
    isFetching.value = true;
    fetching = (async () => {
      const limit = props.limit || 12;
      const offset = props.page ? (props.page - 1) * limit : 0;
      let endpointQuery = `offset=${offset}&limit=${limit}`;
      if (props.sort) {
        endpointQuery += `&sort=${props.sort}`;
      }
      if (props.isRelatedProducts) {
        const { apiContext } = globalThis.$storefront;
        if (apiContext?.resource === 'products') {
          endpointQuery += `&like=${apiContext.doc._id}`;
          if (!title.value && title.value !== null) {
            title.value = i19relatedProducts;
          }
        }
      } else {
        let searchQuery = props.searchQuery || '';
        let collection: Collections | undefined;
        let productIds: ResourceId[] | undefined;
        if (props.collectionId) {
          try {
            const { data } = await api.get(`collections/${props.collectionId}`);
            collection = data;
          } catch (err: any) {
            console.error(err);
            fetchError.value = err;
          }
          productIds = collection?.products;
          if (!title.value && title.value !== null && collection?.name) {
            title.value = collection?.name;
          }
        } else if (!searchQuery && props.orderedProductIds) {
          productIds = props.orderedProductIds;
        }
        if (productIds?.length) {
          searchQuery += `&_id=${productIds.slice(0, 60).join(',')}`;
        }
        endpointQuery += searchQuery;
      }
      try {
        const { data } = await api.get(`search/v1?${endpointQuery}`);
        if (props.isShuffle) {
          let m = data.result.filter((item) => {
            return item.available && checkInStock(item);
          }).length;
          let t: typeof data.result[0];
          let i: number;
          while (m) {
            // eslint-disable-next-line no-plusplus
            i = Math.floor(Math.random() * m--);
            t = data.result[m];
            data.result[m] = data.result[i];
            data.result[i] = t;
          }
        }
        const { orderedProductIds } = props;
        if (orderedProductIds) {
          data.result.sort((a, b) => {
            if (b.available && checkInStock(b)) {
              if (!a.available || !checkInStock(a)) return 1;
              const indexA = orderedProductIds.indexOf(a._id);
              const indexB = orderedProductIds.indexOf(b._id);
              if (indexA === -1 && indexB > -1) return 1;
              if (indexB === -1 && indexA > -1) return -1;
              return indexA - indexB;
            }
            if (a.available && checkInStock(a)) return -1;
            return 0;
          });
        }
        data.result.forEach((item) => products.push(item));
      } catch (err: any) {
        console.error(err);
        fetchError.value = err;
      }
      isFetching.value = false;
    })();
  }

  return {
    title,
    titleLink,
    isFetching,
    fetching,
    fetchError,
    products,
  };
};

export default useProductShelf;

export { useProductShelf };
