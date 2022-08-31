import type { Orders } from '@cloudcommerce/types';
// eslint-disable-next-line import/no-unresolved
import { getFirestore } from 'firebase-admin/firestore';
import logger from 'firebase-functions/lib/logger';
import api from '@cloudcommerce/api';
import postTiny from './post-tiny-erp';
import parseOrder from './parsers/order-from-tiny';
import parseStatus from './parsers/status-from-tiny';

const getLastStatus = (records) => {
  let statusRecord;
  records.forEach((record) => {
    if (
      record
      && (!statusRecord || !record.date_time || record.date_time >= statusRecord.date_time)
    ) {
      statusRecord = record;
    }
  });
  return statusRecord && statusRecord.status;
};

export default async (apiDoc, queueEntry) => {
  const getTinyOrder = async (tinyOrderId) => {
    const { pedido } = await postTiny('/pedido.obter.php', {
      id: Number(tinyOrderId),
    });
    const situacao = typeof pedido.situacao === 'string'
      ? pedido.situacao.toLowerCase()
      : null;
    const orderNumber = pedido.numero_ecommerce;
    logger.info(`Import order n${orderNumber} ${tinyOrderId} => ${situacao}`);

    const documentRef = getFirestore().doc(`tinyErpOrders/${tinyOrderId}`);
    const documentSnapshot = await documentRef.get();
    if (
      documentSnapshot.exists
      && documentSnapshot.get('situacao') === situacao
    ) {
      logger.info(`>> Ignoring Tiny order n${orderNumber} ${tinyOrderId} with same status`);
      return null;
    }

    let listEndpoint = 'orders?limit=1&fields=_id,payments_history,fulfillments,shipping_lines';
    if (orderNumber) {
      listEndpoint += `&number=${orderNumber}`;
    } else {
      listEndpoint += `&hidden_metafields.value=${tinyOrderId}_tiny`;
    }
    const { data: { result } } = await api.get(listEndpoint as 'orders');
    if (!result.length) {
      return null;
    }
    const order = result[0];
    const partialOrder = await parseOrder(pedido, order.shipping_lines) as Orders;
    const promises: Promise<any>[] = [];
    if (partialOrder && Object.keys(partialOrder).length) {
      promises.push(api.patch(`orders/${order._id}`, partialOrder));
    }
    const { fulfillmentStatus, financialStatus } = parseStatus(situacao);
    const data: Record<string, any> = {
      date_time: new Date().toISOString(),
      flags: ['from-tiny'],
    };
    [
      [financialStatus, 'payments_history'],
      [fulfillmentStatus, 'fulfillments'],
    ].forEach(([newStatus, subresource]) => {
      if (
        newStatus
        // @ts-ignore
        && (!order[subresource] || getLastStatus(order[subresource]) !== newStatus)
      ) {
        data.status = newStatus;
        promises.push(api.post(`orders/${order._id}/${subresource}`, data as any));
        logger.info(`${order._id} updated to ${newStatus} from Tiny ${tinyOrderId}`);
      }
    });

    return Promise.all(promises)
      .then(([firstResult]) => {
        documentRef.set({ situacao }).catch(logger.error);
        return (firstResult && firstResult.response) || firstResult;
      });
  };

  const tinyOrderNumber = queueEntry.nextId;
  if (typeof tinyOrderNumber === 'string' && tinyOrderNumber.startsWith('id:')) {
    return getTinyOrder(tinyOrderNumber.substring(3));
  }
  return postTiny('/pedidos.pesquisa.php', {
    numero: tinyOrderNumber,
  }).then(({ pedidos }) => {
    const tinyOrder = pedidos.find(({ pedido }) => {
      return Number(tinyOrderNumber) === Number(pedido.numero);
    });
    if (tinyOrder) {
      return getTinyOrder(tinyOrder.pedido.id);
    }
    return null;
  });
};
