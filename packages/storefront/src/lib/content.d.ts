import type { SettingsContent as _SettingsContent } from '@cloudcommerce/types';

export type SettingsContent = _SettingsContent &
  Omit<typeof import('content/settings.json'), Exclude<keyof _SettingsContent, 'metafields'>>;

export type LayoutContent = typeof import('content/layout.json');

export type HomeContent = typeof import('content/home.json');

export type ContentFilename = 'settings'
  | 'layout'
  | 'home'
  | `${string}/`
  | `${string}/${string}`;

export type ContentData<T extends ContentFilename> =
  T extends `${string}/` ? Array<string> :
  T extends 'settings' ? SettingsContent :
  T extends 'layout' ? LayoutContent :
  T extends 'home' ? HomeContent :
  Record<string, any> | null;

export type ContentGetter = <T extends ContentFilename>(filename: T) =>
  T extends 'settings' ? ContentData<T> :
  Promise<ContentData<T>>;
