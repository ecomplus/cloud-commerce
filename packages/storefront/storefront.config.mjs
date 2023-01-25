import { readFileSync } from 'node:fs';
import { join as joinPath } from 'node:path';
import config from '@cloudcommerce/config';
import getCMS from './config/storefront.cms.mjs';

export default () => {
  const { VITE_ECOM_STORE_ID } = import.meta.env || process.env;
  if (VITE_ECOM_STORE_ID) {
    config.set({ storeId: Number(VITE_ECOM_STORE_ID) });
  }

  const {
    domain,
    primaryColor,
    secondaryColor,
    settings,
    cms,
  } = getCMS();
  config.set({ cmsSettings: settings });

  let { storeId } = config.get();
  if (!storeId) {
    const configFilepath = joinPath(process.cwd(), 'config.json');
    try {
      const mergeConfig = JSON.parse(readFileSync(configFilepath), 'utf8');
      if (mergeConfig.storeId) {
        storeId = mergeConfig.storeId;
        config.set({ storeId });
      }
    } catch { /* */ }
  }
  const {
    lang,
    countryCode,
    currency,
    currencySymbol,
  } = config.get();

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
