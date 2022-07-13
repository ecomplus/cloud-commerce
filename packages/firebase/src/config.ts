import Deepmerge from '@fastify/deepmerge';
import {
  DEFAULT_LANG,
  DEFAULT_CURRENCY,
  DEFAULT_CURRENCY_SYMBOL,
  DEFAULT_COUNTRY_CODE,
} from './defaults';

const deepmerge = Deepmerge();

const self = {
  __config: {
    hello: 'from @cloudcommerce/firebase',
    lang: process.env.ECOM_LANG || DEFAULT_LANG,
    currency: process.env.ECOM_CURRENCY || DEFAULT_CURRENCY,
    currencySymbol: process.env.ECOM_CURRENCY_SYMBOL || DEFAULT_CURRENCY_SYMBOL,
    countryCode: process.env.ECOM_COUNTRY_CODE || DEFAULT_COUNTRY_CODE,
    storeId: Number(process.env.ECOM_STORE_ID),
  },
};

export default {
  get() {
    return self.__config;
  },
  set(config) {
    self.__config = deepmerge(self.__config, config);
  },
};
