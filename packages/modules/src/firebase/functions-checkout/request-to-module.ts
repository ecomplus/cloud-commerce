import { logger } from '@cloudcommerce/firebase/lib/config';
import axios from 'axios';

// handle other modules endpoints directly
export default async (
  checkoutBody: { [key: string]: any },
  modulesBaseURL: string,
  label: string,
) => {
  const msgErr: { moreInfo?: string, code?: number | string, status?: number } = {};

  let moduleBody: { [key: string]: any } | undefined;
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

  if (moduleBody && modName) {
    // mask request objects
    const url = `${modulesBaseURL}/${modName}?app_id=${(moduleBody.app_id || '')}`;
    // mount request body with received checkout body object
    const body = {
      ...checkoutBody,
      ...moduleBody,
      is_checkout_confirmation: true,
    };
    try {
      const { data: { result } } = await axios.post(url, body);
      // find application validation error
      if (Array.isArray(result)) {
        let countAppErro = 0;
        for (let i = 0; i < result.length; i++) {
          const { validated, error, response } = result[i];
          if (!validated || error) {
            countAppErro += 1;
            logger.error(response);
            msgErr.moreInfo += ` ${response}`;
          }
        }
        if (result.length === countAppErro) {
          msgErr.code = 'APP_MODULE_ERROR_VALIDATION';
          return { msgErr };
        }
      }
      return result;
    } catch (err: any) {
      logger.error(err);
      logger.warn(`Error on post to ${url}`, {
        body,
        response: err.response?.data,
      });
      msgErr.moreInfo = 'Unexpected error ';
      if (axios.isAxiosError(err)) {
        msgErr.moreInfo = err.message;
        if (err.code) {
          msgErr.code = `MODULE_${err.code}`;
        }
        if (err.response) {
          msgErr.status = err.response.status;
        }
      }
      return { msgErr };
    }
  }

  msgErr.moreInfo = 'Body, application or module not informed';
  msgErr.status = 404;
  msgErr.code = 'CKT900';

  return { msgErr };
};
