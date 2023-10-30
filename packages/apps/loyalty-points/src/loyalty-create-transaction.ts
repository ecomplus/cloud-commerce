import type {
  AppModuleBody,
  CreateTransactionParams,
  CreateTransactionResponse,
  Customers,
  ResourceId,
} from '@cloudcommerce/types';
import api from '@cloudcommerce/api';
import { getFirestore } from 'firebase-admin/firestore';
import logger from 'firebase-functions/logger';
import getProgramId from './functions-lib/get-program-id';

type UsedPointsEntries = Exclude<Customers['loyalty_points_entries'], undefined>[number]
  & { original_active_points: number }

const collectionRef = getFirestore().collection('billedPoints');

const updateTransactionStatus = (orderId: ResourceId) => {
  setTimeout(async () => {
    const order = (await api.get(`orders/${orderId}`)).data;

    // appSdk.apiRequest(storeId, `/orders/${orderId}.json`).then(({ response }) => {
    const { transactions } = order;
    if (transactions) {
      const transaction = transactions.find((transactionFound) => {
        return transactionFound.payment_method.code === 'loyalty_points';
      });
      if (transaction) {
        const bodyPaymentHistory = {
          transaction_id: transaction._id,
          date_time: new Date().toISOString(),
          status: 'paid',
          customer_notified: true,
        } as any; // TODO: incompatible type=> amount and status;
        await api.post(`orders/${orderId}/payments_history`, bodyPaymentHistory);
      }
    }
  }, 500);
};

const handleUpdatedPoints = (
  endpoint: any, // TODO: endpoint type not string compatible
  body: { [x: string]: any },
  orderId: ResourceId,
  usedPointsEntries?: UsedPointsEntries[],
  timeout = 400,
  isLastRequest = false,
) => {
  setTimeout(async () => {
    await api.patch(endpoint, body);
    // appSdk.apiRequest(storeId, endpoint, 'PATCH', data).then(() => {
    logger.log(`#(App Loyalty Points): ${orderId} ${endpoint} => ${JSON.stringify(body)}`);
    if (isLastRequest) {
      updateTransactionStatus(orderId);
      collectionRef.doc(orderId).set({ usedPointsEntries });
    }
    // });
  }, timeout);
};

