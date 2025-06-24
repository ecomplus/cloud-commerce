import type { AnalyticsEvent } from './send-analytics-events';
import { logger } from '@cloudcommerce/firebase/lib/config';
import axios from 'axios';

// https://developer.awin.com/apidocs/conversion-api
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

const sendToAwin = async ({
  events,
  awc,
  channel = 'aw',
}: {
  events: AnalyticsEvent[],
  awc?: string,
  channel?: string,
}) => {
  if (!awinAxios) return;
  const purchaseEvents = events.filter((ev) => ev.name === 'purchase');
  if (!purchaseEvents.length) return;
  const awinOrders: Array<Record<string, any>> = [];
  purchaseEvents.forEach(({ params }) => {
    if (!params?.transaction_id) return;
    const voucher = params.coupon;
    const awinOrder: Record<string, any> = {
      orderReference: params.transaction_id,
      channel,
      awc,
      voucher,
      amount: params.value,
      currency: params.currency || 'BRL',
      commissionGroups: [{
        code: 'DEFAULT',
        amount: params.value,
      }],
      basket: params.items?.map((item: Record<string, any>) => ({
        id: item.object_id || item.item_id,
        name: item.item_name,
        price: item.price,
        quantity: item.quantity || 1,
        commissionGroupCode: 'DEFAULT',
        sku: item.item_id,
        category: item.category || item.item_brand || item.item_id,
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
