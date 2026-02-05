import type { Orders } from '@cloudcommerce/types';
import logger from 'firebase-functions/logger';
import api from '@cloudcommerce/api';
import config from '@cloudcommerce/firebase/lib/config';
import { getMEAxios } from '../../lib-mjs/util/melhor-envio-api.mjs';
import errorHandling from '../../lib-mjs/functions/error-handling.mjs';
import db, { Label } from './database';

const getConfig = async () => {
  try {
    const app = (await api.get(
      `applications?app_id=${config.get().apps.melhorEnvio.appId}&fields=hidden_data`,
    )).data.result;

    return app[0].hidden_data;
  } catch (err) {
    logger.error(err);
    return null;
  }
};

const handleTrackingCodes = async () => {
  const appData = await getConfig();
  if (appData?.access_token) {
    process.env.MELHORENVIO_TOKEN = appData.access_token;
  }
  process.env.MELHORENVIO_ENV = appData?.sandbox
    ? 'sandbox'
    : process.env.MELHORENVIO_ENV || 'live';
  if (!process.env.MELHORENVIO_TOKEN) {
    return;
  }
  const meAxios = await getMEAxios();

  // eslint-disable-next-line no-async-promise-executor
  const trackingCodes = new Promise(async (resolve, reject) => {
    logger.log('>> Inciando rastreio de etiquetas');

    try {
      const labels: Label[] = await db.getAllLabels();
      // .then(labels => {
      const checkStatus = async (queue = 0) => {
        const label = labels[queue];
        if (!label) {
          return resolve(null);
        }
        const next = () => {
          queue += 1;
          return checkStatus(queue);
        };

        // evita buscar configuração do app para o mesmo storeId
        let order: Orders;
        try {
          order = (await api.get(`orders/${label.resourceId}`)).data;
        } catch (err: any) {
          errorHandling(err);
          if (err.response && err.response.status === 404) {
            await db.deleteLabel(label.id).catch(logger.error);
          }
          return next();
        }

        try {
          const { data } = await meAxios
            .post('/shipment/tracking', { orders: [label.labelId] });

          const orderLabel = order.hidden_metafields?.find((metafield) => {
            return metafield.field === 'melhor_envio_label_id' && data[metafield.value];
          });
          if (!orderLabel || !orderLabel.value) {
            return null;
          }

          const tracking = data[orderLabel.value as unknown as string];
          const shippingLine = order.shipping_lines && order.shipping_lines
            .find(({ app }) => app && app.service_code && app.service_code.startsWith('ME'));

          if (!shippingLine) {
            return null;
          }

          let shippingLineCurrentStatus = '';
          if (shippingLine.status) {
            shippingLineCurrentStatus = shippingLine.status.current;
          } else {
            shippingLineCurrentStatus = order.fulfillment_status
              ? order.fulfillment_status.current : '';
          }

          let updateTo: string | undefined;

          switch (tracking.status) {
            case 'posted':
              if (shippingLineCurrentStatus !== 'shipped' && shippingLineCurrentStatus !== 'delivered') {
                updateTo = 'shipped';
              }
              break;
            case 'delivered':
              if (shippingLineCurrentStatus !== 'delivered' && tracking.tracking) {
                updateTo = 'delivered';
              }
              break;
            case 'undelivered':
              if (shippingLineCurrentStatus !== 'returned') {
                updateTo = 'returned';
              }
              break;
            default:
              break;
          }

          if (tracking.tracking && (!shippingLine.tracking_codes
            || !shippingLine.tracking_codes.length)) {
            try {
              await api.patch(
                `orders/${label.resourceId}/shipping_lines/${shippingLine._id}`,
                {
                  tracking_codes: [{
                    code: tracking.tracking,
                    link: `https://www.melhorrastreio.com.br/rastreio/${tracking.tracking}`,
                  }],
                },
              );
              logger.log(`Tracking code para ${order._id} / Pro.: ${tracking.protocol}`);
            } catch (err: any) {
              logger.error(
                `> Error updating shipping_lines on order #${label.resourceId} => `,
                err,
              );
              next();
            }
          }

          if (updateTo) {
            const body = {
              shipping_line_id: shippingLine._id,
              date_time: new Date().toISOString(),
              status: updateTo,
              notification_code: tracking.id,
            } as any;

            await api.post(`orders/${label.resourceId}/fulfillments`, body);
            logger.log(`Status do pedido ${order._id} alterado com sucesso para ${updateTo}`);
          }

          if (tracking.status) {
            switch (tracking.status) {
              case 'delivered':
              case 'undelivered':
              case 'canceled':
                await db.deleteLabel(label.id);
                break;
              default:
                break;
            }
          } else {
            await db.updateLabel(tracking.status, label.labelId);
          }
        } catch (err: any) {
          if (err.isAxiosError) {
            const { response } = err;
            if (response && response.status < 500) {
              const payload = {
                labelId: label.labelId,
                status: response.status,
                data: response.data,
                config: response.config,
              };
              logger.error('Tracking_codes_err', JSON.stringify(payload, undefined, 4));
            }
          } else {
            err.libCode = 'Tracking_codes_err';
            logger.error(err);
          }
        }
        return next();
      };

      await checkStatus();
    } catch (err) {
      reject(err);
    }
  });

  if (appData?.disable_tracking) {
    await trackingCodes.catch((err) => {
      logger.error(err);
    });
    if (new Date().getHours() === 23) {
      await db.clearLabels().catch((err) => {
        logger.error('> Error removing old Labels => ', err);
      });
    }
  }
};

export default handleTrackingCodes;
