import Deepmerge from '@fastify/deepmerge';
import {
  DEFAULT_LANG,
  DEFAULT_CURRENCY,
  DEFAULT_CURRENCY_SYMBOL,
  DEFAULT_COUNTRY_CODE,
} from './defaults';

const _env: Record<string, any> = (typeof process === 'object' && process?.env) || globalThis;
const deepmerge = Deepmerge();

type BaseConfig = {
  lang: string,
  currency: string,
  currencySymbol: string,
  countryCode: string,
  storeId: number,
};

const self: { config: BaseConfig } = globalThis.__cloudCommerce || {
  config: {
    lang: _env.ECOM_LANG || DEFAULT_LANG,
    currency: _env.ECOM_CURRENCY || DEFAULT_CURRENCY,
    currencySymbol: _env.ECOM_CURRENCY_SYMBOL || DEFAULT_CURRENCY_SYMBOL,
    countryCode: _env.ECOM_COUNTRY_CODE || DEFAULT_COUNTRY_CODE,
    storeId: Number(_env.ECOM_STORE_ID),
  },
};
globalThis.__cloudCommerce = self;

export default {
  get() {
    return self.config;
  },
  set(config) {
    self.config = deepmerge(self.config, config);
    if (config.storeId) {
      _env.ECOM_STORE_ID = config.storeId;
    }
  },
};

export type { BaseConfig };
