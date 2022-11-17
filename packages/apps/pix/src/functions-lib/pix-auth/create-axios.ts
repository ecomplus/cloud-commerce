import * as https from 'https';
import axios from 'axios';

export default ({
  pfx,
  tokenData,
  baseURL = 'https://api-pix.gerencianet.com.br',
}) => {
  const httpsAgent = new https.Agent({
    pfx,
    passphrase: '',
  });
  const headers = {
    'Content-Type': 'application/json',
  };
  if (tokenData) {
    const Authorization = typeof tokenData === 'string'
      ? tokenData
      : `${tokenData.token_type} ${tokenData.access_token}`;

    Object.assign(headers, { Authorization });
  }
  return axios.create({ baseURL, headers, httpsAgent });
};
