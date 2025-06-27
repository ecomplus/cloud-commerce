import api from '@cloudcommerce/api';
import { logger } from '@cloudcommerce/firebase/lib/config';
import getAppData from '@cloudcommerce/firebase/lib/helpers/get-app-data';
import axios from 'axios';
import parseStatus from './lib/parse-status.mjs';

const handleAppmaxWehook = async (req, res) => {
  const appmaxOrderId = req.body?.data?.id;
  if (!appmaxOrderId) {
    return res.sendStatus(400);
  }
  if (!process.env.APPMAX_TOKEN) {
    const appData = await getAppData('appmax');
    process.env.APPMAX_TOKEN = appData.token;
  }
  const { APPMAX_TOKEN } = process.env;
  if (!APPMAX_TOKEN) {
    return res.sendStatus(403);
  }
  const response = await axios.get(
    `https://admin.appmax.com.br/api/v3/order/${appmaxOrderId}`,
    {
      params: { 'access-token': APPMAX_TOKEN },
    },
    {
      maxRedirects: 0,
      validateStatus(status) {
        return (status >= 200 && status <= 301) || status === 403;
      },
    },
  );
  if (response.status === 403) {
    logger.warn('Appmax order 403 (other store ?)', { appmaxOrderId });
    return res.sendStatus(204);
  }
  const appmaxOrder = response?.data?.data;
  if (!appmaxOrder?.status) {
    logger.warn('Appmax order status undefined', {
      appmaxOrderId,
      webhookBody: req.body,
      appmaxOrder,
    });
    return res.sendStatus(204);
  }
  const {
    data: { result: [order] },
  } = await api.get('orders'
    + `?transactions.intermediator.transaction_id=${appmaxOrderId}`
    + '&fields=_id,transactions'
    + '&limit=1');
  if (!order) {
    logger.warn(`Order not found for ${appmaxOrderId}`, {
      body: req.body,
      appmaxOrder,
    });
    return res.sendStatus(204);
  }
  const transaction = order.transactions?.find(({ intermediator }) => {
    return intermediator?.transaction_id === String(appmaxOrderId);
  });
  if (transaction?._id) {
    const status = parseStatus(appmaxOrder.status);
    await api.post(`orders/${order._id}/payments_history`, {
      date_time: new Date().toISOString(),
      status,
      transaction_id: transaction._id,
      flags: ['appmax'],
    });
    logger.info(`Upated ${order._id} to ${status}`);
    return res.sendStatus(201);
  }
  return res.sendStatus(200);
};

export default handleAppmaxWehook;
