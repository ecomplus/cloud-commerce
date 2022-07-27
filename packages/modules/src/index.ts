import * as calculateShipping from '../schemas/calculate_shipping.cjs';
import * as applyDiscount from '../schemas/apply_discount.cjs';
import * as listPayments from '../schemas/list_payments.cjs';
import * as createTransaction from '../schemas/create_transaction.cjs';
import * as checkout from '../schemas/@checkout.cjs';

export default {
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
