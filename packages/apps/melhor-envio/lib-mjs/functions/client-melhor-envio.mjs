import axios from 'axios';

export default (accessToken, isSandbox) => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };

  return axios.create({
    baseURL: `https://${isSandbox ? 'sandbox.' : ''}melhorenvio.com.br/api/v2/me`,
    headers,
  });
};
