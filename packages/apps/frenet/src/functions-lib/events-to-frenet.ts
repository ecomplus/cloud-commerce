import type { ApiEventHandler } from '@cloudcommerce/firebase/lib/helpers/pubsub';
import type { Orders } from '@cloudcommerce/types';
import { logger } from '@cloudcommerce/firebase/lib/config';
import db from './database';

const pattern = /rastreador|lang|version|(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-/]))?/;
const isUrl = (str: string) => pattern.test(str);

const handleApiEvent: ApiEventHandler = async ({
  evName,
  apiEvent,
  apiDoc,
  app,
}) => {
  const resourceId = apiEvent.resource_id;
  logger.info(`>> ${resourceId} - Action: `, { action: apiEvent.action });
  const key = `${evName}_${resourceId}`;
  const appData = { ...app.data, ...app.hidden_data };

  const order = apiDoc as Orders;
  const orderId = order._id;
  if (
    (Array.isArray(appData.ignore_events)
      && appData.ignore_events.includes(evName))
    || !order.shipping_lines
  ) {
    logger.info(`>> ${key} - Ignored event`);
    return null;
  }
  logger.info(`> Webhook ${resourceId} [${evName}]`);

  order.shipping_lines.forEach((shipping) => {
    if (shipping.tracking_codes
      && shipping.custom_fields
      && shipping.custom_fields.find(({ field }) => field === 'by_frenet')
    ) {
      shipping.tracking_codes.forEach(async ({ code }) => {
        // algumas integrações enviam um link de rastreamento
        // ao invés do código de rastreamento, como é o caso do bling
        // para evitar gargalos na fila só salva se for código

        if (code && !isUrl(code)) {
          const trackingCode = await db.get(orderId, code);
          if (!trackingCode) {
            const appShipping = shipping.app;
            await db.save(orderId, '0', code, appShipping?.service_code);
          }
          return null;
        }
        logger.error(
          `> (App Frenet) Error => webhook #${orderId}: ${code},
          Não foi possivel salvar código de rastreio pois seu formato é inválido. `,
          shipping.tracking_codes,
        );
        return null;
      });
    }
  });
  return null;
};

export default handleApiEvent;
