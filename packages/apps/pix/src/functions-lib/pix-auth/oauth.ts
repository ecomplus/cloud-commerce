import createAxios from './create-axios';

type Option = {
  clientId?: string;
  clientSecret?: string;
  oauthEndpoint?: any;
  pfx?: any;
  tokenData?: { [key: string]: any };
  baseURL?: string
}

export default (options: Option) => new Promise((resolve, reject) => {
  const {
    clientId,
    clientSecret,
    oauthEndpoint,
    pfx,
    tokenData,
  } = options;
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const axios = createAxios({
    pfx,
    tokenData,
  });

  const request = (isRetry?: boolean) => {
    axios({
      url: oauthEndpoint || '/oauth/token',
      method: 'post',
      headers: {
        Authorization: `Basic ${auth}`,
      },
      data: {
        grant_type: 'client_credentials',
      },
    })
      .then(({ data }) => resolve(data))
      .catch((err) => {
        if (!isRetry && err.response && err.response.status >= 429) {
          setTimeout(() => request(true), 4000);
        }
        reject(err);
      });
  };
  request();
});
