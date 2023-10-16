import fs from 'node:fs';
import { join as joinPath, resolve as resolvePath } from 'node:path';
import config from '@cloudcommerce/config';
import './storefront.cms.js';

export default () => {
  const {
    ECOM_STORE_ID,
    VITE_ECOM_STORE_ID,
    PROD,
  } = import.meta.env || process.env;
  if (VITE_ECOM_STORE_ID) {
    config.set({ storeId: Number(VITE_ECOM_STORE_ID) });
  } else if (ECOM_STORE_ID) {
    config.set({ storeId: Number(ECOM_STORE_ID) });
  }

  const {
    domain,
    primaryColor,
    secondaryColor,
    settings,
    getContent,
  } = global.__storefrontCMS(fs, resolvePath);
  config.set({ settingsContent: settings });

  let { storeId } = config.get();
  if (!storeId) {
    const configFilepath = joinPath(process.cwd(), 'config.json');
    try {
      const mergeConfig = JSON.parse(fs.readFileSync(configFilepath), 'utf8');
      if (mergeConfig.storeId) {
        storeId = mergeConfig.storeId;
      }
    } catch {
      //
    }
    if (!storeId && !PROD) {
      storeId = 1011;
      console.warn('> `storeId` is not set, using fallback 1011 for dev only\n');
    }
    if (storeId) {
      config.set({ storeId });
    }
  }
  const {
    lang,
    countryCode,
    currency,
    currencySymbol,
  } = config.get();

  if (!settings.assetsPrefix && storeId === 1011 && domain === 'demo.ecomplus.app') {
    settings.assetsPrefix = 'https://s2-demo.b-cdn.net';
  }

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
    getContent,
  };
};
