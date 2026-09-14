import type { Orders } from '@cloudcommerce/types';
import type Bling from '../../bling-auth/client';

// https://developer.bling.com.br/referencia#/Formas%20de%20Pagamento
export const parsePaymentType = {
  credit_card: 3, // Cartão de Crédito
  banking_billet: 15, // Boleto Bancário
  online_debit: 16,
  account_deposit: 20, // Pagamento Instantâneo (PIX) – Estático
  debit_card: 4, // Cartão de Débito
  balance_on_intermediary: 18,
  loyalty_points: 19, // Programa de Fidelidade, Cashback, Crédito Virtual
  other: 99, // Outros
};

export const getPaymentBling = async (
  bling: Bling,
  transaction: Exclude<Orders['transactions'], undefined>[0] | undefined,
  appDataParsePayment: Array<Record<string, any>> | undefined,
  paymentLabel?: string,
) => {
  const paymentMethod = transaction?.payment_method || ({} as Record<string, any>);
  const namePaymentMethod = (paymentLabel || paymentMethod.name)?.toLowerCase();
  let parsePayment: Record<string, any> | undefined;
  if (appDataParsePayment && appDataParsePayment.length) {
    parsePayment = appDataParsePayment.find(({ ecom_payment: ecomPayment }) => {
      return ecomPayment?.toLowerCase() === namePaymentMethod;
    });
  }
  if (parsePayment) {
    return parsePayment.bling_payment;
  }
  const query = paymentMethod.code
    ? `?tiposPagamentos[]=${parsePaymentType[paymentMethod.code]}`
    : '';
  const formaPagamento = await bling.get(`/formas-pagamentos${query}`)
    .then(({ data }) => {
      if (!data.data?.length) {
        return bling.get('/formas-pagamentos')
          .then(({ data: fallback }) => fallback.data?.[0]);
      }
      return data.data[0];
    });
  return formaPagamento?.id;
};
