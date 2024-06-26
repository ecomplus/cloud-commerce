import type { GtagEventMessage } from '@@sf/state/use-analytics';

const pageContentState = {
  waiting: Promise.resolve(),
  params: {
    description: '',
    contents: [] as Record<string, any>[],
  },
};

const parseGtagItem = (
  item: Exclude<Gtag.EventParams['items'], undefined>[0],
  isCartEvent = false,
) => {
  const params: Record<string, any> = {
    content_id: item.item_id,
    content_name: item.item_name,
    price: item.price,
    content_category: item.item_category,
    brand: item.item_brand,
  };
  if (isCartEvent) {
    params.quantity = item.quantity;
  }
  return params;
};

const parsePurchaseParams = (params: Gtag.EventParams) => {
  return {
    value: params.value,
    currency: params.currency || 'BRL',
    content_type: 'product',
    contents: params.items?.map((item) => parseGtagItem(item, true)) || [],
  };
};

// https://ads.tiktok.com/help/article/standard-events-parameters?lang=en#
// https://ads.tiktok.com/help/article/about-parameters#
export const parseGtagToTtq = async ({ event }: GtagEventMessage) => {
  if (event.name === 'page_view') {
    pageContentState.waiting = new Promise((resolve) => {
      setTimeout(resolve, 110);
    });
    pageContentState.params.description = event.params.page_title;
    return [{ name: 'PageView' }];
  }
  const { items, currency = 'BRL' } = event.params;
  if (event.name.startsWith('view_item') && items) {
    const firstItem = items[0];
    if (firstItem) {
      if (firstItem.item_list_id === 'product-page') {
        return [{
          name: 'ViewContent',
          params: {
            contents: [parseGtagItem(firstItem)],
            content_type: 'product',
            currency,
            value: firstItem.price,
          },
        }];
      }
      items.forEach((item) => {
        pageContentState.params.contents.push(parseGtagItem(item));
      });
      if (pageContentState.params.contents.length > items.length) {
        return [{ name: null }];
      }
      await pageContentState.waiting;
      return [{
        name: 'ViewContent',
        params: {
          ...pageContentState.params,
          content_type: 'product',
          currency,
        },
      }];
    }
  }
  if (event.name === 'add_to_cart' && items) {
    return items.map((item) => {
      const quantity = (item.quantity || 1);
      const { price } = item;
      return {
        name: 'AddToCart',
        params: {
          contents: [
            parseGtagItem({ ...item, quantity }, true),
          ],
          content_type: 'product',
          currency,
          value: typeof price === 'number' ? quantity * price : 0,
        },
      };
    });
  }
  if (event.name === 'view_cart' || event.name === 'begin_checkout') {
    return [{
      name: 'InitiateCheckout',
      params: parsePurchaseParams(event.params),
    }];
  }
  if (event.name === 'purchase') {
    return [{
      name: 'PlaceAnOrder',
      params: parsePurchaseParams(event.params),
    }];
  }
  return [{ name: null }];
};

export default parseGtagToTtq;
