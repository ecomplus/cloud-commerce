import type { Orders } from '@cloudcommerce/types';
import logger from 'firebase-functions/logger';
import api from '@cloudcommerce/api';
import postTiny from './post-tiny-erp';
import parseStatusToTiny from './parsers/status-to-tiny';
import parseTinyStatus from './parsers/status-from-tiny';
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
  let lastFulfillment: undefined | Exclude<(typeof order)['fulfillments'], undefined>[0];
  order.fulfillments?.forEach((entry) => {
    if (!lastFulfillment) {
      lastFulfillment = entry;
      return;
    }
    if (!entry.date_time) {
      if (!lastFulfillment.date_time) {
        lastFulfillment = entry;
      }
      return;
    }
    if (!lastFulfillment.date_time || entry.date_time > lastFulfillment.date_time) {
      lastFulfillment = entry;
    }
  });
  const tinyStatus = parseStatusToTiny(order);
  if (
    (tinyStatus !== 'aberto' && tinyStatus !== 'cancelado')
    && lastFulfillment?.flags?.includes('from-tiny')
  ) {
    logger.info(`${orderId} skipped with last fulfillment status from Tiny`);
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
    if (appData.ready_for_shipping_only) {
      switch (tinyStatus) {
        case 'aberto':
        case 'cancelado':
        case 'aprovado':
        case 'preparando envio':
        case 'faturado':
          if (!order.fulfillment_status || order.fulfillment_status.current !== 'ready_for_shipping') {
            logger.info(`${orderId} skipped with status "${tinyStatus}"`);
            return null;
          }
          break;
        default:
          break;
      }
    }
    const tinyOrder = parseOrder(order, appData);
    logger.info(`${orderId} ${JSON.stringify(tinyOrder)}`);
    return postTiny('/pedido.incluir.php', {
      pedido: {
        pedido: tinyOrder,
      },
    }).then((response) => {
      const tinyErpOnNewOrder = global.$tinyErpOnNewOrder;
      if (tinyErpOnNewOrder && typeof tinyErpOnNewOrder === 'function') {
        return tinyErpOnNewOrder({ response, order, postTiny });
      }
      return response;
    });
  }

  if (originalTinyOrder) {
    const { id, situacao } = originalTinyOrder;
    logger.info(`${orderId} found with tiny status ${situacao} => ${tinyStatus}`);
    if (typeof situacao === 'string') {
      const { normalizedTinyStatus } = parseTinyStatus(tinyStatus);
      if (normalizedTinyStatus !== parseTinyStatus(situacao).normalizedTinyStatus) {
        return postTiny('/pedido.alterar.situacao', {
          id,
          situacao: tinyStatus,
        });
      }
    }
  }
  return null;
};
