import type { AnalyticsEvent } from './send-analytics-events';
import config, { logger } from '@cloudcommerce/firebase/lib/config';
import axios from 'axios';

// https://help.awin.com/apidocs/conversion-api
const {
  AWIN_ADVERTISER_ID,
  AWIN_API_KEY,
  DEBUG_SERVER_ANALYTICS,
} = process.env;
const awinAxios = AWIN_ADVERTISER_ID && AWIN_API_KEY
  ? axios.create({
    baseURL: `https://api.awin.com/s2s/advertiser/${AWIN_ADVERTISER_ID}`,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': AWIN_API_KEY,
    },
  })
  : null;

// https://help.awin.com/apidocs/conversion-api - accepted "channel" values
const validChannels = new Set([
  'aw', 'ppcgeneric', 'ppcbrand', 'display', 'social', 'Other', 'Organic', 'direct',
]);

// Awin forbids the pipe character in id/name/sku/category basket fields
const stripPipes = (value: unknown) => (
  typeof value === 'string' ? value.replace(/\|/g, '') : value
);

const sendToAwin = async ({
  events,
  awc,
  channel = 'aw',
}: {
  events: AnalyticsEvent[],
  awc?: string,
  channel?: string,
}) => {
  if (!awinAxios || !awc) return;
  const purchaseEvents = events.filter((ev) => ev.name === 'purchase');
  if (!purchaseEvents.length) return;
  const awinOrders: Array<Record<string, any>> = [];
  purchaseEvents.forEach(({ params }) => {
    if (!params?.transaction_id) return;
    const voucher = params.coupon;
    const awinOrder: Record<string, any> = {
      orderReference: params.transaction_id,
      channel: validChannels.has(channel) ? channel : 'aw',
      awc,
      voucher,
      amount: params.value,
      currency: params.currency || config.get().currency,
      commissionGroups: [{
        code: 'DEFAULT',
        amount: params.value,
      }],
      basket: params.items?.map((item: Record<string, any>) => ({
        id: stripPipes(item.object_id || item.item_id),
        name: stripPipes(item.item_name),
        price: item.price,
        quantity: item.quantity || 1,
        commissionGroupCode: 'DEFAULT',
        sku: stripPipes(item.item_id),
        category: stripPipes(item.item_category || item.item_brand || item.item_id),
      })),
    };
    awinOrders.push(awinOrder);
  });
  if (awinOrders.length) {
    const data = { orders: awinOrders };
    if (DEBUG_SERVER_ANALYTICS?.toLowerCase() === 'true') {
      logger.info('Awin orders', { data });
    }
    await awinAxios.post('/orders', data);
  }
};

export default sendToAwin;
