import axios from 'axios';
// import logger from 'firebase-functions/logger';

export default (accessToken: string | undefined | null, isSandbox?: boolean) => {
  // https://docs.galaxpay.com.br/autenticacao
  // https://docs.galaxpay.com.br/auth/token

  const headers = {
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    // logger.log('>(App GalaxPay) token: ', accessToken);
    Object.assign(headers, { Authorization: `Bearer ${accessToken}` });
    Object.assign(headers, { 'Accept-Encoding': 'gzip,deflate,compress' });
  }

  return axios.create({
    baseURL: `https://api.${isSandbox ? 'sandbox.cloud.' : ''}galaxpay.com.br/v2`,
    headers,
  });
};
