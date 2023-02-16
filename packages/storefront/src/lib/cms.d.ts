import type { CmsSettings as _CmsSettings } from '@cloudcommerce/types';

type CmsSettings = _CmsSettings &
  Omit<typeof import('content/settings.json'), keyof _CmsSettings>;
type CmsCode = typeof import('content/code.json');
type CmsMetatags = typeof import('content/metatags.json');
type CmsHeader = typeof import('content/header.json');

type CMS = <T extends string>(filename: T) =>
  T extends `${string}/` ? Promise<Array<string>> :
  T extends 'settings' ? CmsSettings :
  T extends 'code' ? Promise<CmsCode | null> :
  T extends 'metatags' ? Promise<CmsMetatags | null> :
  T extends 'header' ? Promise<CmsHeader | null> :
  Promise<Record<string, any> | null>;

export default CMS;

export type {
  CMS,
  CmsSettings,
  CmsCode,
  CmsMetatags,
  CmsHeader,
};
