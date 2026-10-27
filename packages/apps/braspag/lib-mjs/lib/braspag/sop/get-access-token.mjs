import { logger } from '@cloudcommerce/firebase/lib/config';
import axios from 'axios';
import OAuth2AdminBraspag from '../admin/get-auth.mjs';

const auth = async (isSandbox) => new Promise((resolve, reject) => {
  const oAuth2AdminBraspag = new OAuth2AdminBraspag(isSandbox);

  const request = async (isRetry) => {
    oAuth2AdminBraspag.preparing
      .then(() => {
        const { accessToken } = oAuth2AdminBraspag;
        const urlAuthSOP = `https://transaction${isSandbox ? 'sandbox' : ''}`
          + '.pagador.com.br/post/api/public/v2/accesstoken';
        const headers = {
          MerchantId: process.env.BRASPAG_MERCHANT_ID,
          Authorization: `Bearer ${accessToken}`,
          'content-type': 'application/json',
        };
        return axios.post(urlAuthSOP, {}, { headers });
      })
      .then(({ data }) => {
        let expire = new Date();
        if (data.ExpiresIn) {
          expire = new Date(`${data.ExpiresIn.replace('T', ' ')} UTC-3`);
        }
        resolve({
          accessToken: data.AccessToken,
          expiresIn: expire.getTime(),
        });
      })
      .catch((err) => {
        if (!isRetry && err.response && err.response.status >= 429) {
          setTimeout(() => request(true), 7000);
        }
        reject(err);
      });
  };
  request();
});

/**
 * A SOP access token tokenizes a single card, so every `list_payments` gets a
 * new one (the OAuth token behind it stays cached on `admin/get-auth.mjs`).
 * Shared through a cache, the token was already used by another buyer or a
 * previous attempt, and the SOP API answers 500 without CORS headers.
 */
export default function getAccessToken(isSandbox = false) {
  const { BRASPAG_CLIENT_ID: clientId } = process.env;
  logger.info(`> Braspag SOP ${clientId} ${isSandbox ? 'SandBox' : ''}`);
  this.preparing = auth(isSandbox).then((data) => {
    this.accessToken = data.accessToken;
    return this;
  });
}
