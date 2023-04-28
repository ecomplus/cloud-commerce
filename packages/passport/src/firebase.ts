import '@cloudcommerce/firebase/lib/init';
import functions from 'firebase-functions/v1';
import config from '@cloudcommerce/firebase/lib/config';
import servePassportApi from './firebase/serve-passport-api';

const { httpsFunctionOptions } = config.get();
const { region } = httpsFunctionOptions;

// eslint-disable-next-line import/prefer-default-export
export const passport = functions
  .region(region)
  .runWith({
    ...httpsFunctionOptions,
    memory: '128MB',
    timeoutSeconds: 30,
  })
  .https.onRequest(servePassportApi);
