import type { TrackingDoc } from './database';
import { logger } from '@cloudcommerce/firebase/lib/config';
import db from './database';

const removeDeliveredToFirestore = async () => {
  // eslint-disable-next-line no-async-promise-executor
  const job = new Promise(async (resolve, reject) => {
    try {
      const codes: TrackingDoc[] = await db.getAllDelivered() as TrackingDoc[];
      if (codes.length > 0) {
        codes.forEach(async (code) => {
          try {
            await db.remove(code.trackingCode, code.serviceCode);
            logger.info('> (App Frenet) Code removed, delivered status', code);
          } catch (err) {
            logger.error(err);
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
