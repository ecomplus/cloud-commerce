import axios from 'axios';
import qs from 'qs';
import requestWithRetry, { TOKEN_TIMEOUT } from '../request-with-retry.mjs';

const createAuth = async (hashLogin, isSandbox) => {
  const headers = {
    'content-type': 'application/x-www-form-urlencoded',
    'Authorization': `Basic ${hashLogin}`,
  };

  /*
    // Auth
    SANDBOX: https://authsandbox.braspag.com.br/oauth2/token
    PRODUÇÃO: https://auth.braspag.com.br/oauth2/token
  */

  const uri = `https://auth${isSandbox ? 'sandbox' : ''}.braspag.com.br/oauth2/token`;
  const body = qs.stringify({ grant_type: 'client_credentials' });
  const { data } = await requestWithRetry(() => axios.post(uri, body, {
    headers,
    timeout: TOKEN_TIMEOUT,
  }));
  return data;
};

export default createAuth;
