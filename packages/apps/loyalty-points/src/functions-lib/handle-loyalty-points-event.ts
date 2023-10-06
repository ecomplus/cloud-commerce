import type { Orders, Customers, ResourceId } from '@cloudcommerce/types';
import api from '@cloudcommerce/api';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import logger from 'firebase-functions/logger';
import ecomUtils from '@ecomplus/utils';
import getProgramId from './get-program-id';

const ECHO_SUCCESS = 'SUCCESS';
const ECHO_SKIP = 'SKIP';

type UsedPointsEntries = Exclude<Customers['loyalty_points_entries'], undefined>[number]
  & { original_active_points: number }

const responsePubSub = (response: string) => {
  logger.log('(App: Loyalty Points): ', response);
  return null;
};

const haveEarnedPoints = (pointsList: Customers['loyalty_points_entries'], orderId: ResourceId) => {
  if (pointsList) {
    let hasEarned = false;
    for (let i = 0; i < pointsList.length; i++) {
      const point = pointsList[i];
      if (point.order_id === orderId) {
        hasEarned = true;
        break;
      }
    }
    return hasEarned;
  }
  return false;
};

const findPointIndex = (pointsList: Customers['loyalty_points_entries'], pointEntry: UsedPointsEntries) => {
  if (pointsList) {
    for (let i = 0; i < pointsList.length; i++) {
      const point = pointsList[i];
      if (point.name === pointEntry.name) {
        return i;
      }
    }
  }
  return null;
};

const handleLoyaltyPointsEvent = async (
  order: Orders,
  programRules: any[],
) => {
  const orderId = order._id;
  const currentStatus = order.financial_status && order.financial_status.current;
  let isPaid: boolean = false;
  let isCancelled: boolean = false;

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

  try {
    if (isPaid || isCancelled) {
      // get app configured options
      const { amount, buyers } = order;
      const customerId = buyers && buyers[0] && buyers[0]._id;
      if (customerId) {
        const pointsList: Customers['loyalty_points_entries'] = (await api.get(
          `customers/${customerId}/loyalty_points_entries`,
        )
        ).data;

        if (pointsList) {
          const hasEarnedPoints = haveEarnedPoints(pointsList, orderId);

          if (isPaid && !hasEarnedPoints) {
            const docRef = getFirestore().doc(`pointsToAdd/${orderId}`);
            const docSnapshot = await docRef.get();
            if (!docSnapshot.exists) {
              const pointEntries: any[] = [];

              for (let i = 0; i < programRules.length; i++) {
                const rule = programRules[i];
                if (rule.earn_percentage === 0) {
                  continue;
                }
                if (
                  !rule.min_subtotal_to_earn
                    || (amount?.subtotal && rule.min_subtotal_to_earn <= amount.subtotal)
                ) {
                  let subtotal = amount.subtotal as number;

                  if (Array.isArray(rule.category_ids) && rule.category_ids.length) {
                    if (!order.items || !order.items.length) {
                      continue;
                    }

                    // eslint-disable-next-line no-await-in-loop
                    const { data: { result } } = await api.get('search/v1', {
                      limit: order.items.length,
                      params: {
                        _id: order.items.map((item) => item.product_id),
                        'categories._id': rule.category_ids,
                      },
                    });

                    // eslint-disable-next-line no-await-in-loop
                    order.items.forEach((item) => {
                      if (!result.find(({ _id }) => _id === item.product_id)) {
                        subtotal -= (ecomUtils.price(item) * item.quantity);
                      }
                    });
                  }

                  const pointsValue = ((rule.earn_percentage || 1) / 100)
                    * (subtotal - (amount.discount || 0));

                  if (pointsValue > 0) {
                    let validThru: string | undefined;
                    if (rule.expiration_days > 0) {
                      const d = new Date();
                      d.setDate(d.getDate() + 2 + rule.expiration_days);
                      validThru = d.toISOString();
                    }
                    const data = {
                      name: rule.name,
                      program_id: getProgramId(rule, i),
                      earned_points: pointsValue,
                      active_points: pointsValue,
                      ratio: rule.ratio || 1,
                      order_id: orderId,
                    };
                    if (validThru) {
                      Object.assign(data, { valid_thru: validThru });
                    }
                    pointEntries.push(data);
                  }
                }
              }

              await docRef.set({
                customerId,
                pointEntries,
                queuedAt: Timestamp.now(),
              });

              return responsePubSub(ECHO_SUCCESS);
            }
          }

          if (isCancelled && hasEarnedPoints) {
            for (let i = 0; i < pointsList.length; i++) {
              if (pointsList[i].order_id === orderId) {
                // eslint-disable-next-line no-await-in-loop
                await api.delete(`customers/${customerId}/loyalty_points_entries/${i}`);
              }
            }

            return responsePubSub(ECHO_SUCCESS);
          }
        }

        if (isCancelled) {
          const documentRef = getFirestore().doc(`billedPoints/${orderId}`);
          const documentSnapshot = await documentRef.get();

          if (documentSnapshot.exists) {
            const usedPointsEntries = documentSnapshot.get('usedPointsEntries') as UsedPointsEntries[];
            documentRef.delete();

            if (Array.isArray(usedPointsEntries)) {
              for (let i = 0; i < usedPointsEntries.length; i++) {
                const pointsEntry = usedPointsEntries[i];
                const pointsToRefund = pointsEntry.original_active_points
                  - pointsEntry.active_points;
                if (pointsToRefund > 0) {
                  const pointIndex = findPointIndex(pointsList, pointsEntry);

                  if (pointIndex && pointsList) {
                    const activePoints = pointsList[pointIndex].active_points;
                    const body = {
                      active_points: activePoints + pointsToRefund,
                    };

                    // eslint-disable-next-line no-await-in-loop
                    await api.patch(
                      `customers/${customerId}/loyalty_points_entries/${pointIndex}`,
                      body,
                    );

                    return responsePubSub(ECHO_SUCCESS);
                  }
                }
              }

              const transaction = order.transactions
                && order.transactions.find((transactionFound) => {
                  return transactionFound.payment_method.code === 'loyalty_points';
                });

              if (transaction) {
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
      }
      return responsePubSub('');
    }
    // not paid nor cancelled
    return responsePubSub(ECHO_SKIP);
  } catch (err) {
    logger.error('(App Loyalty Points) Error =>', err);
    throw err;
  }
};

export default handleLoyaltyPointsEvent;
