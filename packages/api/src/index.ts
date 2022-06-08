// @ts-ignore
const env: { [key: string]: string } = (typeof window === 'object' && window)
  || (typeof process === 'object' && process && process.env)
  || {};

const baseUrl = env.API_BASE_URL || `https://ecomplus.io/v2/:${env.API_STORE_ID}/`;

const list = async (resource: string, options: {
  params?: Record<string, string | number>,
  headers?: Record<string, string>,
} = {}) => {
  const { params, headers } = options;
  let url = `${baseUrl}${resource}`;
  if (params) {
    if (typeof params === 'string') {
      url += `?${params}`;
    } else {
      // https://github.com/microsoft/TypeScript/issues/32951
      url += `?${new URLSearchParams(params as Record<string, string>)}`;
    }
  }
  return fetch(url, { headers }).then((res) => res.json());
};

export default { list };

export { list };
