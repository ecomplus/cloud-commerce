import axios from 'axios';

export default (accessToken: null | string, isSandbox?: boolean) => {
  // https://github.com/ecomplus/app-infinitepay/issues/77#issuecomment-1189795488

  const headers = {
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    // logger.log('> token ', accessToken);
    Object.assign(headers, {
      Authorization: `Bearer ${accessToken}`,
    });
  }

  return axios.create({
    baseURL: `https://api${isSandbox ? '-staging' : ''}.infinitepay.io`,
    headers,
  });
};
