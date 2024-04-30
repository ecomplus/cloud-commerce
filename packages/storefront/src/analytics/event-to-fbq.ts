import type { GtagEventMessage } from '@@sf/state/use-analytics';

const pageContentState = {
  waiting: Promise.resolve(),
  params: {
    content_ids: [] as string[],
    content_name: '',
  },
};

const parseGtagItem = (
  item: Exclude<Gtag.EventParams['items'], undefined>[0],
  currency = 'BRL',
  isCartEvent = false,
) => {
  const params: Record<string, any> = {
    currency,
    content_category: item.item_category,
    content_name: item.item_name,
    value: item.price,
    content_type: 'product',
  };
  if (isCartEvent) {
    params.contents = [{
      id: item.item_id,
      quantity: item.quantity,
    }];
    if (Number(item.quantity) < 0) {
      params.value = 0;
    }
  } else {
    params.content_ids = [item.item_id];
  }
  return params;
};

const parsePurchaseParams = (params: Gtag.EventParams) => {
  const data: Record<string, any> = {
    value: params.value,
    currency: params.currency || 'BRL',
    content_type: 'product',
    contents: params.items?.map(({ item_id: id, quantity }) => ({
      id,
      quantity,
    })),
  };
  if (params.transaction_id) {
    data.order_id = params.transaction_id;
  }
  return data;
};

// https://developers.facebook.com/docs/meta-pixel/reference#standard-events
export const parseGtagToFbq = async ({ event }: GtagEventMessage) => {
  if (event.name === 'page_view') {
    pageContentState.waiting = new Promise((resolve) => {
      setTimeout(resolve, 110);
    });
    pageContentState.params.content_name = event.params.page_title;
    return [{ name: 'PageView' }];
  }
  const { items, currency } = event.params;
  if (event.name.startsWith('view_item') && items) {
    const firstItem = items[0];
    if (firstItem) {
      if (firstItem.item_list_id === 'product-page') {
        return [{
          name: 'ViewContent',
          params: parseGtagItem(firstItem, currency),
        }];
      }
      items.forEach(({ item_id: id }) => {
        pageContentState.params.content_ids.push(id as string);
      });
      if (pageContentState.params.content_ids.length > items.length) {
        return [{ name: null }];
      }
      await pageContentState.waiting;
      return [{
        name: 'ViewContent',
        params: {
          ...pageContentState.params,
          content_type: 'product',
        },
      }];
    }
  }
  if ((event.name === 'add_to_cart' || event.name === 'remove_from_cart') && items) {
    const isAdd = event.name === 'add_to_cart';
    return items.map((item) => ({
      name: 'AddToCart',
      params: parseGtagItem({
        ...item,
        quantity: isAdd ? (item.quantity || 1) : -(item.quantity || 1),
      }, currency, true),
    }));
  }
  if (event.name === 'view_cart' || event.name === 'begin_checkout') {
    return [{
      name: 'InitiateCheckout',
      params: parsePurchaseParams(event.params),
    }];
  }
  if (event.name === 'purchase') {
    return [{
      name: 'Purchase',
      params: parsePurchaseParams(event.params),
    }];
  }
  return [{ name: null }];
};

export default parseGtagToFbq;
