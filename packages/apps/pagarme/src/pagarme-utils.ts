import type { ListPaymentsResponse } from '@cloudcommerce/types';

type Gateway = ListPaymentsResponse['payment_gateways'][number];

export const addInstallments = (
  finalTotal: number | undefined,
  installments: { [key: string]: any },
  gateway?: Gateway,
  response?: ListPaymentsResponse,
  initialTotal?: number,
  isDiscountInOneParcel = false,
) => {
  if (!gateway) {
    gateway = {
      label: 'Cartão de crédito',
      payment_method: {
        code: 'credit_card',
      },
    };
  }
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

export const parsePagarmeStatus = (pagarmeStatus: string) => {
  switch (pagarmeStatus) {
    case 'processing':
    case 'analyzing':
      return 'under_analysis';
    case 'authorized':
    case 'paid':
    case 'refunded':
      return pagarmeStatus;
    case 'waiting_payment':
      return 'pending';
    case 'pending_refund':
      return 'in_dispute';
    case 'refused':
      return 'unauthorized';
    case 'chargedback':
      return 'refunded';
    case 'pending_review':
      return 'authorized';
    default:
      return 'unknown';
  }
};
