import axios from 'axios';

// https://developer.bling.com.br/referencia
export const BLING_API_BASE_URL = 'https://api.bling.com.br/Api/v3';

export default (
  accessToken?: string,
  clientId?: string,
  clientSecret?: string,
) => {
  let headers: Record<string, string> = {};
  if (accessToken) {
    headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    };
  } else if (clientId && clientSecret) {
    headers = {
      'Accept': '1.0',
      'enable-jwt': '1',
      'Authorization': 'Basic '
        + Buffer.from(`${clientId}:${clientSecret}`, 'utf8').toString('base64'),
    };
  }
  return axios.create({
    baseURL: BLING_API_BASE_URL,
    headers,
    timeout: accessToken ? 10000 : 30000,
  });
};
