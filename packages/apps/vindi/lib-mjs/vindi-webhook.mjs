import api from '@cloudcommerce/api';
import { logger } from '@cloudcommerce/firebase/lib/config';
import getAppData from '@cloudcommerce/firebase/lib/helpers/get-app-data';
import { parseVindiStatus, createVindiAxios } from './util/vindi-utils.mjs';

const handleVindiWebhook = async (req, res) => {
  const vindiEvent = req.body?.event;
  if (!vindiEvent?.data || !vindiEvent.type) {
    return res.sendStatus(400);
  }
  if (vindiEvent.type === 'test') {
    return res.sendStatus(200);
  }
  let vindiSandbox;
  if (!process.env.VINDI_API_KEY) {
    const appData = await getAppData('vindi');
    process.env.VINDI_API_KEY = appData.vindi_api_key;
    vindiSandbox = appData.vindi_sandbox;
  }
  const { VINDI_API_KEY } = process.env;
  if (!VINDI_API_KEY) {
    return res.sendStatus(403);
  }
  const data = vindiEvent.data.id
    ? vindiEvent.data
    : (vindiEvent.data.bill || vindiEvent.data.charge);
  if (!data.id) {
    logger.warn('Vindi Hook unexpected data:', { data });
    return res.sendStatus(400);
  }

  logger.info(`Vindi Hook ${vindiEvent.type} ${data.id}`);
  const isVindiCharge = vindiEvent.type.startsWith('charge_');
  const axiosVindi = createVindiAxios(VINDI_API_KEY, vindiSandbox);
  const { data: vindiBillRes } = await axiosVindi
    .get('/bills/' + (isVindiCharge ? data.bill.id : data.id));
  const vindiBill = vindiBillRes.bill || vindiBillRes;
  if (!vindiBill?.charges?.[0]) {
    logger.warn(`Vindi bill unset or unexpected for ${data.id}`, { vindiBill });
    return res.sendStatus(204);
  }
  const vindiCharge = vindiBill.charges[0];

  const ordersFilter = data.metadata?.order_id
    ? `_id=${data.metadata.order_id}`
    : `transactions.intermediator.transaction_code=${vindiCharge.id}`;
  const {
    data: { result: [order] },
  } = await api.get(`orders?${ordersFilter}&fields=_id,transactions&limit=1`);
  if (!order) {
    logger.warn(`Order not found for ${vindiCharge.id}`, {
      ordersFilter,
      body: req.body,
      vindiCharge,
    });
    return res.sendStatus(204);
  }

  let status;
  switch (vindiEvent.type) {
    case 'charge_rejected':
      status = 'unauthorized';
      break;
    case 'charge_refunded':
      status = 'refunded';
      break;
    default:
      status = parseVindiStatus(vindiCharge.status);
  }
  // single bill
  // async cancell Vindi bill when transaction is cancelled
  switch (status) {
    case 'voided':
    case 'refunded':
    case 'unauthorized':
      axiosVindi.delete('/bills/' + vindiBill.id)
        .catch((error) => {
          if (error.response) {
            const err = new Error('Delete bill error');
            err.config = error.config;
            err.data = JSON.stringify(error.response.data);
            err.status = error.response.status;
          } else {
            logger.error(error);
          }
        });
      break;
    default:
  }

  const transaction = order.transactions?.find(({ intermediator }) => {
    return intermediator?.transaction_code === String(vindiCharge.id);
  });
  if (transaction?._id) {
    await api.post(`orders/${order._id}/payments_history`, {
      date_time: new Date().toISOString(),
      status,
      transaction_id: transaction._id,
      notification_code: vindiEvent.type + ';' + vindiEvent.created_at,
      flags: ['vindi'],
    });
    logger.info(`Updated ${order._id} to ${status}`);
    return res.sendStatus(201);
  }
  return res.sendStatus(200);
};

export default handleVindiWebhook;
