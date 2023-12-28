/* REFERENCE: https://jasonwatmore.com/post/2018/08/07/javascript-pure-pagination-logic-in-vanilla-js-typescript */
import { computed } from 'vue';

export interface Props {
  totalItems?: number,
  totalPages?: number,
  page?: number,
  pageSize?: number,
  maxPages?: number,
}

const usePagination = (props: Props) => {
  const totalPages = computed(() => {
    if (props.totalPages) return props.totalPages;
    if (props.totalItems && props.pageSize) {
      return Math.ceil(props.totalItems / props.pageSize);
    }
    return 1;
  });
  const pageNumber = computed(() => {
    const currentPage = props.page || 1;
    if (currentPage < 1) return 1;
    if (currentPage > totalPages.value) return totalPages.value;
    return currentPage;
  });
  const maxPages = computed(() => props.maxPages || 10);
  const startPage = computed(() => {
    if (totalPages.value <= maxPages.value) return 1;
    const maxPagesBeforeCurrent = Math.floor(maxPages.value / 2);
    const maxPagesAfterCurrent = Math.ceil(maxPages.value / 2) - 1;
    if (pageNumber.value <= maxPagesBeforeCurrent) return 1;
    if (pageNumber.value + maxPagesAfterCurrent >= totalPages.value) {
      return totalPages.value - maxPages.value + 1;
    }
    return pageNumber.value - maxPagesBeforeCurrent;
  });
  const endPage = computed(() => {
    if (totalPages.value <= maxPages.value) return totalPages.value;
    const maxPagesBeforeCurrent = Math.floor(maxPages.value / 2);
    const maxPagesAfterCurrent = Math.ceil(maxPages.value / 2) - 1;
    if (pageNumber.value <= maxPagesBeforeCurrent) return maxPages.value;
    if (pageNumber.value + maxPagesAfterCurrent >= totalPages.value) {
      return totalPages.value;
    }
    return pageNumber.value + maxPagesAfterCurrent;
  });
  const pages = computed(() => {
    return Array.from(Array((endPage.value + 1) - startPage.value).keys())
      .map((i) => startPage.value + i);
  });
  return {
    totalPages,
    startPage,
    endPage,
    pages,
  };
};

export default usePagination;

export { usePagination };
