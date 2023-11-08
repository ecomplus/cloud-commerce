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
    timeoutSeconds: 30,
  })
  .https.onRequest((req, res) => {
    if (!process.env.PASSPORT_DISABLE_CORS) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, OPTIONS');
      res.setHeader('Access-Control-Max-Age', '600');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Authorization, Content-Type, X-Store-ID, X-My-ID, X-Access-Token',
      );
      if (req.method === 'OPTIONS') {
        res.end();
        return Promise.resolve();
      }
    }
    return servePassportApi(req, res);
  });
