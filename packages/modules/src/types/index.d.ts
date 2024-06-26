import type {
  CheckoutBody,
  Carts,
  Orders,
  CalculateShippingResponse,
  ListPaymentsResponse,
  Products
} from '@cloudcommerce/types';
import { Transaction } from '@cloudcommerce/types/modules/@checkout:params';

type Items = Carts['items']
type Item = Items[number]

type Amount = Orders['amount']

type CheckoutBodyWithItems = Omit<CheckoutBody, 'items'> & {
  items: Items
  subtotal: number,
  amount: Amount
}

type CheckoutCustomer = Exclude<CheckoutBody['customer'], undefined>

type TransactionOrder = Exclude<Orders['transactions'], undefined>[number]
type StatusTransactionOrder = Pick<TransactionOrder, 'status'>['status']
type BodyTransactionOrder = Omit<TransactionOrder, 'status'> & {
  status: StatusTransactionOrder
}

type OrderPaymentHistory = Pick<Orders, 'payments_history' | 'financial_status' | 'amount'>
type PaymentHistory = Exclude<Pick<Orders, 'payments_history'>['payments_history'], undefined>[number]

type CheckoutTransaction = Exclude<CheckoutBody['transaction'], Transaction[]>

type Payment = Omit<CheckoutBodyItems, 'transaction'> & {
  transaction: CheckoutTransaction
}

type CheckoutShippingService = CalculateShippingResponse['shipping_services'][number]

type PaymentGateways = ListPaymentsResponse['payment_gateways']
type PaymentMethod = Pick<PaymentGateways[number]['payment_method'], 'code' | 'name'>

export {
  CheckoutBodyWithItems,
  Payment,
  Items,
  Item,
  CheckoutCustomer,
  PaymentMethod,
  Amount,
  PaymentGateways,
  CheckoutTransaction,
  TransactionOrder,
  OrderPaymentHistory,
  BodyTransactionOrder,
  PaymentHistory,
};
