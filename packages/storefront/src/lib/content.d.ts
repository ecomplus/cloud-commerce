import type { SettingsContent as _SettingsContent } from '@cloudcommerce/types';

export type SettingsContent = _SettingsContent &
  Omit<typeof import('content/settings.json'), Exclude<keyof _SettingsContent, 'metafields'>>;

export type LayoutContent = typeof import('content/layout.json');

export type HomeContent = typeof import('content/home.json');

export type ContentFilenames = 'settings'
  | 'layout'
  | 'home'
  | `${string}/`
  | `${string}/${string}`;

export type CMS = <T extends ContentFilenames>(filename: T) =>
  T extends `${string}/` ? Promise<Array<string>> :
  T extends 'settings' ? SettingsContent :
  T extends 'layout' ? Promise<LayoutContent> :
  T extends 'home' ? Promise<HomeContent> :
  Promise<Record<string, any> | null>;
