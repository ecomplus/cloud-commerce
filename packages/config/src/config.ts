import type { CmsSettings } from '@cloudcommerce/types';
import Deepmerge from '@fastify/deepmerge';
import {
  DEFAULT_LANG,
  DEFAULT_CURRENCY,
  DEFAULT_CURRENCY_SYMBOL,
  DEFAULT_COUNTRY_CODE,
  DEV_FALLBACK_STORE_ID,
} from './defaults';

type BaseConfig = {
  lang: string,
  currency: string,
  currencySymbol: string,
  countryCode: string,
  storeId: number,
  cmsSettings?: CmsSettings,
};

// @ts-ignore
const _env: Record<string, any> = import.meta.env
  || (typeof process === 'object' && process?.env)
  || globalThis;

const deepmerge = Deepmerge();

const self = globalThis.__cloudCommerce || {
  config: {},
};
globalThis.__cloudCommerce = self;
_env.ECOM_LANG = _env.ECOM_LANG || DEFAULT_LANG;
_env.ECOM_CURRENCY = _env.ECOM_CURRENCY || DEFAULT_CURRENCY;
_env.ECOM_CURRENCY_SYMBOL = _env.ECOM_CURRENCY_SYMBOL || DEFAULT_CURRENCY_SYMBOL;
_env.ECOM_COUNTRY_CODE = _env.ECOM_COUNTRY_CODE || DEFAULT_COUNTRY_CODE;
let isNoStoreWarned = false;

export default {
  get(): BaseConfig {
    const config = {
      lang: _env.ECOM_LANG,
      currency: _env.ECOM_CURRENCY,
      currencySymbol: _env.ECOM_CURRENCY_SYMBOL,
      countryCode: _env.ECOM_COUNTRY_CODE,
      storeId: Number(_env.ECOM_STORE_ID),
      ...self.config,
    };
    if (!config.storeId && _env.DEV === true) {
      config.storeId = DEV_FALLBACK_STORE_ID;
      if (!isNoStoreWarned) {
        // eslint-disable-next-line no-console
        console.warn('[@cloudcommerce/config] `storeId` is not set, '
          + `using dev-only fallback ${DEV_FALLBACK_STORE_ID}`);
        isNoStoreWarned = true;
      }
    }
    return config;
  },
  set(config: Partial<BaseConfig>) {
    const { cmsSettings } = config;
    if (cmsSettings) {
      config.lang = config.lang || cmsSettings.lang;
      config.currency = config.currency || cmsSettings.currency;
      config.currencySymbol = config.currencySymbol || cmsSettings.currency_symbol;
      config.countryCode = config.currencySymbol || cmsSettings.country_code;
    }
    self.config = deepmerge(self.config, config);
    if (config.storeId) {
      _env.ECOM_STORE_ID = config.storeId;
    }
    _env.ECOM_LANG = _env.ECOM_LANG || self.config.lang;
    _env.ECOM_CURRENCY = _env.ECOM_CURRENCY || self.config.currency;
    _env.ECOM_CURRENCY_SYMBOL = _env.ECOM_CURRENCY_SYMBOL || self.config.currencySymbol;
    _env.ECOM_COUNTRY_CODE = _env.ECOM_COUNTRY_CODE || self.config.countryCode;
  },
};

export type { BaseConfig };
