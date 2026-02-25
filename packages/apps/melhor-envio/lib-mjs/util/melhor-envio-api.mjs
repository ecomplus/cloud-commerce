import axios from 'axios';

export const getMEAxios = async () => {
  const { MELHORENVIO_TOKEN, MELHORENVIO_ENV } = process.env;
  const headers = {
    'Authorization': `Bearer ${MELHORENVIO_TOKEN}`,
  };
  const baseURL = MELHORENVIO_ENV === 'sandbox'
    ? 'https://sandbox.melhorenvio.com.br/api/v2/me'
    : 'https://melhorenvio.com.br/api/v2/me';
  return axios.create({
    baseURL,
    headers,
  });
};

export default getMEAxios;
