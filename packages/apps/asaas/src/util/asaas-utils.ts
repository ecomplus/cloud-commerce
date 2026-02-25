/* eslint-disable import/prefer-default-export */
import type { ListPaymentsResponse } from '@cloudcommerce/types';

type PaymentGateway = ListPaymentsResponse['payment_gateways'][number]

export const addInstallments = (
  total: number | undefined,
  installments: { [key: string]: any },
  gateway?: PaymentGateway,
  response?: ListPaymentsResponse,
) => {
  if (!gateway) {
    gateway = {
      label: 'Cartão de crédito',
      payment_method: {
        code: 'credit_card',
      },
    };
  }
  let maxInterestFree = total && !(installments.interest_free_min_amount > total)
    ? installments.max_interest_free
    : 0;
  const maxInstallments = installments.max_number && maxInterestFree
    ? Math.max(installments.max_number, maxInterestFree)
    : installments.max_number || maxInterestFree;
  if (maxInstallments > 1) {
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
    gateway.installment_options = [];
    if (total) {
      for (let number = 2; number <= maxInstallments; number++) {
        const tax = !(maxInterestFree >= number);
        const interest = tax
          ? installments.monthly_interest / 100
          : undefined;
        const value = !tax
          ? (total / number)
          // https://pt.wikipedia.org/wiki/Tabela_Price
          : total * (interest! / (1 - (1 + interest!) ** -number));
        if (value >= minInstallment) {
          gateway.installment_options.push({
            number,
            value,
            tax,
          });
        }
      }
    }
  }
  return { response, gateway };
};
