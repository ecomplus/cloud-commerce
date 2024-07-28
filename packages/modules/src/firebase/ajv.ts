import type { Response } from 'firebase-functions';
import { logger } from '@cloudcommerce/firebase/lib/config';
import Ajv, { Options, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';

const ajvOptions: Options = {
  coerceTypes: false,
  useDefaults: true,
  removeAdditional: true,
  // Explicitly set `allErrors` to false, when set to true a DoS attack is possible
  allErrors: false,
  multipleOfPrecision: 5,
  allowMatchingProperties: true,
};
const ajv = addFormats(new Ajv(ajvOptions));

const parseAjvErrors = (errors?: ErrorObject[] | null, ajvInstance = ajv) => {
  return ajvInstance.errorsText(errors, { separator: '\n' });
};

const sendRequestError = (res: Response, modName: string, errors?: ErrorObject[] | null) => {
  const errorsText = ajv.errorsText(errors, { separator: '\n' });
  if (modName === '@checkout') {
    logger.warn('Checkout body invalidated', { errorsText });
  }
  res.status(400).send({
    status: 400,
    error_code: 'MOD901',
    message: 'Bad-formatted JSON body (POST) or URL params (GET), details in `user_message`',
    user_message: { en_us: errorsText },
    more_info: `/${modName}/schema`,
  });
};

export default ajv;

export {
  ajv,
  ajvOptions,
  parseAjvErrors,
  sendRequestError,
};
