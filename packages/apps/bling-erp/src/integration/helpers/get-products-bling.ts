import type { Orders } from '@cloudcommerce/types';
import type Bling from '../../bling-auth/client';
import { logger } from '@cloudcommerce/firebase/lib/config';

export default async (bling: Bling, order: Orders): Promise<Array<Record<string, any>>> => {
  const skus: string[] = [];
  order.items?.forEach((item) => {
    if (item.sku) skus.push(item.sku);
  });
  if (!skus.length) return [];
  const products: Array<Record<string, any>> = [];
  // A listagem da API v3 pagina em 100: SKUs em lotes com `limite` explícito
  const chunkSize = 50;
  for (let i = 0; i < skus.length; i += chunkSize) {
    const chunk = skus.slice(i, i + chunkSize);
    const url = '/produtos?limite=100&'
      + chunk.map((sku) => `codigo[]=${encodeURIComponent(sku)}`).join('&');
    try {
      // eslint-disable-next-line no-await-in-loop
      const { data } = await bling.get(url);
      if (data.data?.length) {
        products.push(...data.data);
      }
    } catch (err: any) {
      if (err.response) {
        logger.warn(`Failed listing Bling products: ${JSON.stringify(err.response.data)}`);
      } else {
        logger.error(err);
      }
    }
  }
  return products;
};
