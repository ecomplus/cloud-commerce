import type { TrackingDoc } from './database';
import api from '@cloudcommerce/api';
import config, { logger } from '@cloudcommerce/firebase/lib/config';
import db from './database';
import updateOrderfulfilllment from './update-fulfillments';
import fetchTrackingEvents from './fetch-tracking-code';
import removeDeliveredToFirestore from './remove-delivered';

const getConfig = async () => {
  try {
    const app = (await api.get(
      `applications?app_id=${config.get().apps.frenet.appId}&fields=hidden_data`,
    )).data.result;

    return app[0].hidden_data;
  } catch (err) {
    logger.error(err);
    return null;
  }
};

const diffInDays = (
  createdAt: string,
) => {
  const today = new Date();
  const created = new Date(createdAt);
  const diff = today.getTime() - created.getTime();
  return Math.ceil(diff / (1000 * 3600 * 24));
};

const handleTrackingCodes = async () => {
  const appConfig = await getConfig();

  // eslint-disable-next-line no-async-promise-executor
  const checkTrackingCodes = new Promise(async (resolve, reject) => {
    logger.info('> (App Frenet) Automatic tracking code update started.');

    let codes: TrackingDoc[] | undefined;

    try {
      codes = await db.getAll() as TrackingDoc[];
    } catch (err: any) {
      if (err.name !== 'NoTrackingCodesForUpdate') {
        reject(err);
      }
      resolve(null);
    }

    if (!appConfig || !appConfig.frenet_access_token || !codes) {
      // no config for store bye
      resolve(null);
    } else {
      // eslint-disable-next-line consistent-return
      codes.forEach(async (code) => {
        const serviceCode = String(code.serviceCode).startsWith('FR')
          ? String(code.serviceCode.replace(/^FR/, '')).trim()
          : code.serviceCode;

        let trackingData;

        try {
          trackingData = await fetchTrackingEvents(
            code.trackingCode,
            serviceCode,
            appConfig.frenet_access_token,
          );
        } catch (err) {
          logger.error(err);
        }

        if (trackingData) {
          const { ErrorMessage, TrackingEvents } = trackingData;
          if (ErrorMessage && (!Array.isArray(TrackingEvents) || !TrackingEvents.length)) {
            const startWithError = [
              'ShippingServiceCode ou CarrierCode informado não foram encontrados',
              'Object reference not set to an instance of an object',
              'Value cannot be null',
              'Cannot deserialize the current JSON array',
            ].some((msg) => ErrorMessage.startsWith(msg));

            if (startWithError || ErrorMessage.startsWith('Objeto não encontrado na base de dados dos Correios')) {
              if (startWithError || diffInDays(code.createdAt) >= 15) {
                // remove pra evitar flod com errors
                try {
                  await db.remove(code.trackingCode, code.serviceCode);
                  logger.info('> (App Frenet) Code removed, error detected in \'trackingData\'', code);
                } catch (err) {
                  logger.error(err);
                }
              }
            } else {
              const err = {
                ...code,
                error: true,
                ErrorMessage,
                TrackingEvents,
              };
              logger.error('> (App Frenet) Error => ', err);
            }
          } else if (TrackingEvents && Array.isArray(TrackingEvents)) {
            let trackingEvent;

            TrackingEvents.forEach(({ EventType, EventDateTime, EventDescription }) => {
              const [day, month, yearAndTime] = EventDateTime.split('/');
              const [year, time] = yearAndTime.split(' ');
              const [hour, minute] = time.split(':');
              const date = new Date(Date.UTC(year, parseInt(month, 10) - 1, day, hour, minute));
              date.setHours(date.getHours() - 3);
              if (!trackingEvent || trackingEvent.date.getTime() < date.getTime()) {
                trackingEvent = {
                  status: parseInt(EventType, 10),
                  date,
                  description: EventDescription,
                };
              }
            });

            if (trackingEvent && parseInt(code.trackingStatus, 10) !== trackingEvent.status) {
              try {
                await updateOrderfulfilllment(
                  code.orderId,
                  code.trackingCode,
                  trackingEvent.status,
                  trackingEvent.date,
                );

                await db.update(trackingEvent.status, code.trackingCode);

                logger.info(`> (App Frenet) Novo Evento => orderId #${code.orderId}, 
                code: ${code.trackingCode}  lastStatus: ${code.trackingStatus}  
                newStatus: ${trackingEvent.status} description: ${trackingEvent.description}`);
              } catch (err: any) {
                if (err.response) {
                  const payload = {
                    message: err.message,
                    config: err.response.toJSON(),
                    orderId: code.orderId,
                  };
                  logger.error('> (App Frenet) Error => ', payload);
                } else {
                  logger.error(err);
                }
              }
            }
          }
        }

        resolve(null);
      });
    }
  });

  if (appConfig && appConfig.frenet_access_token) {
    await checkTrackingCodes.catch((err) => {
      logger.error('> (App Frenet) Error => ', err);
    });

    await removeDeliveredToFirestore().catch((err) => {
      logger.error('> (App Frenet) Error removing Delivered to Firestore => ', err);
    });

    if (new Date().getHours() === 23) {
      await db.clear().catch((err) => {
        logger.error('> (App Frenet) Error removing old tracking codes => ', err);
      });
    }
  }
};

export default handleTrackingCodes;
