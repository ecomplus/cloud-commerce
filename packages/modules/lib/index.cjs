const calculateShipping = require('../schemas/calculate_shipping.cjs');
const applyDiscount = require('../schemas/apply_discount.cjs');
const listPayments = require('../schemas/list_payments.cjs');
const createTransaction = require('../schemas/create_transaction.cjs');
const checkout = require('../schemas/@checkout.cjs');

module.exports = {
  calculateShipping,
  applyDiscount,
  listPayments,
  createTransaction,
  checkout,

  schemas: {
    calculate_shipping: calculateShipping,
    apply_discount: applyDiscount,
    list_payments: listPayments,
    create_transaction: createTransaction,
    '@checkout': checkout,
  },
};
