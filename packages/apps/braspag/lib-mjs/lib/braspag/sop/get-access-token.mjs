import { logger } from '@cloudcommerce/firebase/lib/config';
import axios from 'axios';
import OAuth2AdminBraspag from '../admin/get-auth.mjs';
import requestWithRetry from '../request-with-retry.mjs';

const createAccessToken = async (isSandbox) => {
  const oAuth2AdminBraspag = new OAuth2AdminBraspag(isSandbox);
  await oAuth2AdminBraspag.preparing;
  const urlAuthSOP = `https://transaction${isSandbox ? 'sandbox' : ''}`
    + '.pagador.com.br/post/api/public/v2/accesstoken';
  const headers = {
    'MerchantId': process.env.BRASPAG_MERCHANT_ID,
    'Authorization': `Bearer ${oAuth2AdminBraspag.accessToken}`,
    'content-type': 'application/json',
  };
  const { data } = await requestWithRetry(() => axios.post(urlAuthSOP, {}, { headers }));
  return data.AccessToken;
};

/**
 * A SOP access token tokenizes a single card, so every `list_payments` gets a
 * new one (the OAuth token behind it stays cached on `admin/get-auth.mjs`).
 * Shared through a cache, the token was already used by another buyer or a
 * previous attempt, and the SOP API answers 500 without CORS headers.
 */
export default function getAccessToken(isSandbox = false) {
  const { BRASPAG_CLIENT_ID: clientId } = process.env;
  logger.info(`> Braspag SOP ${clientId} ${isSandbox ? 'SandBox' : ''}`);
  this.preparing = createAccessToken(isSandbox).then((accessToken) => {
    this.accessToken = accessToken;
    return this;
  });
}
