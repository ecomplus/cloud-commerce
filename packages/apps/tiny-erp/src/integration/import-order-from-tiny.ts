import { getFirestore } from 'firebase-admin/firestore';
import { logger } from '@cloudcommerce/firebase/lib/config';
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

    const { data: { result } } = await api.get('orders', {
      fields: ['_id', 'payments_history', 'fulfillments', 'shipping_lines'] as const,
      limit: 1,
      params: {
        number: orderNumber || undefined,
        'hidden_metafields.value': orderNumber ? undefined : `${tinyOrderId}_tiny`,
      },
    });
    if (!result.length) {
      return null;
    }
    const order = result[0];
    const partialOrder = await parseOrder(pedido, order.shipping_lines);
    const promises: Promise<any>[] = [];
    if (partialOrder && Object.keys(partialOrder).length) {
      promises.push(api.patch(`orders/${order._id}`, partialOrder));
    }
    const { fulfillmentStatus, financialStatus } = parseStatus(situacao);
    const data: Record<string, any> = {
      date_time: new Date().toISOString(),
      flags: ['from-tiny', `tiny:${situacao}`.substring(0, 50)],
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
  const filter = typeof tinyOrderNumber === 'string' && tinyOrderNumber.startsWith('ecom:')
    ? { numeroEcommerce: tinyOrderNumber.substring(5) }
    : { numero: tinyOrderNumber };
  return postTiny('/pedidos.pesquisa.php', filter).then(({ pedidos }) => {
    let prop = 'numero';
    let tinyOrderNumberSearch = tinyOrderNumber;
    if (filter && filter.numeroEcommerce) {
      prop = 'numero_ecommerce';
      tinyOrderNumberSearch = tinyOrderNumber.substring(5);
    }
    const tinyOrder = pedidos.find(({ pedido }) => {
      return Number(tinyOrderNumberSearch) === Number(pedido[prop]);
    });

    if (tinyOrder) {
      return getTinyOrder(tinyOrder.pedido.id);
    }
    return null;
  });
};
