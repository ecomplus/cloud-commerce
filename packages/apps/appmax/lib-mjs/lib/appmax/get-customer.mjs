import axios from 'axios';

export const createOrUpdateCustomer = async (
  buyer,
  address,
  items,
  browserIp,
  utm,
  token,
) => {
  const { email, fullname } = buyer;
  const splitedName = fullname.split(' ');
  const products = [];
  items.forEach(({ sku, quantity }) => {
    if (quantity > 0) {
      products.push({
        product_sku: sku,
        product_qty: quantity,
      });
    }
  });
  const body = {
    'access-token': token,
    'firstname': splitedName[0],
    'lastname': splitedName[splitedName.length - 1],
    email,
    'telephone': buyer.phone.number,
    'postcode': address.zip.replace(/\D/g, '').padStart(8, '0'),
    'address_street': address.street,
    'address_street_number': address.number ? String(address.number) : 'SN',
    'address_street_complement': address.complement,
    'address_street_district': address.borough,
    'address_city': address.city,
    'address_state': address.province || address.province_code,
    'ip': browserIp,
    'custom_txt': items[0].name,
    products,
    'tracking': {
      'utm_source': utm.source,
      'utm_campaign': utm.campaign,
      'utm_medium': utm.medium,
      'utm_content': utm.content,
      'utm_term': utm.content,
    },
  };
  const { data } = await axios({
    url: 'https://admin.appmax.com.br/api/v3/customer',
    method: 'post',
    data: body,
  });
  if (data && data.status === 200) {
    return data.data && data.data.id;
  }
  return null;
};

export default createOrUpdateCustomer;
