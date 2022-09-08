import type { BaseConfig } from '@cloudcommerce/config';
import getConfig from '../storefront.config.mjs';
import settings from '../content/settings.json';

type CmsSettings = typeof settings;

type StorefrontConfig = {
  storeId: BaseConfig['storeId'],
  lang: BaseConfig['lang'],
  countryCode: BaseConfig['countryCode'],
  currency: BaseConfig['currency'],
  currencySymbol: BaseConfig['currencySymbol'],
  domain: CmsSettings['domain'],
  primaryColor: CmsSettings['primary_color'],
  secondaryColor: CmsSettings['secondary_color'],
  settings: CmsSettings,
  // eslint-disable-next-line no-unused-vars
  cms: (filename: string) => Record<string, any> | Array<string>,
};

export default getConfig as () => StorefrontConfig;

export type {
  StorefrontConfig,
  CmsSettings,
};
