import type { Orders } from '@cloudcommerce/api/types';
import logger from 'firebase-functions/logger';
import api from '@cloudcommerce/api';
import getAppData from '@cloudcommerce/firebase/lib/helpers/get-app-data';

export const cancelExpiredOrders = async () => {
  const appData = await getAppData('pagarMeV5', ['data']);
  const pixValidityMins = appData.account_deposit?.due_time;
  const pixValidityMs = pixValidityMins * 60 * 1000;
  const bolValidityDays = appData.banking_billet?.days_due_date;
  const bolValidityMs = bolValidityDays * 24 * 60 * 60 * 1000;
  if (!pixValidityMs && !bolValidityMs) {
    return;
  }
  const d = new Date();
  d.setDate(d.getDate() - 30);
  const endpoint = 'orders'
    + '?fields=_id,transactions'
    + '&transactions.app.intermediator.code=pagarme'
    + '&financial_status.current=pending'
    + `&updated_at>=${d.toISOString()}`
    + '&limit=500' as `orders?${string}`;
  const { data: { result: orders } } = await api.get(endpoint);
  logger.info(`${orders.length} orders listed`);
  orders.forEach(({ _id, transactions }) => {
    const transaction = transactions?.find(({ app }) => {
      return app?.intermediator?.code === 'pagarme';
    });
    if (!transaction) return;
    const transactionDate = transaction.created_at && new Date(transaction.created_at);
    if (!transactionDate) return;
    const paymentMethod = transaction.payment_method.code;
    if (paymentMethod === 'account_deposit') {
      if (!pixValidityMs) return;
      if (Date.now() - transactionDate.getTime() < pixValidityMs) return;
    } else if (paymentMethod === 'banking_billet') {
      if (!bolValidityMs) return;
      if (Date.now() - transactionDate.getTime() < bolValidityMs) return;
    } else {
      return;
    }
    api.post(`orders/${_id}/payments_history`, {
      transaction_id: transaction._id,
      date_time: new Date().toISOString(),
      status: 'voided',
      flags: ['pagarme-expired'],
    } as Exclude<Orders['payments_history'], undefined>[0]);
  });
};

export default cancelExpiredOrders;
