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
    headers: { 'User-Agent': 'SEC07-Lintfr-VA3' },
    data: body,
  });
  if (data && data.status === 200) {
    return data.data && data.data.id;
  }
  return null;
};

export default createOrder;
