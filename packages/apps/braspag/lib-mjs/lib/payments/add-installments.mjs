// eslint-disable-next-line default-param-last
const addInstallments = (amount, installmentsConfig = {}, gateway = {}, response) => {
  const maxInterestFree = installmentsConfig.max_interest_free;
  const minInstallment = installmentsConfig.min_installment || 5;
  const qtyPosssibleInstallment = Math.floor((amount.total / minInstallment));
  const maxInstallments = installmentsConfig.max_number
    ? Math.min(installmentsConfig.max_number, qtyPosssibleInstallment)
    : Math.max(qtyPosssibleInstallment, 12);
  const monthlyInterest = installmentsConfig.monthly_interest || 0;
  const interestFreeMinAmount = installmentsConfig.interest_free_min_amount || 5;
  if (maxInstallments > 1) {
    if (response) {
      response.installments_option = {
        min_installment: minInstallment,
        max_number: maxInterestFree > 1 ? maxInterestFree : maxInstallments,
        monthly_interest: maxInterestFree > 1 ? 0 : monthlyInterest,
      };
    }
    const isAmountInterestFree = amount.total >= interestFreeMinAmount;
    gateway.installment_options = [];
    for (let number = 2; number <= maxInstallments; number++) {
      const hasTax = !isAmountInterestFree || number > maxInterestFree;
      let interest;
      if (hasTax) {
        interest = monthlyInterest / 100;
      }
      let value;
      if (!hasTax || !interest) {
        value = amount.total / number;
      } else {
        value = amount.total * (interest / (1 - (1 + interest) ** -number));
      }
      if (value && value >= 1) {
        gateway.installment_options.push({
          number,
          value,
          tax: hasTax,
        });
      }
    }
  }
  return { response, gateway };
};

export default addInstallments;
