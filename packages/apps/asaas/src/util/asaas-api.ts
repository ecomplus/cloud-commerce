import axios from 'axios';

export const getAsaasAxios = async () => {
  const { ASAAS_API_KEY, ASAAS_ENV } = process.env;
  const baseURL = ASAAS_ENV === 'sandbox'
    ? 'https://api-sandbox.asaas.com/'
    : 'https://api.asaas.com/';
  return axios.create({
    baseURL,
    headers: {
      'User-Agent': 'ecomplus/1.0.0 (Node.js; prod)',
      'access_token': ASAAS_API_KEY,
    },
  });
};

export default getAsaasAxios;
