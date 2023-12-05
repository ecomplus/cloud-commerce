import type {
  Categories,
  Brands,
  Collections,
} from '@cloudcommerce/api/types';
import type { Orama } from '@orama/orama';
import { ref, watch, toRef } from 'vue';
import {
  create as oramaCreate,
  search as oramaSearch,
  insert as oramaInsert,
} from '@orama/orama';
import { SearchEngine, searchHistory } from '@@sf/state/search-engine';

export interface Props {
  term: string;
  fetchDebounce?: number;
  productsLimit?: number;
}

const oramaDocSchema = {
  name: 'string',
  slug: 'string',
  short_description: 'string',
} as const;
const oramaDocs: Array<{ [k:string]:any } & { name: string, slug: string }> = [];
const storefrontData = globalThis.$storefront.data as {
  categories?: Array<Partial<Categories>>,
  brands?: Array<Partial<Brands>>,
  collections?: Array<Partial<Collections>>,
};
(['categories', 'brands', 'collections'] as const).forEach((resource) => {
  const docsList = storefrontData[resource];
  if (docsList) {
    for (let i = 0; i < docsList.length; i++) {
      const doc = docsList[i];
      const { name, slug } = doc;
      if (name && slug) {
        oramaDocs.push({ ...doc, name, slug });
      }
    }
  }
});
let oramaDb: Orama<typeof oramaDocSchema> | undefined;
if (oramaDocs.length) {
  (async () => {
    const _oramaDb = await oramaCreate({ schema: oramaDocSchema });
    oramaDocs.forEach((doc) => oramaInsert(_oramaDb, doc));
    oramaDb = _oramaDb;
  })();
}

export const useSearchModal = (props: Props) => {
  const searchEngine = new SearchEngine({
    debounce: props.fetchDebounce || 300,
  });
  searchEngine.pageSize.value = props.productsLimit || 12;
  searchEngine.isWithCount.value = true;
  searchEngine.isWithBuckets.value = false;
  const productCount = ref(0);
  const linkHits = ref<Array<{ title: string, href: string }>>([]);
  watch(toRef(props, 'term'), async (term) => {
    searchEngine.fetch(term);
    if (oramaDb) {
      const { hits } = await oramaSearch(oramaDb, { term });
      linkHits.value = hits.map(({ document: { name, slug } }) => {
        return { title: name, href: `/${slug}` };
      });
    }
  }, {
    immediate: true,
  });
  watch(searchEngine.meta, () => {
    productCount.value = searchEngine.meta.count || 0;
  });
  return {
    searchHistory,
    searchEngine,
    isFetching: searchEngine.isFetching,
    productHits: searchEngine.products,
    productCount,
    linkHits,
  };
};

export default useSearchModal;
