import type { ListPaymentsResponse } from '@cloudcommerce/types';

type Gateway = ListPaymentsResponse['payment_gateways'][number]

const addInstallments = (
  finalTotal: number | undefined,
  installments: { [key: string]: any },
  gateway: Gateway,
  response?: ListPaymentsResponse,
  initialTotal?: number,
  isDiscountInOneParcel = false,
) => {
  let total = finalTotal;
  if (isDiscountInOneParcel) {
    total = initialTotal;
  }
  let maxInterestFree = total && !(installments.interest_free_min_amount > total)
    ? installments.max_interest_free
    : 0;
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
    if (total) {
      for (let number = 2; number <= maxInstallments; number++) {
        const tax = !(maxInterestFree >= number);
        let interest;

        if (tax) {
          interest = installments.monthly_interest / 100;
        }
        const value = !tax
          ? (total / number)
          // https://pt.wikipedia.org/wiki/Tabela_Price
          : total * (interest / (1 - (1 + interest) ** -number));

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

export default addInstallments;
