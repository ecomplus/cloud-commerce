const parseAddress = (to) => ({
  City: to.city,
  State: to.province_code,
  Country: to.country_code ? to.country_code.toUpperCaseCase() : 'BRA',
  ZipCode: to.zip.replace(/\D/g, '').padStart(8, '0'),
  Number: `${String(to.number) || 's/n'}`,
  street: `${to.street}`,
  District: `${to.borough}`,
  Complement: to.complement || '',
});

const parsePaymentType = {
  credit_card: 'CreditCard',
  banking_billet: 'Boleto',
  account_deposit: 'Pix',
};

const parseStatus = {
  1: 'authorized', // Authorized
  2: 'paid', // PaymentConfirmed
  3: 'unauthorized', // Denied
  10: 'voided', // Voided
  11: 'refunded', // Refunded
  12: 'pending', // Pending
  13: 'voided', // Aborted
  // 20: Scheduled
};

export {
  parseStatus,
  parsePaymentType,
  parseAddress,
};
