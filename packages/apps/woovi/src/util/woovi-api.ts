import axios from 'axios';

export const getWooviAxios = async () => {
  const { WOOVI_APP_ID } = process.env;
  const baseURL = 'https://api.woovi.com/api/v1/';
  const wooviAxios = axios.create({
    baseURL,
    headers: {
      'User-Agent': 'ecomplus/1.0.0 (Node.js; prod)',
      'Authorization': WOOVI_APP_ID,
      'Content-Type': 'application/json',
    },
  });
  return wooviAxios;
};

export default getWooviAxios;
