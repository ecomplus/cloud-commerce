import axios from 'axios';

const createAxios = (isQuery, isSimulated) => {
  const headers = {
    'Content-Type': 'application/json',
    MerchantId: process.env.BRASPAG_MERCHANT_ID,
    MerchantKey: process.env.BRASPAG_MERCHANT_KEY,
  };
  const url = `api${isQuery ? 'query' : ''}${isSimulated ? 'sandbox' : ''}`;
  const baseURL = process.env.BRASPAG_API_TYPE === 'cielo'
    ? `https://${url}.cieloecommerce.cielo.com.br/1`
    : `https://${url}.braspag.com.br/v2`;
  return axios.create({
    baseURL,
    headers,
  });
};

export default createAxios;