export default async (appData: AppModuleBody) => {
  const { application, storeId } = appData;
  const params = appData.params as CreateTransactionParams;
  // app configured options
  const appConfig = { ...application.data, ...application.hidden_data };
  const { lang, amount } = params;

  // setup required `transaction` response object
  const transaction: CreateTransactionResponse['transaction'] = {
    amount: amount.total,
  };

  if (params.payment_method.code === 'loyalty_points') {
    const pointsApplied = params.loyalty_points_applied;
    const programsRules = appConfig.programs_rules;
    if (pointsApplied && Array.isArray(programsRules) && programsRules.length) {
      // for (const programId in pointsApplied) {
      Object.keys(pointsApplied).forEach((programId) => {
        let pointsValue = pointsApplied[programId];
        if (pointsValue > 0) {
          const programRule = programsRules.find((programRuleFound, index) => {
            if (programRuleFound) {
              programRuleFound.program_id = getProgramId(programRuleFound, index);
              return programId === programRuleFound.program_id;
            }
            return false;
          });

          if (programRule) {
            let maxPoints = programRule.max_points;
            const ratio = programRule.ratio || 1;
            if (!maxPoints && programRule.max_amount_percentage && params.amount) {
              maxPoints = Math.round(
                ((programRule.max_amount_percentage * params.amount.total) / 100) / ratio,
              );
            }
            if (maxPoints < pointsValue) {
              pointsValue = maxPoints;
            }
            transaction.loyalty_points = {
              name: programRule.name,
              program_id: programRule.program_id,
              ratio,
              points_value: pointsValue,
            };
            transaction.amount = pointsValue * ratio;
          }
        }
      });
    }
  }

  if (transaction.amount) {
    const loyaltyPoints = transaction.loyalty_points;
    const customerId = params.buyer.customer_id as ResourceId;
    const orderId = params.order_id as ResourceId;
    const usedPointsEntries: UsedPointsEntries[] = [];
    try {
      const customer = (await api.get(`customers/${customerId}`)).data;
      // return appSdk.apiRequest(storeId, `/customers/${customerId}.json`)
      //   .then(({ response }) => {
      const pointsEntries = customer.loyalty_points_entries;
      let pointsToConsume = loyaltyPoints?.points_value;

      if (pointsEntries && pointsToConsume) {
        pointsEntries.sort((a, b) => {
          let value = 0;
          if (a.valid_thru && b.valid_thru) {
            if (a.valid_thru < b.valid_thru) {
              value = -1;
            } else if (a.valid_thru > b.valid_thru) {
              value = 1;
            }
          }
          return value;
        });

        for (let i = 0; i < pointsEntries.length; i++) {
          if (pointsToConsume <= 0) {
            break;
          }
          const pointsEntry = pointsEntries[i];
          if (pointsEntry.program_id === loyaltyPoints?.program_id) {
            const validThru = pointsEntry.valid_thru;
            const activePoints = pointsEntry.active_points;
            if (activePoints > 0 && (!validThru || new Date(validThru).getTime() >= Date.now())) {
              const pointsDiff = activePoints - pointsToConsume;
              if (pointsDiff > 0 && pointsDiff < 0.01) {
                pointsToConsume = activePoints;
              }
              if (pointsToConsume >= activePoints) {
                pointsToConsume -= activePoints;
                pointsEntry.active_points = 0;
                if (pointsToConsume < 0.02) {
                  pointsToConsume = 0;
                }
              } else {
                pointsEntry.active_points -= pointsToConsume;
                pointsToConsume = 0;
              }
              usedPointsEntries.push({
                ...pointsEntry,
                original_active_points: activePoints,
              });
            }
          }
        }

        if (pointsToConsume <= 0) {
          if (usedPointsEntries.length <= 3) {
            usedPointsEntries.forEach((pointsEntry, i) => {
              /* Obs:
                Store api v2 => loyalty_points_entries do not have id,
                but change can be done by index
              */
              const endpoint = `customers/${customerId}/loyalty_points_entries/${i}`;
              const body = {
                active_points: pointsEntry.active_points,
              };
              handleUpdatedPoints(
                endpoint,
                body,
                orderId,
                usedPointsEntries,
                (i + 1) * 400,
                i + 1 === usedPointsEntries.length,
              );
            });
          } else {
            const endpoint = `customers/${customerId}`;
            const body = {
              loyalty_points_entries: pointsEntries,
            };
            handleUpdatedPoints(endpoint, body, orderId, usedPointsEntries, 400, true);
          }
        }
      }

      transaction.status = {
        current: pointsToConsume && pointsToConsume <= 0 ? 'authorized' : 'unauthorized',
      };

      return {
        status: 200,
        redirect_to_payment: false,
        transaction,
      };
    } catch (error: any) {
      // try to debug request error
      const errCode = 'POINTS_TRANSACTION_ERR';
      let { message } = error;
      const err = {
        message: `CREATE_TRANSACTION_ERR #${storeId} - ${orderId} => ${message}`,
        payment: '',
        status: 0,
        response: '',
        usedPointsEntries,
      };

      if (error.response) {
        const { status, data } = error.response;
        err.status = status;
        if (status !== 401 && status !== 403) {
          if (typeof data === 'object' && data) {
            err.response = JSON.stringify(data);
          } else {
            err.response = data;
          }
        }
        if (data && data.user_message) {
          message = lang ? data.user_message[lang] : data.user_message.en_us;
        }
      }

      logger.error(err);

      return {
        error: errCode,
        message,
      };
    }
  }

  return {
    status: 200,
    redirect_to_payment: false,
    transaction,
  };
};
