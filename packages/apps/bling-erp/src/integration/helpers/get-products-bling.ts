import type { Orders } from '@cloudcommerce/types';
import type Bling from '../../bling-auth/client';
import { logger } from '@cloudcommerce/firebase/lib/config';

export default async (bling: Bling, order: Orders): Promise<Array<Record<string, any>>> => {
  let url = '';
  order.items?.forEach((item) => {
    if (!item.sku) return;
    url += url ? `&codigo[]=${item.sku}` : `/produtos?codigo[]=${item.sku}`;
  });
  if (!url) return [];
  try {
    const { data } = await bling.get(url);
    if (data.data && data.data.length) {
      return data.data;
    }
  } catch (err: any) {
    if (err.response) {
      logger.warn(`Failed listing Bling products: ${JSON.stringify(err.response.data)}`);
    } else {
      logger.error(err);
    }
  }
  return [];
};
