import type { SettingsContent } from '@cloudcommerce/types';
import Deepmerge from '@fastify/deepmerge';
import {
  DEFAULT_LANG,
  DEFAULT_CURRENCY,
  DEFAULT_CURRENCY_SYMBOL,
  DEFAULT_COUNTRY_CODE,
} from './defaults';

type BaseConfig = {
  lang: string,
  currency: string,
  currencySymbol: string,
  countryCode: string,
  storeId: number,
  settingsContent?: SettingsContent,
};

const _env = (
  (typeof process === 'object' && process?.env)
  || globalThis
) as Record<string, any>;

const deepmerge = Deepmerge();

const self = globalThis.__cloudCommerce || {
  config: {},
};
globalThis.__cloudCommerce = self;
_env.ECOM_LANG = _env.ECOM_LANG || DEFAULT_LANG;
_env.ECOM_CURRENCY = _env.ECOM_CURRENCY || DEFAULT_CURRENCY;
_env.ECOM_CURRENCY_SYMBOL = _env.ECOM_CURRENCY_SYMBOL || DEFAULT_CURRENCY_SYMBOL;
_env.ECOM_COUNTRY_CODE = _env.ECOM_COUNTRY_CODE || DEFAULT_COUNTRY_CODE;

export default {
  get(): BaseConfig {
    return {
      lang: _env.ECOM_LANG,
      currency: _env.ECOM_CURRENCY,
      currencySymbol: _env.ECOM_CURRENCY_SYMBOL,
      countryCode: _env.ECOM_COUNTRY_CODE,
      storeId: Number(_env.ECOM_STORE_ID),
      ...self.config,
    };
  },
  set(config: Partial<BaseConfig>) {
    const { settingsContent } = config;
    if (settingsContent) {
      config.lang = config.lang || settingsContent.lang;
      config.currency = config.currency || settingsContent.currency;
      config.currencySymbol = config.currencySymbol || settingsContent.currencySymbol;
      config.countryCode = config.countryCode || settingsContent.countryCode;
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
