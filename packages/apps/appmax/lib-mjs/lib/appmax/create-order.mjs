import { logger } from '@cloudcommerce/firebase/lib/config';
import axios from 'axios';

export const createOrder = async (items, amount, appmaxCustomerId, token) => {
  const { total, discount, freight } = amount;
  const products = [];
  items.forEach(({
    sku, quantity, name, price, final_price: finalPrice,
  }) => {
    if (quantity > 0) {
      products.push({
        sku,
        name,
        qty: quantity,
        price: finalPrice || price,
      });
    }
  });
  const body = {
    'access-token': token,
    total,
    products,
    'shipping': freight,
    'customer_id': appmaxCustomerId,
    discount,
  };
  const { data } = await axios({
    method: 'post',
    url: 'https://admin.appmax.com.br/api/v3/order',
    data: body,
  });
  if (data?.status === 200) {
    const orderId = data.order_id || data.data?.order_id || data.data?.id;
    if (orderId) return orderId;
  }
  logger.warn('Unexpected response from Appmax create order', { body, data });
  return null;
};

export default createOrder;
