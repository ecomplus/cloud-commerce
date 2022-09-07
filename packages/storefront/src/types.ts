import type { BaseConfig } from '@cloudcommerce/config';
import settings from '../content/settings.json';

type CmsSettings = typeof settings;

type StorefrontConfig = {
  storeId: BaseConfig['storeId'],
  lang: BaseConfig['lang'],
  domain: CmsSettings['domain'],
  primaryColor: CmsSettings['primary_color'],
  secondaryColor: CmsSettings['secondary_color'],
  settings: CmsSettings,
};

export type {
  StorefrontConfig,
  CmsSettings,
};
