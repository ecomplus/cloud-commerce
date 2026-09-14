import type { Orders } from '@cloudcommerce/types';
import api from '@cloudcommerce/api';
import { logger } from '@cloudcommerce/firebase/lib/config';
import { createBlingClient } from '../bling-auth/client';
import parseOrder from './parsers/order-from-bling';
import parseStatusFromBling from './parsers/status-from-bling';
import shouldAdvanceFulfillment from './helpers/should-advance-fulfillment';
import shouldApplyFinancialStatus from './helpers/should-apply-financial-status';

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

  /*
  O rastreio completo só vem no corpo do callback do Bling — o
  `GET /pedidos/vendas/{id}` nunca devolve `urlRastreamento` —, então os
  campos de transporte do callback são fundidos no pedido relido da API.
  `_callbackOrder` só chega aqui de requisição com o token validado
  (`bling-callback.ts`): corpo anônimo nunca é gravado sem confirmação.
  */
  const callbackOrder = queueEntry._callbackOrder as Record<string, any> | undefined;
  if (callbackOrder) {
    if (callbackOrder.transporte?.volumes?.length) {
      blingOrder.transporte = {
        ...blingOrder.transporte,
        volumes: callbackOrder.transporte.volumes,
      };
    }
    if (callbackOrder.codigosRastreamento && !blingOrder.codigosRastreamento) {
      blingOrder.codigosRastreamento = callbackOrder.codigosRastreamento;
    }
  }

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

  const partialOrder = parseOrder(blingOrder, order.shipping_lines);
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
      const currentStatus = getLastStatus(order[subresource]);
      if (!newStatus || currentStatus === newStatus) return;
      if (subresource === 'fulfillments' && !shouldAdvanceFulfillment(currentStatus, newStatus)) {
        // Conta Bling padrão colapsa "enviado"/"entregue" em "Atendido", que
        // volta como invoice_issued; não deixamos o pedido regredir de estado.
        logger.info(`Skipping fulfillment regression ${currentStatus} -> ${newStatus}`);
        return;
      }
      if (
        subresource === 'payments_history'
        && !shouldApplyFinancialStatus(currentStatus, newStatus)
      ) {
        // "Cancelado" é o alvo de estorno e cancelamento; na volta vira sempre
        // `voided` e apagaria o `refunded` que o gateway acabou de gravar.
        logger.info(`Skipping financial downgrade ${currentStatus} -> ${newStatus}`);
        return;
      }
      promises.push(api.post(`orders/${order._id}/${subresource}`, {
        ...statusBody,
        status: newStatus,
      } as any));
    });

  const [firstResult] = await Promise.all(promises);
  return firstResult || null;
};

export default importOrderFromBling;
