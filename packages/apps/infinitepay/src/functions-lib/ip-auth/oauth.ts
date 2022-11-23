import * as logger from 'firebase-functions/logger';
import Axios from './create-axios';

export default (
  clienId: string,
  clientSecret: string,
  scope: string,
  isSandbox?: boolean,
) => new Promise((resolve, reject) => {
  //  https://github.com/ecomplus/app-infinitepay/issues/77#issuecomment-1189795488
  const axios = Axios(null, isSandbox);

  const request = (isRetry?: boolean) => {
    logger.log(`>>(App: InfinitePay) Auth ${scope} ${isSandbox ? 'Sandbox' : ''}`);
    axios.post('/v2/oauth/token', {
      grant_type: 'client_credentials',
      client_id: clienId,
      client_secret: clientSecret,
      scope,
    })
      .then(({ data }) => resolve(data))
      .catch((err: any) => {
        if (!isRetry && err.response && err.response.status >= 429) {
          setTimeout(() => request(true), 7000);
        }
        reject(err);
      });
  };
  request();
});
