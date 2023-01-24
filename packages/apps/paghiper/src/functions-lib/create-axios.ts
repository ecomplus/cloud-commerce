// Axios HTTP client
import axios from 'axios';

// returns a reusable axios instance for PagHiper API
export default (isPix?: boolean) => axios.create({
  // https://github.com/axios/axios#creating-an-instance
  baseURL: isPix ? 'https://pix.paghiper.com/'
    : 'https://api.paghiper.com/',
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    Accept: 'application/json',
    'Accept-Charset': 'UTF-8',
    'Accept-Encoding': 'application/json',
  },
  // wait up to 30s
  timeout: 30000,
  validateStatus(status) {
    // success only when received 201
    return status === 201;
  },
});
