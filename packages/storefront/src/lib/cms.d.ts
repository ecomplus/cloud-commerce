import type { SettingsContent as _SettingsContent } from '@cloudcommerce/types';

export type SettingsContent = _SettingsContent &
  Omit<typeof import('content/settings.json'), keyof _SettingsContent>;

export type CmsLayout = typeof import('content/layout.json');

export type CmsHome = typeof import('content/home.json');

export type ContentFilenames = 'settings'
  | 'layout'
  | 'home'
  | `${string}/`
  | `${string}/${string}`;

export type CMS = <T extends ContentFilenames>(filename: T) =>
  T extends `${string}/` ? Promise<Array<string>> :
  T extends 'settings' ? SettingsContent :
  T extends 'layout' ? Promise<CmsLayout> :
  T extends 'home' ? Promise<CmsHome> :
  Promise<Record<string, any> | null>;
