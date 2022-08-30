import axios, { AxiosRequestConfig } from 'axios';

export default (
  url: string,
  body: Record<string, any>,
  token = process.env.TINY_ERP_TOKEN,
  options: AxiosRequestConfig = {},
) => {
  // https://www.tiny.com.br/ajuda/api/api2
  let data = `token=${token}&formato=JSON`;
  if (body) {
    Object.keys(body).forEach((field) => {
      if (body[field]) {
        switch (typeof body[field]) {
          case 'object':
            data += `&${field}=${JSON.stringify(body[field])}`;
            break;
          case 'string':
          case 'number':
            data += `&${field}=${body[field]}`;
            break;
          default:
        }
      }
    });
  }

  return axios.post(url, data, {
    baseURL: 'https://api.tiny.com.br/api2/',
    timeout: 30000,
    ...options,
  })
    .then((response) => {
      const { retorno } = response.data;
      if (retorno.status === 'Erro') {
        const err: any = new Error('Tiny error response');
        const tinyErrorCode = parseInt(retorno.codigo_erro, 10);
        if (tinyErrorCode <= 2) {
          response.status = 401;
        } else if (tinyErrorCode === 6) {
          response.status = 503;
        } else if (tinyErrorCode === 20) {
          response.status = 404;
        }
        err.response = response;
        err.config = response.config;
        err.request = response.request;
        throw err;
      }
      return retorno;
    });
};
