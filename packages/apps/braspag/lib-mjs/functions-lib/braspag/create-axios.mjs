import axios from 'axios';
import { isSandbox } from '../utils.mjs';

export default (merchantId, merchantKey, isQuery) => {
  const version = 'v2';
  const headers = {
    'Content-Type': 'application/json',
    MerchantId: merchantId,
    MerchantKey: merchantKey,
  };

  // logger.log(`>Request ${isSandbox ? 'sandbox' : ''}`);
  const url = `api${isQuery ? 'query' : ''}${isSandbox ? 'sandbox' : ''}`;

  return axios.create({
    baseURL: `https://${url}.braspag.com.br/${version}`,
    headers,
  });
};
