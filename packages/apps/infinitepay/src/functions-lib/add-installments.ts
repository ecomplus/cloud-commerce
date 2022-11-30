import type { ListPaymentsResponse } from '@cloudcommerce/types/modules/list_payments:response';

const standardMonthlyInterest = [
  4.20,
  1.3390,
  1.5041,
  1.5992,
  1.6630,
  1.7057,
  2.3454,
  2.3053,
  2.2755,
  2.2490,
  2.2306,
  2.2111,
];

type Gateway = ListPaymentsResponse['payment_gateways'][number]

const addInstallments = (
  total: number | undefined,
  installments: { [key: string]: any },
  gateway: Gateway,
  response?: ListPaymentsResponse,
) => {
  const maxInterestFree = installments.max_interest_free;
  const minInstallment = installments.min_installment || 5;
  const qtyPosssibleInstallment = total ? Math.floor((total / minInstallment)) : 12;
  const maxInstallments = installments.max_number
    || (qtyPosssibleInstallment < 12 ? qtyPosssibleInstallment : 12);

  const monthlyInterest = installments.monthly_interest || 0;
  let monthlyInstallmentInterest = 0;

  if (maxInterestFree <= 1) {
    const IPInterestMonthly = standardMonthlyInterest[maxInstallments - 1];

    monthlyInstallmentInterest = (monthlyInterest > IPInterestMonthly ? monthlyInterest
      : IPInterestMonthly);
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
          const IPMonthInterestRate = standardMonthlyInterest[number - 1];
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
