export default (amount, response, installments = {}, gateway = {}) => {
  const maxInterestFree = installments.max_interest_free;
  const minInstallment = installments.min_installment || 5;
  const qtyPosssibleInstallment = Math.floor((amount.total / minInstallment));
  const maxInstallments = installments.max_number
    || (qtyPosssibleInstallment < 12 ? qtyPosssibleInstallment : 12);
  const monthlyInterest = installments.monthly_interest || 0;

  if (maxInstallments > 1) {
    if (response) {
      response.installments_option = {
        min_installment: minInstallment,
        max_number: maxInterestFree > 1 ? maxInterestFree : maxInstallments,
        monthly_interest: maxInterestFree > 1 ? 0 : monthlyInterest,
      };
    }

    const isInterestFreeMinAmount = installments.interest_free_min_amount
      && amount.total >= (installments.interest_free_min_amount);

    // list installment options
    gateway.installment_options = [];
    for (let number = 2; number <= maxInstallments; number++) {
      const tax = !(maxInterestFree >= number);
      let interest;
      if (tax || !isInterestFreeMinAmount) {
        interest = monthlyInterest / 100;
      }
      let value;
      if ((!tax && isInterestFreeMinAmount) || !interest) {
        value = amount.total / number;
      } else {
        value = amount.total * (interest / (1 - (1 + interest) ** -number));
      }
      if (value && value >= 1) {
        gateway.installment_options.push({
          number,
          value,
          tax: tax || !isInterestFreeMinAmount,
        });
      }
    }
  }
  return { response, gateway };
};
