import type { AnalyticsEvent } from './send-analytics-events';
import axios from 'axios';

// https://developer.awin.com/apidocs/conversion-api
const {
  AWIN_ADVERTISER_ID: awinAdvertiverId,
  AWIN_API_KEY: awinApiKey,
} = process.env;
const awinAxios = awinAdvertiverId && awinApiKey
  ? axios.create({
    baseURL: `https://api.awin.com/s2s/advertiser/${awinAdvertiverId}`,
    headers: {
      'Content-Type': 'application/json',
      'Access-Token': awinApiKey,
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
    await awinAxios.post('/orders', { orders: awinOrders });
  }
};

export default sendToAwin;
