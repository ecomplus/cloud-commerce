import type { Products, Carts, SearchItem } from '@cloudcommerce/types';
import { watch } from 'vue';
import { price as getPrice, name as getName } from '@ecomplus/utils';
import { customer, isLogged } from '@@sf/state/customer-session';
import { cartEvents } from '@@sf/state/shopping-cart';
import { searchHistory } from '@@sf/state/search-engine';
import utm from '@@sf/scripts/session-utm';

export const trackingIds: {
  gclid?: string,
  g_client_id?: string,
  g_session_id?: string,
  fbclid?: string,
  fbp?: string,
  ttclid?: string,
  client_id?: string,
  session_id?: string,
} = {};

// `page_view` params not typed
// https://developers.google.com/tag-platform/gtagjs/reference/events#page_view
type PageViewParams = {
  page_location: string,
  client_id?: string,
  language: string,
  page_encoding?: string,
  page_title: string,
  user_agent: string,
};
const pageViewState = {} as {
  resolve: ((...args: any[]) => void) | null | undefined,
  waiting: Promise<unknown> | undefined,
  params: PageViewParams | undefined,
};
const resetPageViewPromise = () => {
  if (pageViewState.resolve) return;
  pageViewState.waiting = new Promise((resolve) => {
    pageViewState.resolve = resolve;
  });
};
if (!import.meta.env.SSR) {
  resetPageViewPromise();
}

export const getPageViewParams = () => {
  let pageLocation = '';
  if (window.location.pathname.startsWith('/~')) {
    const urlParams = new URLSearchParams(window.location.search);
    pageLocation = urlParams.get('url') || '';
  }
  if (!pageLocation) {
    pageLocation = window.location.toString();
  }
  return {
    page_location: pageLocation,
    language: globalThis.$storefront.settings.lang || 'pt_br',
    page_title: document.title,
    user_agent: navigator.userAgent,
  };
};

export const getAnalyticsContext = () => {
  return {
    ...(pageViewState.params || getPageViewParams()),
    ...trackingIds,
    user_id: customer.value._id,
    utm,
  };
};

export const GTAG_EVENT_TYPE = 'GtagEvent';

export type GtagEventMessage = typeof trackingIds &
  PageViewParams &
  { utm: typeof utm } &
  {
    type: typeof GTAG_EVENT_TYPE,
    user_id?: string & { length: 24 },
    event: {
      name: 'page_view',
      params: PageViewParams,
    } | {
      name: Exclude<Gtag.EventNames, 'page_view'>,
      params: Gtag.EventParams,
    },
  };

let countItemsPerList: Record<string, number> = {};
let defaultItemsList = '';

export const emitGtagEvent = async <N extends Gtag.EventNames = 'view_item'>(
  name: N,
  _params: N extends 'page_view' ? PageViewParams : Gtag.EventParams,
) => {
  if (import.meta.env.SSR) return;
  const params = _params as Gtag.EventParams;
  if (name === 'page_view') {
    countItemsPerList = {};
    const { apiContext } = window.$storefront;
    defaultItemsList = '';
    if (apiContext) {
      const { name: docName } = apiContext.doc;
      switch (apiContext.resource) {
        case 'categories': defaultItemsList = `Category: ${docName}`; break;
        case 'brands': defaultItemsList = `Brand: ${docName}`; break;
        case 'collections': defaultItemsList = `Collection: ${docName}`; break;
        default:
      }
    } else {
      const { pathname } = window.location;
      if (pathname === '/') {
        defaultItemsList = 'Home';
      } else if (
        /^\/s\/?/.test(pathname)
        || pathname === '/search'
        || pathname === '/busca'
      ) {
        defaultItemsList = 'Search results';
      }
    }
    if (pageViewState.resolve) {
      pageViewState.params = (_params as PageViewParams);
      pageViewState.resolve();
      pageViewState.resolve = null;
    }
  } else {
    if (pageViewState.waiting) await pageViewState.waiting;
    if (name === 'view_item') {
      params.items?.forEach((item) => {
        if (item.index !== undefined) return;
        if (!item.item_list_id && !item.item_list_name) {
          const { apiContext } = window.$storefront;
          // @ts-ignore
          if (apiContext?.doc._id === item.object_id) {
            item.item_list_id = 'product-page';
            item.item_list_name = 'Product page';
          }
        }
        const listKey = item.item_list_id
          || item.item_list_name
          || defaultItemsList;
        if (listKey) {
          if (!countItemsPerList[listKey]) {
            countItemsPerList[listKey] = 1;
          } else {
            countItemsPerList[listKey] += 1;
          }
          item.index = countItemsPerList[listKey];
          if (!item.item_list_id && !item.item_list_name) {
            item.item_list_name = listKey;
          }
        }
      });
    }
    if (typeof params.value === 'number' && !params.currency) {
      params.currency = window.ECOM_CURRENCY || 'BRL';
    }
  }
  try {
    const data: GtagEventMessage = {
      type: GTAG_EVENT_TYPE,
      ...getAnalyticsContext(),
      event: {
        name: name as 'view_item',
        params,
      },
    };
    window.postMessage(data, window.origin);
  } catch (e) {
    console.error(e);
  }
};

export const watchGtagEvents = (cb: (payload: GtagEventMessage) => any) => {
  window.addEventListener('message', ({ data }: { data: GtagEventMessage }) => {
    if (data.type === GTAG_EVENT_TYPE) {
      cb(data);
    }
  });
};

