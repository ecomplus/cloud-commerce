import axios, { AxiosRequestConfig } from 'axios';

export default (
  url: string,
  body: Record<string, any>,
  token = process.env.TINYERP_TOKEN,
  options: Partial<AxiosRequestConfig> = {},
) => {
  // https://www.tiny.com.br/ajuda/api/api2
  const formData = new FormData();
  formData.append('token', token || '');
  formData.append('formato', 'JSON');
  if (body) {
    Object.keys(body).forEach((field) => {
      if (body[field]) {
        switch (typeof body[field]) {
          case 'object':
            formData.append(field, JSON.stringify(body[field]));
            break;
          case 'string':
          case 'number':
            formData.append(field, `${body[field]}`);
            break;
          default:
        }
      }
    });
  }

  return axios.post(url, formData, {
    baseURL: 'https://api.tiny.com.br/api2/',
    timeout: 30000,
    ...options,
  })
    .then((response) => {
      const { retorno } = response.data;
      if (retorno.status === 'Erro') {
        const tinyErrorCode = parseInt(retorno.codigo_erro, 10);
        if (tinyErrorCode <= 2) {
          response.status = 401;
        } else if (tinyErrorCode === 6) {
          response.status = 503;
        } else if (tinyErrorCode === 20) {
          response.status = 404;
        }
        const err: any = new Error(`Tiny error ${tinyErrorCode} at ${response.config.url}`);
        err.response = response;
        err.config = response.config;
        err.request = response.request;
        throw err;
      }
      return retorno;
    });
};
