import type { ResourceId, Orders } from '@cloudcommerce/types';
import logger from 'firebase-functions/logger';
import api from '@cloudcommerce/api';
import config from '@cloudcommerce/firebase/lib/config';
import axios from 'axios';
import * as ecomUtils from '@ecomplus/utils';

export const getConfig = async () => {
  try {
    const app = (await api.get(
      `applications?app_id=${config.get().apps.mandae.appId}&fields=hidden_data`,
    )).data.result;
    return app[0].hidden_data;
  } catch (err) {
    logger.error(err);
    return null;
  }
};

export const exportOrder = async ({ order, mandaeToken, mandaeOrderSettings }: {
  order: Partial<Orders> & { _id: ResourceId },
  mandaeToken: string,
  mandaeOrderSettings: Record<string, any>,
}) => {
  if (!mandaeOrderSettings.data?.customerId) {
    mandaeOrderSettings.data = {
      customerId: mandaeOrderSettings.customer_id,
      sender: {
        fullName: mandaeOrderSettings.sender_full_name,
        email: mandaeOrderSettings.sender_email,
        document: mandaeOrderSettings.sender_document,
        ie: mandaeOrderSettings.sender_ie,
        address: {
          postalCode: String(mandaeOrderSettings.sender_zip),
          street: mandaeOrderSettings.sender_street,
          number: String(mandaeOrderSettings.sender_number),
          neighborhood: mandaeOrderSettings.sender_neighborhood,
          addressLine2: mandaeOrderSettings.sender_line_2,
          city: mandaeOrderSettings.sender_city,
          state: mandaeOrderSettings.sender_state,
          country: mandaeOrderSettings.sender_country,
        },
      },
      channel: 'ecommerce',
      store: mandaeOrderSettings.store,
    };
  }
  const { number } = order;
  const buyer = order.buyers?.[0];
  if (!buyer) return;
  const shippingLine = order.shipping_lines?.find(({ app }) => app?.carrier === 'MANDAE');
  if (!shippingLine?._id) return;
  const invoice = shippingLine.invoices?.[0];
  if (!invoice?.number || !invoice.serial_number || !invoice.access_key) {
    logger.warn(`Skipping ${number} without invoice data`);
    return;
  }
  const trackingId = (mandaeOrderSettings.tracking_prefix || '')
    + invoice.number.replace(/^0+/, '').trim()
    + invoice.serial_number.replace(/^0+/, '').trim();
  const lineTrackingCodes = shippingLine.tracking_codes || [];
  const savedTrackingCode = lineTrackingCodes.find(({ code }) => {
    return code === trackingId;
  });
  if (savedTrackingCode) {
    logger.warn(`Skipping ${number} with tracking code already set`);
    if (!savedTrackingCode.tag) {
      savedTrackingCode.tag = 'mandae';
      await api.patch(`orders/${order._id}/shipping_lines/${shippingLine._id}`, {
        tracking_codes: lineTrackingCodes,
      });
    }
    return;
  }
  logger.info(`Sending ${number} with tracking ID ${trackingId}`);
  const {
    customerId, sender, channel, store,
  } = mandaeOrderSettings.data;
  const data = {
    customerId,
    items: [{
      skus: order.items?.map((item) => ({
        skuId: item.sku,
        description: item.name?.trim(),
        price: ecomUtils.price(item),
        quantity: item.quantity,
      })),
      invoice: {
        id: invoice.number,
        key: invoice.access_key,
        type: 'NFe',
      },
      trackingId,
      partnerItemId: `${number}`,
      recipient: {
        fullName: ecomUtils.fullName(buyer),
        phone: ecomUtils.phone(buyer),
        email: buyer.main_email,
        document: buyer.doc_number,
        address: {
          country: 'BR',
          postalCode: shippingLine.to.zip.replace(/\D/g, ''),
          number: shippingLine.to.number?.toString() || 'SN',
          street: shippingLine.to.street,
          neighborhood: shippingLine.to.borough || 'Centro',
          addressLine2: shippingLine.to.complement,
          city: shippingLine.to.city,
          state: shippingLine.to.province_code,
          reference: shippingLine.to.near_to,
        },
      },
      sender,
      shippingService: order.shipping_method_label?.trim() || 'NA',
      channel,
      store,
      totalValue: order.amount?.total,
      totalFreight: order.amount?.freight || 0,
    }],
    observation: null,
  };
  try {
    await axios.post('https://api.mandae.com.br/v2/orders/add-parcel', data, {
      headers: { Authorization: mandaeToken },
      timeout: 7000,
    });
  } catch (error: any) {
    if (!error.response?.data?.error?.message?.endsWith(' já foi utilizado')) {
      throw error;
    }
  }
  await api.patch(`orders/${order._id}/shipping_lines/${shippingLine._id}`, {
    tracking_codes: [
      {
        tag: 'mandae',
        code: trackingId,
        link: `https://rastreae.com.br/resultado/${trackingId}`,
      },
      ...lineTrackingCodes,
    ],
  });
};

export const sendWaitingOrders = async () => {
  const isOddExec = !!(new Date().getMinutes() % 2);
  const appConfig = await getConfig();
  const mandaeToken = appConfig?.mandae_token;
  if (!mandaeToken) return;
  const mandaeOrderSettings = appConfig.order_settings || appConfig.__order_settings;
  if (mandaeOrderSettings?.data || mandaeOrderSettings?.customerId) {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    const endpoint = 'orders'
      + '?fields=_id,number,amount,fulfillment_status,shipping_lines'
        + ',shipping_method_label,buyers'
        + ',items.sku,items.name,items.final_price,items.price,items.quantity'
      + '&shipping_lines.app.carrier=MANDAE'
      + '&shipping_lines.tracking_codes.tag!=mandae'
      + '&financial_status.current=paid'
      + '&fulfillment_status.current=ready_for_shipping'
      + `&updated_at>=${d.toISOString()}`
      + `&sort=${(isOddExec ? '-' : '')}number`
      + '&limit=200' as `orders?${string}`;
    try {
      const { data } = await api.get(endpoint);
      const orders = data.result;
      logger.info('Start exporting orders', { orders });
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        // eslint-disable-next-line no-await-in-loop
        await Promise.race([
          new Promise((resolve) => { setTimeout(() => resolve(null), 150); }),
          exportOrder({ order, mandaeToken, mandaeOrderSettings })
            .catch((error: any) => {
              if (error.response?.data?.error?.code === '422') {
                const err = new Error(`Failed exporting order ${order.number}`);
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
        const err = new Error('Failed exporting orders');
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

export default sendWaitingOrders;