type CartItem = Carts['items'][0];

export const getGtagItem = (product: Partial<Products> | SearchItem | CartItem) => {
  const [name, ...variants] = getName(product).split(' / ');
  const item: Gtag.Item = {
    item_name: name,
    item_id: product.sku,
    price: Math.round(getPrice(product) * 100) / 100,
    // https://developers.google.com/analytics/devguides/collection/ga4/item-scoped-ecommerce#add_an_item-scoped_custom_parameter
    // @ts-ignore
    object_id: product._id,
  };
  if (variants && variants.length) {
    item.item_variant = variants.join(' / ');
  } else if ((product as CartItem).variation_id) {
    item.item_name = name.replace(
      (window as any).__customGTMVariantRegex || /\s[^\s]+$/,
      '',
    );
    item.item_variant = name.replace(item.item_name, '').trim();
  }
  if (
    product.quantity === 0
    || (product.quantity && (product as CartItem).product_id)
  ) {
    item.quantity = product.quantity;
  }
  const { brands, categories } = product as Products;
  if (brands?.length) {
    item.item_brand = brands[0].name;
  }
  if (categories?.length) {
    for (let i = 0; i < categories.length; i++) {
      const { name: categoryName } = categories[i];
      if (i === 0) {
        item.item_category = categoryName;
      } else {
        item[`item_category${(i + 1)}`] = categoryName;
        if (i === 4) break;
      }
    }
  }
  return item;
};

export const useAnalytics = ({
  experimentId = window.AB_EXPERIMENT_ID,
}: {
  experimentId?: string,
} = {}) => {
  const {
    gtag,
    GTAG_TAG_ID,
    GA_TRACKING_ID,
    GIT_BRANCH,
  } = window as Window & { gtag?: Gtag.Gtag };
  const tagId = GTAG_TAG_ID || GA_TRACKING_ID;
  // https://developers.google.com/analytics/devguides/collection/ga4/integration
  const expVariantString: string | null = GIT_BRANCH && experimentId
    ? `${experimentId}-${GIT_BRANCH}`
    : (GIT_BRANCH?.startsWith('main-') && GIT_BRANCH) || null;
  if (typeof gtag === 'function') {
    if (tagId) {
      ['client_id', 'session_id', 'gclid'].forEach((key) => {
        gtag('get', tagId, key, (id) => {
          trackingIds[key === 'gclid' ? key : `g_${key}`] = id;
        });
      });
    }
    if (expVariantString) {
      gtag('event', 'experience_impression', {
        exp_variant_string: expVariantString,
      });
    }
  }
  const url = new URL(window.location.toString());
  ['gclid', 'fbclid', 'ttclid'].forEach((key) => {
    const id = trackingIds[key] || url.searchParams.get(key);
    if (id) {
      trackingIds[key] = id;
      sessionStorage.setItem(`analytics_${key}`, id);
    } else {
      trackingIds[key] = sessionStorage.getItem(`analytics_${key}`) || undefined;
    }
  });
  const cookieNames = ['_fbp'];
  if (!trackingIds.fbclid) cookieNames.push('_fbc');
  if (!trackingIds.g_client_id) cookieNames.push('_ga');
  cookieNames.forEach((cookieName) => {
    document.cookie.split(';').forEach((cookie) => {
      const [key, value] = cookie.split('=');
      if (key.trim() === cookieName && value) {
        switch (cookieName) {
          case '_fbp': trackingIds.fbp = value; break;
          case '_fbc': trackingIds.fbclid = value; break;
          case '_ga': trackingIds.g_client_id = value.substring(6); break;
          default:
        }
      }
    });
  });
  ['client_id', 'session_id'].forEach((key) => {
    const storage = key === 'client_id' ? localStorage : sessionStorage;
    const storedValue = storage.getItem(`analytics_${key}`);
    if (storedValue) {
      trackingIds[key] = storedValue;
    } else {
      trackingIds[key] = trackingIds[`g_${key}`]
        || `${Math.ceil(Math.random() * 1000000)}.${Math.ceil(Math.random() * 1000000)}`;
    }
    storage.setItem(`analytics_${key}`, trackingIds[key]);
  });
  if (isLogged.value) {
    emitGtagEvent('login', {});
  } else {
    watch(isLogged, () => emitGtagEvent('login', {}), { once: true });
  }
  cartEvents.on('*', (evName, cartItem) => {
    emitGtagEvent(
      evName === 'addCartItem' ? 'add_to_cart' : 'remove_from_cart',
      { items: [getGtagItem(cartItem)] },
    );
  });
  watch(searchHistory, () => {
    const term = searchHistory[0];
    if (term) {
      emitGtagEvent('search', { search_term: term });
    }
  });
  if (window.location.pathname.startsWith('/s')) {
    setTimeout(() => {
      let urlSearchQ = new URLSearchParams(window.location.search).get('q');
      if (!urlSearchQ) {
        urlSearchQ = decodeURIComponent(window.location.pathname.split('/')[2]);
      }
      if (urlSearchQ && typeof urlSearchQ === 'string') {
        emitGtagEvent('view_search_results', { search_term: urlSearchQ });
      }
    }, 300);
  }
  return {
    expVariantString,
  };
};

export default useAnalytics;
