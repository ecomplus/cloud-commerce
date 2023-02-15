import type { CmsSettings as _CmsSettings } from '@cloudcommerce/types';

type CmsSettings = _CmsSettings &
  Omit<typeof import('content/settings.json'), keyof _CmsSettings>;
type CmsCode = typeof import('content/code.json');
type CmsHeader = typeof import('content/header.json');

type CMS = <T extends string>(filename: T) =>
  T extends `${string}/` ? Promise<Array<string>> | Array<string> :
  T extends 'settings' ? CmsSettings :
  T extends 'code' ? Promise<CmsCode> :
  T extends 'header' ? Promise<CmsHeader> :
  Promise<Record<string, any>>;

export default CMS;

export type {
  CMS,
  CmsSettings,
  CmsCode,
  CmsHeader,
};
