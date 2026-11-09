import type { Orders } from '@cloudcommerce/types';
import { logger } from '@cloudcommerce/firebase/lib/config';
import { acquireExportLock } from '@cloudcommerce/firebase/lib/helpers/export-lock';
import api from '@cloudcommerce/api';
import postTiny from './post-tiny-erp';
import parseStatusToTiny from './parsers/status-to-tiny';
import parseTinyStatus from './parsers/status-from-tiny';
import parseOrder from './parsers/order-to-tiny';

const EXPORT_LOCKS_COLLECTION = 'tinyErpExportLocks';
/* Longer than anything holding the lock can live: the events function times out
in 60s, and the cron holds it for a single order (the POST times out in 30s). */
const EXPORT_LOCK_STALE_MS = 1000 * 60 * 2;
const CONCURRENT_EXPORT_WAIT_MS = 20000;

/* `pedido.incluir.php` returns the created order in `registros.registro` */
const getCreatedTinyId = (response: Record<string, any>) => {
  const { registros } = response;
  const registro = (Array.isArray(registros) ? registros[0] : registros)?.registro;
  return registro?.id as string | number | undefined;
};

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
  const searchTinyOrder = async () => {
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
        if (!status) {
          logger.error(err);
        }
        throw err;
      }
    }
    const { pedidos } = tinyData;
    if (!Array.isArray(pedidos)) return undefined;
    const foundEntry = pedidos
      .sort((a: { pedido: Record<string, any> }, b: { pedido: Record<string, any> }) => {
        return a.pedido.id < b.pedido.id ? 1 : -1;
      })
      .find(({ pedido }) => {
        return order.number === Number(pedido.numero_ecommerce);
      });
    return foundEntry?.pedido as undefined | Record<string, any>;
  };

  let originalTinyOrder = await searchTinyOrder();

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
    const exportLock = await acquireExportLock(EXPORT_LOCKS_COLLECTION, orderId, {
      staleLockMs: EXPORT_LOCK_STALE_MS,
      maxWaitMs: queueEntry.concurrentExportWaitMs ?? CONCURRENT_EXPORT_WAIT_MS,
    });
    if (!exportLock.isLocked) {
      /* Created by a concurrent execution while this one waited, the search above
      could not see it: falls through to the status update on that order. */
      const { exported } = exportLock;
      originalTinyOrder = exported.id
        ? { id: exported.id, situacao: exported.situacao }
        : await searchTinyOrder();
      if (!originalTinyOrder) {
        logger.warn(`${orderId} exported by a concurrent execution but not found`);
        return null;
      }
    } else {
      let tinyOrder: Record<string, any>;
      let response: Record<string, any>;
      try {
        tinyOrder = await parseOrder(order, appData);
        try {
          logger.info(`Posting ${orderId}`, { tinyOrder });
        } catch {
          logger.info(`Posting ${orderId} (stringify failed)`);
        }
        exportLock.setSending();
        response = await postTiny('/pedido.incluir.php', {
          pedido: {
            pedido: tinyOrder,
          },
        });
      } catch (err) {
        await exportLock.fail(err);
        throw err;
      }
      logger.info(`Created ${orderId} on Tiny`, { response });
      await exportLock.complete({
        id: getCreatedTinyId(response),
        situacao: tinyOrder.situacao,
      });
      const tinyErpOnNewOrder = global.$tinyErpOnNewOrder;
      if (tinyErpOnNewOrder && typeof tinyErpOnNewOrder === 'function') {
        return tinyErpOnNewOrder({ response, order, postTiny });
      }
      return response;
    }
  }

  if (originalTinyOrder) {
    const { id, situacao } = originalTinyOrder;
    logger.info(`${orderId} found with tiny status ${situacao} => ${tinyStatus} and id ${id}`);
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
