import axios from 'axios';
import qs from 'qs';

const createAuth = (hashLogin, isSandbox) => new Promise((resolve, reject) => {
  const headers = {
    'content-type': 'application/x-www-form-urlencoded',
    Authorization: `Basic ${hashLogin}`,
  };

  /*
    // Auth
    SANDBOX: https://authsandbox.braspag.com.br/oauth2/token
    PRODUÇÃO: https://auth.braspag.com.br/oauth2/token
  */

  const uri = `https://auth${isSandbox ? 'sandbox' : ''}.braspag.com.br/oauth2/token`;
  const body = qs.stringify({ grant_type: 'client_credentials' });

  const request = async (isRetry) => {
    axios.post(uri, body, { headers })
      .then(({ data }) => resolve(data))
      .catch((err) => {
        if (!isRetry && err.response && err.response.status >= 429) {
          setTimeout(() => request(true), 7000);
        }
        reject(err);
      });
  };
  request();
});

export default createAuth;
