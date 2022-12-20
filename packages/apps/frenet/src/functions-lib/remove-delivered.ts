import type { TrackingDoc } from './database';
import logger from 'firebase-functions/logger';
import db from './database';

const removeDeliveredToFirestore = async () => {
  // eslint-disable-next-line no-async-promise-executor
  const job = new Promise(async (resolve, reject) => {
    try {
      const codes: TrackingDoc[] = await db.trackingCodes.getAllDelivered() as TrackingDoc[];
      if (codes.length > 0) {
        codes.forEach(async (code) => {
          try {
            await db.trackingCodes.remove(code.trackingCode, code.serviceCode);
            logger.log('> (App Frenet) Code removed, delivered status', code);
          } catch (err) {
            logger.error('> (App Frenet) => TrackingCodesRemoveErr =>', err);
          }
        });
        resolve(null);
      }
    } catch (err) {
      reject(err);
    }
  });

  await job.catch((err) => {
    logger.error('> (App Frenet) Error => ', err);
  });
};

export default removeDeliveredToFirestore;
