import type { Orders } from '@cloudcommerce/types';
import { URLSearchParams } from 'url';
import ecomUtils from '@ecomplus/utils';
import api from '@cloudcommerce/api';
import { logger } from '@cloudcommerce/firebase/lib/config';
import { createBlingClient } from '../bling-auth/client';
import parseOrder from './parsers/order-to-bling';
import parseStatusToBling from './parsers/status-to-bling';
import getCustomerBling from './helpers/get-customer-bling';
import getProductsBling from './helpers/get-products-bling';
import { getPaymentBling } from './helpers/payment-method';
import getStatusBling from './helpers/get-status-bling';

/*
`canCreateNew` is a tri-state:
- `true`: always create the order on Bling when not found;
- `undefined`: create only when the order was never exported (no `bling:id` metafield);
- `false`: never create.
*/
const exportOrderToBling = async (
  apiDoc: Record<string, any>,
  queueEntry: Record<string, any>,
  appData: Record<string, any>,
  canCreateNew?: boolean,
) => {
  const orderId = queueEntry.nextId;
  let order: Orders;
  if (orderId === apiDoc._id) {
    order = apiDoc as Orders;
  } else {
    try {
      order = (await api.get(`orders/${orderId}`)).data;
    } catch (err: any) {
      const status = err.statusCode || err.response?.status;
      if (status >= 400 && status < 500) {
        const error: any = new Error(`O pedido ${orderId} não existe (:${status})`);
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

  const blingStore = appData.bling_store;
  const transaction = order.transactions?.[0];
  const metafields = (order.metafields || []) as Array<Record<string, any>>;
  const metafieldId = metafields.find(({ field }) => field === 'bling:id');
  let blingOrderNumber = metafields.find(({ field }) => field === 'bling:numero')?.value;
  let blingOrderId: string | number | undefined;
  let hasCreatedBlingOrder = false;
  if (metafieldId) {
    if (metafieldId.value === 'skip') {
      logger.info(`${orderId} skipped by metafield`);
      return null;
    }
    blingOrderId = metafieldId.value;
    hasCreatedBlingOrder = Boolean(blingOrderId);
  }

  /* Com `random_order_number` o pedido está no Bling sob o número guardado em
  `bling:numero`; sem ele (primeira exportação) não há número a procurar, e a
  busca era montada com `numero=undefined`, rejeitada pela API do Bling. */
  const searchOrderNumber = appData.random_order_number === true
    ? blingOrderNumber
    : order.number;
  let searchEndpoint: string | undefined;
  if (searchOrderNumber) {
    const urlParams: Record<string, string> = { numero: String(searchOrderNumber) };
    if (blingStore) {
      urlParams.idLoja = String(blingStore);
    }
    searchEndpoint = `/pedidos/vendas?${new URLSearchParams(urlParams).toString()}`;
  }
  const bling = createBlingClient(appData);

  const allStatusBling = await getStatusBling(bling);
  const blingStatuses = parseStatusToBling(order, appData);

  let blingSavedOrder: Record<string, any> | undefined;
  const findBlingOrder = async () => {
    const endpoint = hasCreatedBlingOrder
      ? `/pedidos/vendas/${blingOrderId}`
      : searchEndpoint;
    if (!endpoint) {
      return undefined;
    }
    try {
      return (await bling.get(endpoint)).data.data;
    } catch (err: any) {
      if (err.response?.status !== 404) {
        throw err;
      }
      if (hasCreatedBlingOrder) {
        hasCreatedBlingOrder = false;
        blingOrderId = undefined;
        if (searchEndpoint) {
          try {
            return (await bling.get(searchEndpoint)).data.data;
          } catch (retryErr: any) {
            if (retryErr.response?.status !== 404) {
              throw retryErr;
            }
          }
        }
      }
      logger.warn(`Order not found on Bling ${endpoint}`);
      return undefined;
    }
  };

  const data = await findBlingOrder();
  const hasFoundByNumber = Boolean(Array.isArray(data) && data.length);
  if (Array.isArray(data)) {
    blingSavedOrder = data.find((pedido) => {
      if (String(order.number) === pedido.numeroLoja) {
        return !blingStore || String(blingStore) === String(pedido.loja?.id);
      }
      return false;
    });
    if (!blingSavedOrder && blingOrderNumber) {
      blingSavedOrder = data.find((pedido) => String(pedido.numero) === String(blingOrderNumber));
    }
  } else if (data) {
    blingSavedOrder = data;
  }

  if (blingSavedOrder) {
    blingOrderId = blingSavedOrder.id;
  } else if (canCreateNew === false || (!canCreateNew && hasCreatedBlingOrder)) {
    logger.info(`${orderId} skipped without creating new Bling order`);
  } else {
    if (appData.approved_orders_only && blingStatuses) {
      const isNotApproved = blingStatuses.some((blingStatus) => {
        return blingStatus === 'pendente' || blingStatus === 'cancelado';
      });
      if (isNotApproved) {
        logger.info(`${orderId} skipped with status "${blingStatuses[0]}"`);
        return null;
      }
    }
    if (!blingOrderNumber) {
      blingOrderNumber = (hasFoundByNumber || appData.random_order_number === true)
        ? String(Math.floor(Math.random() * (99999999 - 10000000)) + 10000000)
        : String(order.number);
    }

    const customerIdBling = await getCustomerBling(bling, appData, order);
    if (!customerIdBling) {
      throw new Error('Bling Customer not found');
    }
    /* Buscado só quando o pedido vai ser criado/atualizado de fato: mudança de
    status de pedido já exportado não usa forma de pagamento nem itens. */
    const paymentTypeId = transaction
      ? await getPaymentBling(bling, transaction, appData.parse_payment, order.payment_method_label)
      : null;
    const itemsBling = await getProductsBling(bling, order);
    const blingOrder = parseOrder(
      order,
      blingOrderNumber,
      blingStore,
      appData,
      customerIdBling,
      paymentTypeId,
      itemsBling,
      blingSavedOrder,
    );
    const endpoint = `/pedidos/vendas${blingOrderId ? `/${blingOrderId}` : ''}`;
    const method = blingOrderId ? 'put' : 'post';
    logger.info(`[${method}]: ${endpoint} for ${order._id}`, { blingOrder, blingStatuses });
    try {
      const { data: { data: savedData } } = await bling[method](endpoint, blingOrder);
      logger.info(`Bling order ${method === 'put' ? 'upd' : 'cre'}ated successfully`);
      if (savedData?.id) {
        blingSavedOrder = blingOrder;
        blingOrderId = savedData.id;
        if (metafieldId) {
          metafieldId.value = String(blingOrderId);
        } else {
          metafields.push({
            _id: ecomUtils.randomObjectId(),
            namespace: 'bling',
            field: 'bling:id',
            value: String(blingOrderId),
          });
        }
        /* Guardado para a busca por número funcionar quando o número do Bling
        não é o da loja (`random_order_number` ou colisão de numeração). */
        if (
          blingOrderNumber
          && !appData.disable_order_number
          && !metafields.some(({ field }) => field === 'bling:numero')
        ) {
          metafields.push({
            _id: ecomUtils.randomObjectId(),
            namespace: 'bling',
            field: 'bling:numero',
            value: String(blingOrderNumber),
          });
        }
        await api.patch(`orders/${order._id}`, { metafields } as any).catch(logger.error);
      }
    } catch (err: any) {
      if (err.response) {
        logger.warn(`Failed exporting order ${order._id}`, {
          blingOrder,
          response: err.response.data,
        });
      }
      throw err;
    }
  }

  if (blingOrderId && blingStatuses) {
    /*
    Bling accounts with the default "situações" don't have an equivalent for
    every store status (`ready_for_shipping`, for one). The order is already
    exported at this point, so a missing match only skips the status update —
    the merchant can create the "situação" on Bling or map it on `parse_status`.
    */
    if (!allStatusBling) {
      logger.warn(`${orderId} status not updated: no "situações" listed from Bling`);
      return null;
    }
    let newStatusBling: Record<string, any> | undefined;
    for (let i = 0; i < blingStatuses.length && !newStatusBling; i++) {
      const blingStatus = blingStatuses[i];
      newStatusBling = allStatusBling.find(({ nome }) => nome?.toLowerCase() === blingStatus);
    }
    if (!newStatusBling?.id) {
      logger.warn(`${orderId} status not updated: no Bling "situação" matches`, {
        blingStatuses,
        blingSituacoes: allStatusBling.map(({ nome }) => nome),
      });
      return null;
    }
    let { situacao } = blingSavedOrder || {};
    if (!situacao?.id) {
      situacao = (await bling.get(`/pedidos/vendas/${blingOrderId}`)).data.data?.situacao;
    }
    logger.info(`Maybe updating ${orderId} to ${newStatusBling.nome} (${newStatusBling.id})`, {
      blingStatuses,
      situacao,
    });
    if (String(situacao?.id) !== String(newStatusBling.id)) {
      return bling.patch(`/pedidos/vendas/${blingOrderId}/situacoes/${newStatusBling.id}`)
        .then((response) => {
          logger.info('Bling order status updated successfully');
          return response;
        })
        .catch((err: any) => {
          if (err.response) {
            logger.warn(`Failed updating Bling order status: ${JSON.stringify(err.response.data)}`);
          }
          logger.error(err);
          return null;
        });
    }
  }
  return null;
};

export default exportOrderToBling;
