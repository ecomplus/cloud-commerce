import { parseAddress, parsePaymentType } from './parsers.mjs';

export default (appData, orderId, params, methodPayment) => {
  const { amount, buyer, to } = params;

  const config = appData[methodPayment];

  const Address = to && to.street ? parseAddress(to) : parseAddress(params.billing_address);
  const body = {
    MerchantOrderId: orderId,
    Customer: {
      Name: buyer.fullname,
      Identity: buyer.doc_number,
      IdentityType: buyer.registry_type.toUpperCase() === 'P' ? 'CPF' : 'CNPJ',
    },
    Payment: {
      Provider: config.provider,
      Type: parsePaymentType[methodPayment] || 'CreditCard',
      Amount: (amount.total * 100),
    },
  };

  if (methodPayment === 'credit_card') {
    const hashCard = JSON.parse(Buffer.from(params.credit_card.hash, 'base64'));
    const installmentsNumber = params.installments_number || 1;

    Object.assign(
      body.Payment,
      {
        Installments: installmentsNumber,
        CreditCard: {
          PaymentToken: hashCard.token,
        },
      },
    );
  } else if (methodPayment === 'account_deposit') {
    Object.assign(body.Customer, { Address });
    Object.assign(body.Payment, { QrCodeExpiration: 86400 });
  }

  return body;
};
