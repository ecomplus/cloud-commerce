import type { ApiEventName } from '@cloudcommerce/types';
import Deepmerge from '@fastify/deepmerge';
import {
  DEFAULT_LANG,
  DEFAULT_CURRENCY,
  DEFAULT_CURRENCY_SYMBOL,
  DEFAULT_COUNTRY_CODE,
} from './defaults';

// @ts-ignore
const env: { [key: string]: string } = (typeof process === 'object' && process?.env)
  || (typeof window === 'object' && window)
  || {};

const deepmerge = Deepmerge();

const tinyErpEvents: ApiEventName[] = [
  'orders-anyStatusSet',
  'products-new',
  'products-priceSet',
  'applications-dataSet',
];

const self = {
  __config: {
    hello: 'from @cloudcommerce/firebase',
    lang: env.ECOM_LANG || DEFAULT_LANG,
    currency: env.ECOM_CURRENCY || DEFAULT_CURRENCY,
    currencySymbol: env.ECOM_CURRENCY_SYMBOL || DEFAULT_CURRENCY_SYMBOL,
    countryCode: env.ECOM_COUNTRY_CODE || DEFAULT_COUNTRY_CODE,
    storeId: Number(env.ECOM_STORE_ID),
    httpsFunctionOptions: {
      region: env.DEPLOY_REGION || 'southamerica-east1',
    },
    apps: {
      discounts: {
        appId: 1252,
      },
      tinyErp: {
        appId: 105922,
        events: tinyErpEvents,
      },
    },
  },
};

export default {
  get() {
    return self.__config;
  },
  set(config) {
    self.__config = deepmerge(self.__config, config);
    if (config.storeId) {
      env.ECOM_STORE_ID = config.storeId;
    }
  },
};
