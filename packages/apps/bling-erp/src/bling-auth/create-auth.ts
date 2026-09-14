import { URLSearchParams } from 'url';
import { logger } from '@cloudcommerce/firebase/lib/config';
import createAxios from './create-axios';

export type BlingOAuthTokens = {
  access_token: string,
  refresh_token: string,
  expires_in: number,
  token_type?: string,
  scope?: string,
};

/*
Authorization flow:
https://developer.bling.com.br/aplicativos#fluxo-de-autoriza%C3%A7%C3%A3o
*/
const createAuth = (
  clientId: string,
  clientSecret: string,
  code?: string | null,
  refreshToken?: string | null,
) => new Promise<BlingOAuthTokens>((resolve, reject) => {
  const axios = createAxios(undefined, clientId, clientSecret);
  const request = (retryCount = 0) => {
    logger.info(`>> Create Bling auth with ${refreshToken ? 'refresh_token' : 'code'}`);
    const grantType: Record<string, string> = {
      grant_type: refreshToken ? 'refresh_token' : 'authorization_code',
    };
    if (refreshToken) {
      grantType.refresh_token = refreshToken;
    } else if (code) {
      grantType.code = code;
    }
    const params = new URLSearchParams(grantType);
    axios.post('/oauth/token', params.toString())
      .then(({ data }) => resolve(data))
      .catch((err: any) => {
        logger.warn(`Failed Bling OAuth: ${JSON.stringify({
          status: err.response?.status,
          response: err.response?.data,
        })}`);
        if (retryCount < 2 && err.response?.status === 429) {
          const delay = retryCount === 0 ? 15000 : 30000;
          setTimeout(() => request(retryCount + 1), delay);
        } else {
          reject(err);
        }
      });
  };
  request(0);
});

export default createAuth;
