import type { Categories } from '@cloudcommerce/api/types';
import { ref, watch, toRef } from 'vue';
import Wade from 'wade';
import { clearAccents } from '@@sf/sf-lib';
import { SearchEngine, searchHistory } from '@@sf/state/search-engine';

export interface Props {
  term: string;
  fetchDebounce?: number;
  productsLimit?: number;
}

const wadeDocs: Array<{
  text: string,
  type: 'categories' | 'brands' | 'collections' | 'blog',
  data: Record<string, any> & { name: string, slug: string },
}> = [];
(['categories', 'brands', 'collections'] as const).forEach((resource) => {
  const docsList = globalThis.$storefront.data[resource];
  if (docsList) {
    for (let i = 0; i < docsList.length; i++) {
      const doc = docsList[i];
      if (doc.name && doc.slug) {
        wadeDocs.push({
          text: clearAccents(`${doc.name} ${(doc as Categories).short_description}`),
          type: resource,
          data: doc as typeof wadeDocs[number]['data'],
        });
      }
    }
  }
});
let wadeSearch: ((t: string) => { index: number, score: number }[]) | undefined;
if (wadeDocs.length) {
  if (globalThis.$storefront.settings.lang === 'pt_br') {
    Wade.config.stopWords = ['e', 'a', 'o', 'de', 'para', 'com', 'tem'];
  }
  wadeSearch = Wade(wadeDocs.map(({ text }) => text));
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
    if (wadeSearch) {
      const wadeResults = wadeSearch(clearAccents(term));
      linkHits.value = wadeResults.map(({ index }) => {
        const { name, slug } = wadeDocs[index].data;
        return { title: name, href: `/${slug}` };
      });
    }
  }, {
    immediate: true,
  });
  watch(searchEngine.meta, () => {
    productCount.value = searchEngine.meta.count || 0;
  });
  const filteredHistory = ref<string[]>([]);
  watch(searchHistory, () => {
    filteredHistory.value = searchHistory.filter((term) => term !== props.term);
  }, {
    immediate: true,
  });
  return {
    searchHistory: filteredHistory,
    searchEngine,
    isFetching: searchEngine.isFetching,
    products: searchEngine.products,
    productCount,
    linkHits,
  };
};

export default useSearchModal;
