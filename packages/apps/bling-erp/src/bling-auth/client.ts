import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import createAccess from './create-access';

// https://developer.bling.com.br/limites#filtros
const TIME_FORCE_REFRESH = 18000 * 1000;

const delay = (timeout: number) => new Promise((resolve) => {
  setTimeout(() => resolve(true), timeout);
});

/*
Bling allows up to 3 requests/s, keeping 1 request/s to be safe. O controle é
de módulo, não de instância: `createBlingClient` é chamado dentro de cada
handler, então um campo de instância nunca espaçaria nada; e cada chamada
concorrente reserva o próximo slot, para `Promise.all` não disparar junto.
*/
let nextRequestAt = 0;
const throttleRequest = async () => {
  const now = Date.now();
  const wait = Math.max(0, nextRequestAt - now);
  nextRequestAt = Math.max(now, nextRequestAt) + 1000;
  if (wait > 0) await delay(wait);
};

class Bling {
  clientId: string;

  clientSecret: string;

  private _bling: AxiosInstance | null;

  constructor(clientId: string, clientSecret: string) {
    if (!clientId || !clientSecret) {
      const err: any = new Error('Missing Bling clientId or clientSecret');
      err.isConfigError = true;
      throw err;
    }
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this._bling = null;
  }

  private async axios() {
    if (!this._bling) {
      this._bling = await createAccess(this.clientId, this.clientSecret);
    }
    return this._bling;
  }

  private async request(
    method: 'get' | 'post' | 'patch' | 'put' | 'delete',
    url: string,
    data?: any,
    opts?: AxiosRequestConfig,
  ): Promise<AxiosResponse> {
    await throttleRequest();
    const bling = await this.axios();
    const send = (instance: AxiosInstance) => {
      switch (method) {
        case 'get':
          return instance.get(url, opts);
        case 'delete':
          return instance.delete(url, opts);
        default:
          return instance[method](url, data, opts);
      }
    };
    try {
      return await send(bling);
    } catch (err: any) {
      if (err.response?.data?.error?.type === 'TOO_MANY_REQUESTS') {
        const isDailyRateLimitError = Boolean(
          err.response.data.error?.description?.includes('diário'),
        );
        if (!isDailyRateLimitError) {
          await delay(1000);
          return send(bling);
        }
        this._bling = await createAccess(
          this.clientId,
          this.clientSecret,
          TIME_FORCE_REFRESH,
          isDailyRateLimitError,
        );
        return send(this._bling);
      }
      throw err;
    }
  }

  get(url: string, opts?: AxiosRequestConfig) {
    return this.request('get', url, undefined, opts);
  }

  post(url: string, data?: any, opts?: AxiosRequestConfig) {
    return this.request('post', url, data, opts);
  }

  patch(url: string, data?: any, opts?: AxiosRequestConfig) {
    return this.request('patch', url, data, opts);
  }

  put(url: string, data?: any, opts?: AxiosRequestConfig) {
    return this.request('put', url, data, opts);
  }

  delete(url: string, opts?: AxiosRequestConfig) {
    return this.request('delete', url, undefined, opts);
  }
}

export const createBlingClient = (appData: Record<string, any>) => {
  return new Bling(appData.client_id, appData.client_secret);
};

export default Bling;
