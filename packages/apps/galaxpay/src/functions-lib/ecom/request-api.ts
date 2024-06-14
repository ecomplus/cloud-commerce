import api from '@cloudcommerce/api';

const findOrderById = async (orderId: string) => {
  const { data } = await api.get(`orders/${orderId}`);
  return data;
};

const getProductsById = async (productId:string) => {
  const { data } = await api.get(`products/${productId}`);
  return data;
};

const getOrderWithQueryString = async (queryString:string) => {
  const { data } = await api.get(`orders?${queryString}`);
  return data;
};

const getOrderIntermediatorTId = (tId: string) => {
  const queryString = `?transactions.intermediator.transaction_id=${tId}`;
  return getOrderWithQueryString(queryString);
};

export {
  findOrderById,
  getOrderIntermediatorTId,
  getOrderWithQueryString,
  getProductsById,
};
