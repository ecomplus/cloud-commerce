import type { Orders } from '@cloudcommerce/types';
import api from '@cloudcommerce/api';
import { logger } from '@cloudcommerce/firebase/lib/config';
import { createBlingClient } from '../bling-auth/client';
import parseOrder from './parsers/order-from-bling';
import parseStatusFromBling from './parsers/status-from-bling';

const getLastStatus = (records: Array<Record<string, any>> | undefined) => {
  let statusRecord: Record<string, any> | undefined;
  records?.forEach((record) => {
    if (
      record
      && (!statusRecord || !record.date_time || record.date_time >= statusRecord.date_time)
    ) {
      statusRecord = record;
    }
  });
  return statusRecord?.status;
};

const importOrderFromBling = async (
  _apiDoc: Record<string, any>,
  queueEntry: Record<string, any>,
  appData: Record<string, any>,
) => {
  const blingOrderNumber = queueEntry.nextId;
  const bling = createBlingClient(appData);

  const { data: { data: foundOrders } } = await bling
    .get(`/pedidos/vendas?limite=1&numero=${blingOrderNumber}`);
  const blingOrderId = Array.isArray(foundOrders) && foundOrders.length && foundOrders[0].id;
  if (!blingOrderId) {
    const err: any = new Error(`Pedido ${blingOrderNumber} não encontrado no Bling`);
    err.isConfigError = true;
    return err;
  }
  const { data: { data: blingOrder } } = await bling.get(`/pedidos/vendas/${blingOrderId}`);
  logger.info(`Found Bling order ${blingOrder.numero}`);

  const situacao = blingOrder.situacao?.id
    ? await bling.get(`/situacoes/${blingOrder.situacao.id}`)
      .then(({ data }) => data.data?.nome?.toLowerCase())
    : null;

  const number = blingOrder.numeroLoja?.length ? blingOrder.numeroLoja : blingOrder.numero;
  const endpoint = 'orders'
    + '?fields=_id,payments_history,fulfillments,shipping_lines'
    + `&number=${number}`
    + '&limit=1' as `orders?${string}`;
  const { data: { result } } = await api.get(endpoint);
  if (!result.length) {
    logger.info(`Order ${number} not found on store`);
    return null;
  }
  const order = result[0] as Orders;

  const partialOrder = await parseOrder(blingOrder, order.shipping_lines, bling);
  const promises: Array<Promise<any>> = [];
  if (partialOrder && Object.keys(partialOrder).length) {
    promises.push(api.patch(`orders/${order._id}`, partialOrder));
  }

  const { financialStatus, fulfillmentStatus } = parseStatusFromBling(situacao, appData);
  const statusBody = {
    date_time: new Date().toISOString(),
    flags: ['from-bling'],
  };
  ([
    [financialStatus, 'payments_history'],
    [fulfillmentStatus, 'fulfillments'],
  ] as Array<[string | undefined, 'payments_history' | 'fulfillments']>)
    .forEach(([newStatus, subresource]) => {
      if (newStatus && getLastStatus(order[subresource]) !== newStatus) {
        promises.push(api.post(`orders/${order._id}/${subresource}`, {
          ...statusBody,
          status: newStatus,
        } as any));
      }
    });

  const [firstResult] = await Promise.all(promises);
  return firstResult || null;
};

export default importOrderFromBling;
