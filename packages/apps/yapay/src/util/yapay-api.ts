import axios from 'axios';

export const getYapayAxios = async () => {
  const { YAPAY_API_TOKEN } = process.env;
  const baseURL = 'https://api.intermediador.yapay.com.br/api/v3/';
  const yapayAxios = axios.create({
    baseURL,
    headers: {
      'User-Agent': 'ecomplus/1.0.0 (Node.js; prod)',
    },
  });
  yapayAxios.interceptors.request.use((config) => {
    if (config.data && typeof config.data === 'object' && !config.data.token) {
      config.data.token = YAPAY_API_TOKEN;
    } else {
      config.params = {
        token_account: YAPAY_API_TOKEN,
        ...config.params,
      };
    }
    return config;
  });
  return yapayAxios;
};

export default getYapayAxios;
