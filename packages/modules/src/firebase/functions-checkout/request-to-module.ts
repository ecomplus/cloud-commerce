import { logger } from 'firebase-functions';
import axios from 'axios';

// handle other modules endpoints directly
export default async (
  checkoutBody: {[key:string]:any},
  hostname: string,
  label: string,
) => {
  const locationId = process.env.FIREBASE_CONFIG
    ? (JSON.parse(process.env.FIREBASE_CONFIG).locationId || 'southamerica-east1')
    : 'southamerica-east1';

  const baseUrl = hostname !== 'localhost' ? `https://${hostname}`
    : `http://localhost:5001/${process.env.GCLOUD_PROJECT}/${locationId}/modules`; // To LocalTest

  let moduleBody: {[key:string]:any} | undefined;
  let modName: string | undefined;
  switch (label) {
    case 'shipping':
      modName = 'calculate_shipping';
      moduleBody = checkoutBody.shipping;
      break;
    case 'payment':
      modName = 'list_payments';
      moduleBody = checkoutBody.transaction;
      break;
    case 'discount':
      modName = 'apply_discount';
      moduleBody = checkoutBody.discount;
      break;
    case 'transaction':
      modName = 'create_transaction';
      moduleBody = checkoutBody.transaction;
      break;
    default:
      break;
  }

  if (moduleBody && moduleBody.app_id && modName) {
    // mask request objects
    const url = `${baseUrl}/${modName}?app_id=${moduleBody.app_id}`;
    // mount request body with received checkout body object
    const body = {
      ...checkoutBody,
      ...moduleBody,
      is_checkout_confirmation: true,
    };
    try {
      console.log('> ', JSON.stringify({ url, body }));
      const resp = (await axios.post(
        url,
        body,
      )).data;
      if (Array.isArray(resp.result)) {
        let countAppErro = 0;
        for (let i = 0; i < resp.result.length; i++) {
          const result = resp.result[i];
          if (!result.validated || result.error) {
            countAppErro += 1;
            console.error(result.response);
            logger.error(result.response);
          }
        }
        if (resp.result.length === countAppErro) {
          return null;
        }
      }
      return resp.result;
    } catch (e) {
      logger.error('>>erro: ', e);
      return null;
    }
  }
  return null;
};
