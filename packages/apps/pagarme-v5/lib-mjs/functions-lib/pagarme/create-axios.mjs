import axios from 'axios';

export default (apiSecretKey) => {
  return axios.create({
    baseURL: 'https://api.pagar.me/core/v5',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: 'Basic ' + Buffer.from(`${apiSecretKey}:`).toString('base64'),
    },
  });
};
