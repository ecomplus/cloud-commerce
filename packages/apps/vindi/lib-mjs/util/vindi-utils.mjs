import axios from 'axios';

export const addInstallments = (
  amount,
  installments,
  gateway = {},
  response = null,
) => {
  let maxInterestFree = !(installments.interest_free_min_amount > amount.total)
    ? installments.max_interest_free : 0;
  const maxInstallments = installments.max_number && maxInterestFree
    ? Math.max(installments.max_number, maxInterestFree)
    : installments.max_number || maxInterestFree;
  if (maxInstallments > 1) {
    // default installments option
    if (!installments.monthly_interest) {
      maxInterestFree = maxInstallments;
    }
    const minInstallment = installments.min_installment || 5;
    if (response) {
      response.installments_option = {
        min_installment: minInstallment,
        max_number: maxInterestFree || installments.max_number,
        monthly_interest: maxInterestFree ? 0 : installments.monthly_interest,
      };
    }
    // list installment options
    gateway.installment_options = [];
    for (let number = 2; number <= maxInstallments; number++) {
      const tax = !(maxInterestFree >= number);
      let interest;
      if (tax) {
        interest = installments.monthly_interest / 100;
      }
      const value = !tax ? amount.total / number
        // https://pt.wikipedia.org/wiki/Tabela_Price
        : amount.total * (interest / (1 - (1 + interest) ** -number));
      if (value >= minInstallment) {
        gateway.installment_options.push({
          number,
          value,
          tax,
        });
      }
    }
  }
  return { response, gateway };
};

export const parseVindiStatus = (vindiChargeStatus) => {
  switch (vindiChargeStatus) {
    case 'pending':
    case 'paid':
      return vindiChargeStatus;
    case 'canceled':
      return 'voided';
    case 'processing':
      return 'under_analysis';
    case 'fraud_review':
      return 'authorized';
    default:
  }
  return 'unknown';
};

export const createVindiAxios = (vindiApiKey, isSandbox) => {
  // https://vindi.github.io/api-docs/dist/
  return axios.create({
    baseURL: `https://${(isSandbox ? 'sandbox-' : '')}app.vindi.com.br/api/v1/`,
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${vindiApiKey}:`).toString('base64'),
    },
  });
};
