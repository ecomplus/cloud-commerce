import type { Orders } from '@cloudcommerce/types';
import logger from 'firebase-functions/logger';
import api from '@cloudcommerce/api';
import postTiny from './post-tiny-erp';
import parseStatus from './parsers/status-to-tiny';
import parseOrder from './parsers/order-to-tiny';

export default async (apiDoc, queueEntry, appData, canCreateNew) => {
  const orderId = queueEntry.nextId;
  let order: Orders;
  if (orderId === apiDoc._id) {
    order = apiDoc;
  } else {
    try {
      order = (await api.get(`orders/${orderId}`)).data;
    } catch (err: any) {
      if (err.statusCode === 404) {
        const msg = `O pedido ${orderId} não existe (:${err.statusCode})`;
        const error: any = new Error(msg);
        error.isConfigError = true;
        return error;
      }
      throw err;
    }
  }
  if (!order.financial_status) {
    logger.info(`${orderId} skipped with no financial status`);
    return null;
  }
  logger.info(`${orderId} searching order ${order.number}`);

  let tinyData: { pedidos?: any };
  try {
    tinyData = await postTiny('/pedidos.pesquisa.php', {
      numeroEcommerce: String(order.number),
    });
  } catch (err: any) {
    const status = err.response && err.response.status;
    if (status === 404) {
      tinyData = {};
    } else {
      logger.info(`${orderId} search on tiny ends with status ${status}`);
      throw err;
    }
  }

  const { pedidos } = tinyData;
  const tinyStatus = parseStatus(order);
  let originalTinyOrder;
  if (Array.isArray(pedidos)) {
    originalTinyOrder = pedidos.find(({ pedido }) => {
      return order.number === Number(pedido.numero_ecommerce);
    });
    if (originalTinyOrder) {
      originalTinyOrder = originalTinyOrder.pedido;
    }
  }
  if (!originalTinyOrder) {
    if (!canCreateNew) {
      return null;
    }
    if (
      appData.approved_orders_only
      && (tinyStatus === 'aberto' || tinyStatus === 'cancelado')
    ) {
      logger.info(`${orderId} skipped with status "${tinyStatus}"`);
      return null;
    }
    const tinyOrder = parseOrder(order, appData);
    logger.info(`${orderId} ${JSON.stringify(tinyOrder)}`);
    return postTiny('/pedido.incluir.php', {
      pedido: {
        pedido: tinyOrder,
      },
    });
  }

  if (originalTinyOrder) {
    const { id, situacao } = originalTinyOrder;
    logger.info(`${orderId} found with tiny status ${situacao} => ${tinyStatus}`);
    if (tinyStatus && tinyStatus !== situacao) {
      return postTiny('/pedido.alterar.situacao', {
        id,
        situacao: tinyStatus,
      });
    }
  }
  return null;
};
