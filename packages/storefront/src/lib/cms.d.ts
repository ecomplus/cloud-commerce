import type { CmsSettings as _CmsSettings } from '@cloudcommerce/types';

export type CmsSettings = _CmsSettings &
  Omit<typeof import('content/settings.json'), keyof _CmsSettings>;

export type CmsLayout = typeof import('content/layout.json');

export type CmsHome = typeof import('content/home.json');

export type ContentFilenames = 'settings'
  | 'layout'
  | 'home'
  | `${string}/`
  | `${string}/${string}`;

export type CMS = <T extends ContentFilenames>(filename: T) =>
  T extends `${string}/` ? Promise<Array<string>> :
  T extends 'settings' ? CmsSettings :
  T extends 'layout' ? Promise<CmsLayout> :
  T extends 'home' ? Promise<CmsHome> :
  Promise<Record<string, any> | null>;
