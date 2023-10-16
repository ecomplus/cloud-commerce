import * as fs from 'node:fs';
import url from 'node:url';
import { join as joinPath } from 'node:path';
import api from '@cloudcommerce/api';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const readFile = (path) => fs.readFileSync(joinPath(__dirname, path), 'utf8');

const responseError = (status, error, message) => {
  return {
    status: status || 409,
    error,
    message,
  };
};

const isSandbox = false; // TODO: false

const getOrderById = async (orderId) => {
  const { data } = await api.get(`orders/${orderId}`);
  return data;
};

const addPaymentHistory = async (orderId, body) => {
  return api.post(`orders/${orderId}/payments_history`, body);
};

const updateTransaction = (orderId, body, transactionId) => {
  const urlTransaction = transactionId ? `/${transactionId}` : '';
  const method = transactionId ? 'PATCH' : 'POST';

  return api[method](`orders/${orderId}/transactions${urlTransaction}`, body);
};

const getOrderIntermediatorTransactionId = async (invoiceId) => {
  let queryString = `?transactions.intermediator.transaction_id=${invoiceId}`;
  queryString += '&fields=transactions,financial_status.current,status';

  const { data: result } = await api.get(`orders/${queryString}`);

  return result.length ? result[0] : null;
};

export {
  readFile,
  responseError,
  isSandbox,
  getOrderById,
  addPaymentHistory,
  updateTransaction,
  getOrderIntermediatorTransactionId,

};
