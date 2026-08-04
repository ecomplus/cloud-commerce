import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import createAccess from './create-access';

// https://developer.bling.com.br/limites#filtros
const TIME_FORCE_REFRESH = 18000 * 1000;

const delay = (timeout: number) => new Promise((resolve) => {
  setTimeout(() => resolve(true), timeout);
});

class Bling {
  clientId: string;

  clientSecret: string;

  private _bling: AxiosInstance | null;

  private lastRequest: Date | null;

  constructor(clientId: string, clientSecret: string) {
    if (!clientId || !clientSecret) {
      const err: any = new Error('Missing Bling clientId or clientSecret');
      err.isConfigError = true;
      throw err;
    }
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this._bling = null;
    this.lastRequest = null;
  }

  // Bling allows up to 3 requests/s, keeping 1 request/s to be safe
  private async checkTime() {
    const now = new Date();
    if (!this.lastRequest) {
      this.lastRequest = now;
      return true;
    }
    const timeout = now.getTime() - this.lastRequest.getTime();
    if (timeout >= 1000) {
      this.lastRequest = new Date();
      return true;
    }
    await delay(1000 - timeout);
    this.lastRequest = new Date();
    return true;
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
  ): Promise<any> {
    await this.checkTime();
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
