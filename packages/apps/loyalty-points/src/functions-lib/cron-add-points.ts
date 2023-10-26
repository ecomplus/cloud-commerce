import type { CustomerSet, Orders } from '@cloudcommerce/types';
import logger from 'firebase-functions/logger';
import { getFirestore } from 'firebase-admin/firestore';
import api from '@cloudcommerce/api';
import { Endpoint } from '@cloudcommerce/api/types';

const addPoints = async () => {
  const d = new Date();
  // double checking paid orders after 5 days
  d.setDate(d.getDate() - 5);
  const db = getFirestore();
  const snapshot = await db.collection('pointsToAdd')
    .where('queuedAt', '<=', d)
    .orderBy('queuedAt')
    .get();
  const { docs } = snapshot;
  logger.info(`${docs.length} points to add`);

  for (let i = 0; i < docs.length; i++) {
    const { customerId, pointEntries } = docs[i].data();
    const orderId = docs[i].ref.id as string & { length: 24 };
    let order: Orders | undefined;
    try {
      // eslint-disable-next-line no-await-in-loop
      order = (await api.get(`orders/${orderId}`)).data;
    } catch (error: any) {
      const status = error.response?.status;
      if (status > 400 && status < 500) {
        logger.warn(`failed reading order ${orderId}`, {
          status,
          response: error.response?.data,
        });
      } else {
        throw error;
      }
    }

    if (order && Array.isArray(pointEntries) && pointEntries.length) {
      const currentStatus = order.financial_status && order.financial_status.current;
      if (currentStatus === 'paid') {
        const tryAddPoints = (data: CustomerSet) => {
          logger.info(`POST ${JSON.stringify(data)} ${customerId}`);
          return api.post(`customers/${customerId}/loyalty_points_entries`, data);
        };

        const pointsEndpoint = `/customers/${customerId}/loyalty_points_entries`;

        for (let ii = 0; ii < pointEntries.length; ii++) {
          const pointsEntry = pointEntries[ii];
          try {
            // eslint-disable-next-line no-await-in-loop
            await tryAddPoints(pointsEntry);
          } catch (err: any) {
            const status = err.response?.status;
            if (status === 403) {
              // delete older points entry and retry

              const findUrl = `${pointsEndpoint}`
                + `?valid_thru<=${(new Date().toISOString())}&sort=active_points&limit=1`;
              try {
                // eslint-disable-next-line no-await-in-loop
                await api.get(findUrl as Endpoint)
                  .then(({ data }) => {
                    const pointsList = data.result;
                    if (pointsList.length) {
                      const endpoint = `${pointsEndpoint}/${pointsList[0]._id}`;
                      return api.delete(endpoint as Endpoint)
                        .then(() => {
                          return tryAddPoints(pointsEntry);
                        });
                    }
                    return null;
                  });
              } catch (error: any) {
                logger.warn(`failed cleaning/adding points retry to ${orderId}`, {
                  customerId,
                  pointsEntry,
                  url: error.config?.url,
                  method: error.config?.method,
                  status: error.response?.status,
                  response: error.response?.data,
                });
              }
            } else if (status > 400 && status < 500) {
              logger.warn(`failed adding points to ${orderId}`, {
                customerId,
                pointsEndpoint,
                pointsEntry,
                status,
                response: err.response.data,
              });
            } else {
              throw err;
            }
          }
        }
      }
    }
    // eslint-disable-next-line no-await-in-loop
    await docs[i].ref.delete();
  }
};

export default addPoints;
