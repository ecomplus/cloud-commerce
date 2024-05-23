import type { Products, Carts, SearchItem } from '@cloudcommerce/types';
import type { TrackingIds } from '../../analytics/set-tracking-ids';
import { watch } from 'vue';
import { price as getPrice, name as getName } from '@ecomplus/utils';
import { customer, isLogged } from '@@sf/state/customer-session';
import { cartEvents } from '@@sf/state/shopping-cart';
import { searchHistory } from '@@sf/state/search-engine';
import utm from '@@sf/scripts/session-utm';
import setTrackingIds from '../../analytics/set-tracking-ids';

export const trackingIds: TrackingIds = {};

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
    pageLocation = window.location.href;
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

export type PurchaseExtraParams = {
  shipping_addr_province_code?: string;
  shipping_addr_country_code?: string;
  shipping_delivery_days?: number;
};

export type PurchaseParamsToHash = {
  customer_display_name?: string;
  customer_given_name?: string;
  customer_family_name?: string;
  customer_email?: string;
  customer_phone?: string;
  shipping_addr_zip?: string;
  shipping_addr_street?: string;
  shipping_addr_number?: number;
  shipping_addr_city?: string;
};

type ParamsToHash = Record<string, string | number | undefined> & PurchaseParamsToHash;

export type GtagEventMessage = typeof trackingIds &
  PageViewParams &
  {
    type: typeof GTAG_EVENT_TYPE,
    user_id?: string & { length: 24 },
    event: {
      name: 'page_view',
      params: PageViewParams,
    } | {
      name: Exclude<Gtag.EventNames, 'page_view'>,
      params: Record<string, any> & Gtag.EventParams & PurchaseExtraParams,
      _unhashed_data?: ParamsToHash,
    },
    utm: typeof utm,
    event_id: string,
    timestamp: number,
  };

type GtagEventMiddleware = (data: GtagEventMessage) => GtagEventMessage;

export const gtagEventMiddlewares: GtagEventMiddleware[] = [];

export const addGtagEventMiddleware = (midd: GtagEventMiddleware) => {
  gtagEventMiddlewares.push(midd);
};

const digestMessage = async (message: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await window.crypto.subtle.digest('SHA-256', data);
  return hash;
};
let countItemsPerList: Record<string, number> = {};
let defaultItemsList = '';

export const emitGtagEvent = async <N extends Gtag.EventNames = 'view_item'>(
  name: N,
  _params: N extends 'page_view'
    ? PageViewParams
    : Record<string, any> & Gtag.EventParams,
  paramsToHash?: ParamsToHash,
) => {
  if (import.meta.env.SSR) return;
  const params = _params as Record<string, any> & Gtag.EventParams;
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
    if (name.startsWith('view_item')) {
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
  const timestamp = Date.now();
  if (paramsToHash) {
    const hashings = Object.keys(paramsToHash).map((key) => async () => {
      const value = paramsToHash[key];
      if (value === undefined) return;
      try {
        params[key] = await digestMessage(`${value}`);
      } catch (err) {
        console.error(err);
      }
    });
    await (Promise.all(hashings));
  }
  try {
    let data: GtagEventMessage = {
      type: GTAG_EVENT_TYPE,
      ...getAnalyticsContext(),
      event: {
        name: name as 'view_item',
        params,
        _unhashed_data: paramsToHash,
      },
      event_id: `${name}.${timestamp}`,
      timestamp,
    };
    gtagEventMiddlewares.forEach((midd) => {
      data = midd(data);
    });
    window.postMessage(data, window.origin);
  } catch (e) {
    console.error(e);
  }
};

type GtagEventCallback = (payload: GtagEventMessage) => any;
const gtagEventCallbacks: Array<{
  names?: Gtag.EventNames[],
  cb: GtagEventCallback,
}> = [];
if (!import.meta.env.SSR) {
  window.addEventListener('message', ({ data }: { data: GtagEventMessage }) => {
    if (data.type === GTAG_EVENT_TYPE) {
      gtagEventCallbacks.forEach(({ names, cb }) => {
        if (names?.length && !names.includes(data.event.name)) return;
        cb(data);
      });
    }
  });
}

export const watchGtagEvents = (cb: GtagEventCallback, names?: Gtag.EventNames[]) => {
  gtagEventCallbacks.push({ names, cb });
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
  const variantCtx = setTrackingIds(trackingIds, experimentId);
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
  return variantCtx;
};

export default useAnalytics;
