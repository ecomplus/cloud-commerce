import type {
  CheckoutBody, 
  Carts, 
  Orders, 
  CheckoutTransaction,
  CalculateShippingResponse,
  ListPaymentsResponse
} from '@cloudcommerce/types';

type Items = Carts['items']
type Item = Items[number]

type Amount = Orders['amount']

type CheckoutBodyWithItems = Omit<CheckoutBody, 'items'> & {
  items: Items
  subtotal: number,
  amount: Amount
}

type CustomerCheckout = Exclude<CheckoutBody['customer'], undefined>
type BodyOrder = Omit<Orders, '_id' | 'created_at' | 'updated_at' | 'store_id' | 'items' > &
  { items : Item[]}

type BodyPayment = Omit<CheckoutBodyItems, 'transaction'> & {
  transaction: CheckoutTransaction
}

type ShippingSerive = CalculateShippingResponse['shipping_services'][number]

type PaymentGateways = ListPaymentsResponse['payment_gateways']
type PaymentMethod = Pick<PaymentGateways[number]['payment_method'], 'code' | 'name'>

export {
  CheckoutBodyWithItems,
  BodyPayment,
  Items,
  Item,
  CustomerCheckout,
  BodyOrder,
  PaymentMethod,
  Amount,
  ShippingSerive,
  PaymentGateways,
};
