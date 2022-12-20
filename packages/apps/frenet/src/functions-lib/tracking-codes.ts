import type { TrackingDoc } from './database';
import api from '@cloudcommerce/api';
import logger from 'firebase-functions/logger';
import db from './database';
import updateOrderfulfilllment from './update-fulfillments';
import fetchTrackingEvents from './fetch-tracking-code';

const getConfig = async () => {
  try {
    const app = (await api.get(
      'applications?app_id=1244&fields=hidden_data',
    )).data.result;

    return app[0].hidden_data;
  } catch (err) {
    logger.error('(App Frenet) Error =>', err);
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
  // eslint-disable-next-line no-async-promise-executor
  const job = new Promise(async (resolve, reject) => {
    logger.log('> (App Frenet) Automatic tracking code update started.');

    let codes: TrackingDoc[] | undefined;

    try {
      codes = await db.trackingCodes.getAll() as TrackingDoc[];
    } catch (err: any) {
      if (err.name !== 'NoTrackingCodesForUpdate') {
        reject(err);
      }
      resolve(null);
    }
    const appConfig = await getConfig();

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
          logger.error('> (App Frenet) Error => ', err);
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
                  await db.trackingCodes.remove(code.trackingCode, code.serviceCode);
                  logger.log('> (App Frenet) Code removed, error detected in \'trackingData\'', code);
                } catch (err) {
                  logger.error('> (App Frenet) => TrackingCodesRemoveErr =>', err);
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

                await db.trackingCodes.update(trackingEvent.status, code.trackingCode);

                logger.log(`> (App Frenet) Novo Evento => orderId #${code.orderId}, 
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
                  logger.error('> (App Frenet) Error => ', err);
                }
              }
            }
          }
        }

        resolve(null);
      });
    }
  });

  await job.catch((err) => {
    logger.error('> (App Frenet) Error => ', err);
  });
};

export default handleTrackingCodes;
