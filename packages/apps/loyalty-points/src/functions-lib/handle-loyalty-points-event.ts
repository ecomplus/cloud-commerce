import type { Orders, Customers } from '@cloudcommerce/types';
import api from '@cloudcommerce/api';
import { getFirestore } from 'firebase-admin/firestore';
import logger from 'firebase-functions/logger';
import getProgramId from './get-program-id';

const SKIP_TRIGGER_NAME = 'SkipTrigger';
const ECHO_SUCCESS = 'SUCCESS';
const ECHO_SKIP = 'SKIP';
const ECHO_API_ERROR = 'STORE_API_ERR';

const responsePubSub = (response: string) => {
  logger.log('(App: Loyalty Points): ', response);
  return null;
};

const handleLoyaltyPointsEvent = async (
  order: Orders,
  appData: { [x: string]: any },
  key: string,
) => {
  const orderId = order._id;
  const currentStatus = order.financial_status && order.financial_status.current;
  let isPaid: boolean;
  let isCancelled: boolean;

  isPaid = false;
  isCancelled = false;

  switch (currentStatus) {
    case 'paid':
      isPaid = true;
      break;
    case 'unauthorized':
    case 'partially_refunded':
    case 'refunded':
    case 'voided':
      isCancelled = true;
      break;
    case 'partially_paid':
      if (order.transactions) {
        order.transactions.forEach((transaction) => {
          if (transaction.payment_method.code !== 'loyalty_points' && transaction.status) {
            switch (transaction.status.current) {
              case 'unauthorized':
              case 'refunded':
              case 'voided':
                isCancelled = true;
                break;
              default:
                break;
            }
          }
        });
      }
      break;
    default:
      break;
  }

  let programRules: string | any[];

  try {
    if (isPaid || isCancelled) {
      // get app configured options
      programRules = appData.programs_rules;
      if (
        !Array.isArray(programRules)
        || !programRules.length
      ) {
        // ignore current trigger
        logger.info('>> ', key, ' - Ignored event [SKIP APP Loyalty Points]');
        return null;
      }

      const { amount, buyers } = order;
      const customerId = buyers && buyers[0] && buyers[0]._id;
      if (customerId) {
        const pointsList: Customers['loyalty_points_entries'] = (await api.get(
          `customers/${customerId}/loyalty_points_entries?order_id=${orderId}`,
        )
        ).data.result;

        if (pointsList) {
          const hasEarnedPoints = pointsList.length > 0;

          if (isPaid && !hasEarnedPoints) {
            for (let i = 0; i < programRules.length; i++) {
              const rule = programRules[i];
              if (amount.subtotal) {
                if (!rule.min_subtotal_to_earn || rule.min_subtotal_to_earn <= amount.subtotal) {
                  const pointsValue = ((rule.earn_percentage || 1) / 100)
                    * (amount.subtotal - (amount.discount || 0));

                  let validThru: string | undefined;
                  if (rule.expiration_days > 0) {
                    const d = new Date();
                    d.setDate(d.getDate() + rule.expiration_days);
                    validThru = d.toISOString();
                  }

                  const data = {
                    name: rule.name,
                    program_id: getProgramId(rule, i),
                    earned_points: pointsValue,
                    active_points: pointsValue,
                    ratio: rule.ratio || 1,
                    valid_thru: validThru,
                    order_id: orderId,
                  } as any; // TODO: set the correct type

                  const tryAddPoints = async () => {
                    await api.post(`customers/${customerId}/loyalty_points_entries`, data);

                    return responsePubSub(ECHO_SUCCESS);
                  };

                  try {
                    // eslint-disable-next-line no-await-in-loop
                    await tryAddPoints();
                  } catch (error: any) {
                    if (error.response && error.response.status === 403) {
                      // delete older points entry and retry

                      // eslint-disable-next-line no-await-in-loop
                      const pointsListFound: Customers['loyalty_points_entries'] = (await api.get(
                        `customers/${customerId}/loyalty_points_entries?valid_thru<=
                      ${(new Date().toISOString())}&sort=active_points&limit=1`,
                      )).data.result;

                      if (pointsListFound && pointsListFound.length) {
                        // eslint-disable-next-line no-await-in-loop
                        await api.delete(`customers/${customerId}/loyalty_points_entries/0`);
                        return tryAddPoints();
                      }
                    } else {
                      throw error;
                    }
                  }
                }
              }
            }
          }

          if (isCancelled && hasEarnedPoints) {
            for (let i = 0; i < pointsList.length; i++) {
              // eslint-disable-next-line no-await-in-loop
              await api.delete(`customers/${customerId}/loyalty_points_entries/${i}`);
            }

            return responsePubSub(ECHO_SUCCESS);
          }
        }
      }

      if (customerId && isCancelled) {
        const documentRef = getFirestore().doc(`billedPoints/${orderId}`);
        const documentSnapshot = await documentRef.get();
        if (documentSnapshot.exists) {
          const usedPointsEntries = documentSnapshot.get('usedPointsEntries');
          documentRef.delete();
          if (Array.isArray(usedPointsEntries)) {
            for (let i = 0; i < usedPointsEntries.length; i++) {
              const pointsEntry = usedPointsEntries[i];
              const pointsToRefund = pointsEntry.original_active_points - pointsEntry.active_points;
              if (pointsToRefund > 0) {
                let pointsFound: Exclude<Customers['loyalty_points_entries'], undefined>[number] | undefined;
                try {
                  // eslint-disable-next-line no-await-in-loop
                  pointsFound = (await api.get(
                    `customers/${customerId}/loyalty_points_entries/${i}`,
                  )).data;

                  // response = result.response;
                } catch (error: any) {
                  if (!error.response || error.response.status !== 404) {
                    throw error;
                  }
                }

                if (pointsFound) {
                  const activePoints = pointsFound.active_points;
                  const data = {
                    active_points: activePoints + pointsToRefund,
                  };

                  // eslint-disable-next-line no-await-in-loop
                  await api.patch(`customers/${customerId}/loyalty_points_entries/${i}`, data);

                  return responsePubSub(ECHO_SUCCESS);
                }
              }
            }

            const transaction = order.transactions
              && order.transactions.find((transactionFound) => {
                return transactionFound.payment_method.code === 'loyalty_points';
              });

            if (transaction) {
              // const endpoint = `/orders/${orderId}/payments_history.json`
              const bodyPaymentHistory = {
                transaction_id: transaction._id,
                date_time: new Date().toISOString(),
                status: currentStatus?.startsWith('partially') ? 'refunded' : currentStatus,
                customer_notified: true,
              } as any; // TODO: incompatible type=> amount and status

              await api.post(`orders/${orderId}/payments_history`, bodyPaymentHistory);
            }
          }
        }
      }
      return responsePubSub('');
    }
    // not paid nor cancelled
    return responsePubSub(ECHO_SKIP);
  } catch (err: any) {
    if (err.name === SKIP_TRIGGER_NAME) {
      // trigger ignored by app configuration
      return responsePubSub(ECHO_SKIP);
    }

    const { message, response } = err;
    // request to Store API with error response
    // return error status code

    if (response && (response.status === 401 || response.status === 403)) {
      return responsePubSub(`${ECHO_API_ERROR} => ${message}`);
    }
    logger.error('(App Loyalty Points) Error =>', err);
    throw err;
  }
};

export default handleLoyaltyPointsEvent;
