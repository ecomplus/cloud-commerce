const parseCountry = (countryCode) => {
  const code = countryCode ? String(countryCode).toUpperCase() : 'BR';
  // e-com.plus addresses use alpha-2, Braspag has always received Brazil as alpha-3 'BRA'
  // (the default when missing), other countries are sent as received
  return code === 'BR' ? 'BRA' : code;
};

export const parseAddress = (to) => ({
  City: to.city,
  State: to.province_code,
  Country: parseCountry(to.country_code),
  ZipCode: to.zip.replace(/\D/g, '').padStart(8, '0'),
  Number: to.number ? String(to.number) : 's/n',
  street: `${to.street}`,
  District: `${to.borough}`,
  Complement: (to.complement || '').substring(0, 20),
});

export const parsePaymentType = {
  credit_card: 'CreditCard',
  banking_billet: 'Boleto',
  account_deposit: 'Pix',
};

// https://braspag.github.io//manual/braspag-pagador#lista-de-status-da-transa%C3%A7%C3%A3o
export const parseStatus = {
  1: 'authorized', // Authorized
  2: 'paid', // PaymentConfirmed
  3: 'unauthorized', // Denied
  10: 'voided', // Voided
  11: 'refunded', // Refunded
  12: 'pending', // Pending
  13: 'voided', // Aborted
};

export default {
  parseStatus,
  parsePaymentType,
  parseAddress,
};
