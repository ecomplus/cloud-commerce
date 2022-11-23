import type { ListPaymentsResponse } from '@cloudcommerce/types/modules/list_payments:response';
import { readJson } from './utils';

type Gateway = ListPaymentsResponse['payment_gateways'][number]

const addInstallments = (
  total: number | undefined,
  installments: { [key: string]: any },
  gateway: Gateway,
  response?: ListPaymentsResponse,
) => {
  const IPInterestMonthly = readJson('../../assets/ip-interest-monthly.json');

  const maxInterestFree = installments.max_interest_free;
  const minInstallment = installments.min_installment || 5;
  const qtyPosssibleInstallment = total ? Math.floor((total / minInstallment)) : 12;
  const maxInstallments = installments.max_number
    || (qtyPosssibleInstallment < 12 ? qtyPosssibleInstallment : 12);

  const monthlyInterest = installments.monthly_interest || 0;
  let monthlyInstallmentInterest = 0;

  if (maxInterestFree <= 1) {
    const IPInterestMonthlyDefault = IPInterestMonthly[maxInstallments - 1];

    monthlyInstallmentInterest = (monthlyInterest > IPInterestMonthlyDefault ? monthlyInterest
      : IPInterestMonthlyDefault);
  }

  if (maxInstallments > 1) {
    if (response) {
      response.installments_option = {
        min_installment: minInstallment,
        max_number: maxInterestFree > 1 ? maxInterestFree : maxInstallments,
        monthly_interest: monthlyInstallmentInterest,
      };
    }

    // list installment options
    gateway.installment_options = [];
    if (total) {
      for (let number = 2; number <= maxInstallments; number++) {
        const tax = !(maxInterestFree >= number);
        let interest;
        if (tax) {
          const IPMonthInterestRate = IPInterestMonthly[number - 1];
          interest = (monthlyInterest > IPMonthInterestRate ? monthlyInterest : IPMonthInterestRate)
            / 100;
        }
        const value = !tax ? (total / number)
          : total * (interest / (1 - (1 + interest) ** -number));

        if (value && value >= 1) {
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

export default addInstallments;
