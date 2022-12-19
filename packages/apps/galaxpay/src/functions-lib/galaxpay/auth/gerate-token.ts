// import logger from 'firebase-functions/logger';
import Axios from './create-axios';

const gereteToken = (
  hashLogin: string,
  isSandbox?: boolean,
  galaxpayPartnerHash?: string,
) => new Promise((resolve, reject) => {
  // https://docs.galaxpay.com.br/autenticacao
  // https://docs.galaxpay.com.br/auth/token

  const axios = Axios(null, isSandbox);
  const request = (isRetry?: boolean) => {
    const headers = { Authorization: `Basic ${hashLogin}` };
    if (!isSandbox && galaxpayPartnerHash) {
      // logger.log('#AuthorizationPartner ');
      Object.assign(headers, { AuthorizationPartner: galaxpayPartnerHash });
    }
    axios.post('/token', {
      grant_type: 'authorization_code',
      scope: 'customers.read customers.write plans.read plans.write transactions.read transactions.write webhooks.write cards.read cards.write card-brands.read subscriptions.read subscriptions.write charges.read charges.write boletos.read',
    }, { headers })
      .then(({ data }) => {
        resolve(data.access_token);
      })
      .catch((err) => {
        if (!isRetry && err.response && err.response.status >= 429) {
          setTimeout(() => request(true), 700);
        }
        reject(err);
      });
  };
  request();
});

export default gereteToken;
