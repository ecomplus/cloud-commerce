import config from '@cloudcommerce/config';
import getCMS from './config/storefront.cms.mjs';

export default () => {
  const { VITE_ECOM_STORE_ID } = import.meta.env || process.env;
  if (VITE_ECOM_STORE_ID) {
    config.set({ storeId: Number(VITE_ECOM_STORE_ID) });
  }

  const {
    storeId,
    lang,
    countryCode,
    currency,
    currencySymbol,
  } = config.get();

  const {
    domain,
    primaryColor,
    secondaryColor,
    settings,
    cms,
  } = getCMS();
  config.set({ cmsSettings: settings });

  return {
    storeId,
    lang,
    countryCode,
    currency,
    currencySymbol,
    domain,
    primaryColor,
    secondaryColor,
    settings,
    cms,
  };
};
