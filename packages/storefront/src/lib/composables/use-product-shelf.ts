import type { ResourceId, Collections, SearchItem } from '@cloudcommerce/types';
import type { SectionPreviewProps } from '@@sf/state/use-cms-preview';
import type { CmsFields } from '@@sf/content';
import { ref, shallowReactive } from 'vue';
import api from '@cloudcommerce/api';
import { inStock as checkInStock } from '@ecomplus/utils';
import { i19relatedProducts } from '@@i18n';
import { useSectionPreview } from '@@sf/state/use-cms-preview';

export type Props = Partial<SectionPreviewProps> & {
  collectionId?: ResourceId | null;
  searchQuery?: string; // `&${string} | ''`
  sort?: '-sales' | '-created_at' | 'price' | '-price' | '-price_discount' | string;
  title?: string | null;
  titleLink?: string | null;
  isShuffle?: boolean;
  limit?: number;
  page?: number;
  products?: Array<SearchItem & { __ssr?: boolean }>;
  orderedProductIds?: ResourceId[];
  isRelatedProducts?: boolean;
}

export const productShelfCmsFields = ({
  collectionIdAndInfo: {
    widget: 'select:shelf-catalog',
    label: { pt: 'Coleção de produtos', en: 'Products collection' },
    hint: {
      pt: 'Se este campo não for preenchido, serão listados os produtos mais populares',
      en: 'If this field is not filled in, the most popular products will be listed',
    },
    // `collectionIdAndInfo` parsed to `collectionId` server-side on `usePageMain`
    _dropped: true,
  },
  sort: {
    widget: 'select',
    label: { pt: 'Ordenar por', en: 'Sort by' },
    options: [{
      label: { pt: 'Vendas', en: 'Sales' },
      value: '-sales',
    }, {
      label: { pt: 'Data de criação', en: 'Creation date' },
      value: '-created_at',
    }, {
      label: { pt: 'Menor preço', en: 'Lowest price' },
      value: 'price',
    }, {
      label: { pt: 'Maior preço', en: 'Highest price' },
      value: '-price',
    }, {
      label: { pt: 'Percentual de desconto', en: 'Discount percentage' },
      value: '-price_discount,-sales',
    }],
  },
  searchQuery: {
    widget: 'string',
    label: { pt: 'Query adicional', en: 'Additional query' },
    hint: { pt: 'Ex.: &brands.slug!=minha-marca', en: 'E.g. &brands.slug!=my-brand' },
  },
  title: {
    widget: 'string',
    label: { pt: 'Título', en: 'Title' },
    _nullable: true,
  },
  titleLink: {
    widget: 'string',
    label: { pt: 'Link no título', en: 'Title link' },
    _nullable: true,
  },
  isShuffle: {
    widget: 'boolean',
    label: { pt: 'Embaralhar itens', en: 'Shuffle result items' },
  },
  isHeadless: {
    widget: 'boolean',
  },
  limit: {
    widget: 'number',
    value_type: 'int',
    label: { pt: 'Limite de itens', en: 'Items limit' },
    default: 12,
  },
  page: {
    widget: 'number',
    value_type: 'int',
  },
}) as const satisfies CmsFields;

const useProductShelf = (props: Props) => {
  const title = ref<string | null>(props.title || '');
  const titleLink = ref<string | null>(props.titleLink || '');
  const isFetching = ref(false);
  let fetching: Promise<void> | null = null;
  const fetchError = ref<Error | null>(null);
  const products = shallowReactive(props.products || []);
  if (import.meta.env.SSR) {
    products.forEach((item) => {
      item.__ssr = true;
    });
  }
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
        data.result.forEach((item: SearchItem & { __ssr?: boolean }) => {
          if (import.meta.env.SSR) item.__ssr = true;
          products.push(item);
        });
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
