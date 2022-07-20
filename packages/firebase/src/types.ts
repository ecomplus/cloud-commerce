/* eslint-disable import/prefer-default-export */

type EventSub = {
  event: 'orders-new'
    | 'orders-setAnyStatus'
    | 'orders-paid'
    | 'orders-readyForShipping'
    | 'orders-delivered'
    | 'orders-cancelled'
    | 'products-new'
    | 'products-setQuantity'
    | 'products-setPrice'
    | 'carts-new'
    | 'carts-setCustomer'
  appId: number,
};

export type {
  EventSub,
};
