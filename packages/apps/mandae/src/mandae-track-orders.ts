import type { ResourceId, Orders } from '@cloudcommerce/types';
import logger from 'firebase-functions/logger';
import api from '@cloudcommerce/api';
import axios from 'axios';
import { getAppData, exportOrder } from './mandae-send-orders';

export const parseMandaeStatus = ({ id /* , name */ }) => {
  switch (id) {
    case '1':
      return 'delivered';
    case '101':
    case '110':
    case '31':
    case '33':
    case '118':
    case '160':
    case '122':
    case '123':
    case '124':
    case '119':
    case '120':
    case '0':
    case '121':
      return 'shipped';
    case '66':
    case '6':
      return 'returned';
    default:
      return null;
  }
};

export const importOrderStatus = async ({ order, mandaeToken, mandaeOrderSettings }: {
  order: Partial<Orders> & { _id: ResourceId },
  mandaeToken: string,
  mandaeOrderSettings: Record<string, any>,
}) => {
  const { number } = order;
  const shippingLine = order.shipping_lines?.find(({ app }) => app?.carrier === 'MANDAE');
  if (!shippingLine?.to) return;
  const invoice = shippingLine.invoices?.[0];
  if (!invoice?.number || !invoice.serial_number || !invoice.access_key) {
    logger.warn(`Skipping ${number} without invoice data`);
    return;
  }
  const lineTrackingCodes = shippingLine.tracking_codes || [];
  let trackingId = lineTrackingCodes.find(({ tag, link }) => {
    return tag === 'mandae' || link?.startsWith('https://rastreae.com.br');
  })?.code;
  if (!trackingId) {
    const mandaeTrackingPrefix = mandaeOrderSettings?.tracking_prefix || '';
    trackingId = mandaeTrackingPrefix
      + invoice.number.replace(/^0+/, '').trim()
      + invoice.serial_number.replace(/^0+/, '').trim();
  }
  logger.info(`Tracking ${number} with ID ${trackingId}`);
  const { data } = await axios.get(`https://api.mandae.com.br/v3/trackings/${trackingId}`, {
    headers: { Authorization: mandaeToken },
    timeout: 7000,
  });
  const trackingResult = data?.events?.[0];
  if (!trackingResult) return;
  const status = parseMandaeStatus(trackingResult);
  const savedTrackingCode = lineTrackingCodes.find(({ code }) => {
    return code === trackingId;
  });
  if (!savedTrackingCode && status !== 'delivered') {
    logger.info(`Re-exporting ${number} with ID ${trackingId}`);
    await exportOrder({ order, mandaeToken, mandaeOrderSettings });
    return;
  }
  if (!status) {
    logger.warn(`No parsed fulfillment status for ${number}`, {
      trackingId,
      trackingResult,
    });
    return;
  }
  if (!lineTrackingCodes.find(({ code }) => code === trackingId)) {
    lineTrackingCodes.push({
      tag: 'mandae',
      code: trackingId,
      link: `https://rastreae.com.br/resultado/${trackingId}`,
    });
    await api.patch(`orders/${order._id}/shipping_lines/${shippingLine._id}`, {
      tracking_codes: lineTrackingCodes,
    });
  }
  if (status !== order.fulfillment_status?.current) {
    await api.post(`orders/${order._id}/fulfillments`, {
      shipping_line_id: shippingLine._id,
      date_time: new Date().toISOString(),
      status,
      notification_code: `mandae:${trackingResult.id}`,
      flags: ['mandae'],
    });
    logger.info(`${number} updated to ${status}`);
  }
};

export const trackUndeliveredOrders = async () => {
  const startDate = new Date();
  const isOddMinExec = !!(startDate.getMinutes() % 2);
  const isOddHourExec = !!(startDate.getHours() % 2);
  const appData = await getAppData();
  const mandaeToken = appData?.mandae_token;
  if (!mandaeToken) return;
  const mandaeOrderSettings = appData.order_settings || appData.__order_settings;
  if (mandaeOrderSettings?.data || mandaeOrderSettings?.customerId) {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    const endpoint = 'orders'
      + '?fields=_id,number,fulfillment_status,shipping_lines'
      + '&shipping_lines.tracking_codes.tag=mandae'
      + '&financial_status.current=paid'
      + `&fulfillment_status.current${(isOddHourExec ? '=ready_for_shipping' : '!=delivered')}`
      + `&updated_at>=${d.toISOString()}`
      + `&sort=${(isOddMinExec ? '-' : '')}${(isOddHourExec ? 'number' : 'updated_at')}`
      + '&limit=200' as `orders?${string}`;
    logger.info('Start tracking orders', { endpoint });
    try {
      const { data } = await api.get(endpoint);
      const orders = data.result;
      logger.info(`${orders.length} orders listed`, {
        ids: orders.map(({ _id }) => _id),
        numbers: orders.map(({ number }) => number),
      });
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        // eslint-disable-next-line no-await-in-loop
        await Promise.race([
          new Promise((resolve) => { setTimeout(() => resolve(null), 150); }),
          importOrderStatus({ order, mandaeToken, mandaeOrderSettings })
            .catch((error: any) => {
              if (
                error.response?.data?.error?.code === '404'
                || (error.response?.status > 403 && error.response.status < 500)
              ) {
                const err = new Error(`Failed importing order ${order.number} status for`);
                logger.error(err, {
                  request: error.config,
                  response: error.response.data,
                });
              } else {
                throw error;
              }
            }),
        ]);
      }
    } catch (_err: any) {
      if (_err.response) {
        const err = new Error('Failed importing orders status for');
        logger.error(err, {
          request: _err.config,
          response: _err.response.data,
        });
      } else {
        logger.error(_err);
      }
    }
  }
};

export default trackUndeliveredOrders;
