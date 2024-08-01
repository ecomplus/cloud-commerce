import type { Orders, ResourceAndId } from '@cloudcommerce/api/types';
import type { ApiEventHandler } from '@cloudcommerce/firebase/lib/helpers/pubsub';
import logger from 'firebase-functions/logger';
import api from '@cloudcommerce/api';
import meClient from '../../lib-mjs/functions/client-melhor-envio.mjs';
import errorHandling from '../../lib-mjs/functions/error-handling.mjs';
import db from './database';
import orderIsValid from './order-is-valid';
import newLabel from './new-label';

const ECHO_SKIP = (msg?: string) => logger.warn(msg || 'SKIP');

const metafieldName = 'melhor_envio_label_id';

const handleApiEvent: ApiEventHandler = async ({
  evName,
  apiEvent,
  apiDoc,
  app,
}) => {
  const resourceId = apiEvent.resource_id;
  logger.info('>> ', resourceId, ' - Action: ', apiEvent.action);
  const key = `${evName}_${resourceId}`;
  const appData = { ...app.data, ...app.hidden_data };
  if (
    Array.isArray(appData.ignore_events)
    && appData.ignore_events.includes(evName)
  ) {
    logger.info('>> ', key, ' - Ignored event');
    return null;
  }
  logger.info(`> Webhook ${resourceId} [${evName}] => ${apiDoc}`);

  try {
    const trackingCode = await db.searchLabel(resourceId);
    if (!trackingCode) {
      const melhorEnvioToken = appData.access_token;
      if (typeof melhorEnvioToken === 'string' && melhorEnvioToken) {
        process.env.MELHORENVIO_TOKEN = melhorEnvioToken;
      }
      if (!process.env.MELHORENVIO_TOKEN) {
        logger.warn('Missing Melhor Envio token');
        return null;
      }

      const { sandbox } = appData;

      const order = apiDoc as Orders;
      if (!appData.enabled_label_purchase || !orderIsValid(order, appData)) {
        ECHO_SKIP();
        return null;
      }
      const merchantData = await meClient(process.env.MELHORENVIO_TOKEN, sandbox).get('/')
        .then(({ data }) => data);

      const label = newLabel(order, appData, merchantData);
      // logger.log(`>> Comprando etiquetas #${storeId} ${order._id}`);
      const { data } = await meClient(process.env.MELHORENVIO_TOKEN, sandbox).post('/cart', label);
      if (data) {
        logger.log(`>> Etiqueta inserida no carrinho com sucesso #${data.id}`);
        if (appData.enabled_label_checkout) {
          await meClient(process.env.MELHORENVIO_TOKEN, sandbox).post('/shipment/checkout', { orders: [data.id] });
        }

        // logger.log(`>> Carrinho finalizado com sucesso #${data.id}`);
        await db.saveLabel(data.id, data.status, resourceId);

        // logger.log(`>> Etiquetas salvas no db para futuros rastreio #${storeId} ${resourceId}`);
        // updates hidden_metafields with the generated tag id

        // TODO: set type for partial body in post method
        await api.post(
          `orders/${resourceId}/hidden_metafields` as `${ResourceAndId}/string`,
          {
            namespace: 'app-melhor-envio',
            field: metafieldName,
            value: data.id,
          },
        );

        if (typeof data.tracking === 'string' && data.tracking.length) {
          let shippingLine = order.shipping_lines?.find(({ app: application }) => application
            && application.service_code && application.service_code.startsWith('ME'));

          if (!shippingLine && order.shipping_lines) {
            [shippingLine] = order.shipping_lines;
          }
          if (shippingLine) {
            const trackingCodes = shippingLine.tracking_codes || [];
            trackingCodes.push({
              code: data.tracking,
              link: `https://www.melhorrastreio.com.br/rastreio/${data.tracking}`,
            });

            await api.patch(
              `orders/${resourceId}/shipping_lines/${shippingLine._id}`,
              { tracking_codes: trackingCodes },
            );

            logger.log(`>> 'hidden_metafields' do pedido ${order._id} atualizado com sucesso!`);
            // done
            return null;
          }
        }
      }
    }
    ECHO_SKIP();
    return null;
  } catch (err: any) {
    if (err.response && err.isAxiosError) {
      const { data } = err.response;

      if (data) {
        // update order hidden_metafields

        // TODO: set type for partial body in post method
        await api.post(
          `orders/${resourceId}/hidden_metafields` as `${ResourceAndId}/string`,
          {
            namespace: 'app-melhor-envio',
            field: 'melhor_envio_label_error',
            value: JSON.stringify(data).substring(0, 255),
          },
        );

        if (
          data.error
          === 'Os documentos (CPFs) dos participantes do frete não podem ser iguais'
          || data.error.startsWith('Seu saldo de R$ ')
        ) {
          // ignoring known ME/merchant errors
          logger.warn(`ME: ${data.error}`);
          return null;
        }
      }

      logger.error('BuyLabelErr:', JSON.stringify({
        data,
        status: err.response.status,
        config: err.response.config,
      }, null, 4));
    } else {
      errorHandling(err);
    }
    return err;
  }
};

export default handleApiEvent;
