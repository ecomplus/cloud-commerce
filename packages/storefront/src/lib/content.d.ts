import type { SettingsContent as _SettingsContent } from '@cloudcommerce/types';

export type SettingsContent = _SettingsContent &
  Omit<typeof import('content/settings.json'), Exclude<keyof _SettingsContent, 'metafields'>>;

type _LayoutContent = typeof import('content/layout.json');

export type LayoutContent = Omit<_LayoutContent, 'header' | 'footer'> & {
  header: Record<string, unknown> & _LayoutContent['header'],
  footer: Record<string, unknown> & Partial<_LayoutContent['footer']>,
};

export interface PageContent {
  meta_title?: string;
  meta_description?: string;
  hero?: {
    [k: string]: unknown,
    autoplay?: number,
    slides: Array<{
      [k: string]: unknown,
      startsAt?: string,
      endsAt?: string,
      img: string,
      alt?: string,
      mobileImg?: string,
      href?: string,
      title?: string,
      subtitle?: string
      buttonLink?: string,
      buttonText?: string,
    }>,
  };
  sections: Array<Record<string, any> & {
    type: string,
  }>;
  title?: string;
  date?: string;
  thumbnail?: string;
  author?: string;
  description?: string;
  markdown?: string;
}

export type ContentFilename = 'settings'
  | 'layout'
  | `${string}/`
  | `${string}/${string}`;

export type ContentData<T extends ContentFilename> =
  T extends `${string}/` ? Array<string> :
  T extends 'settings' ? SettingsContent :
  T extends 'layout' ? LayoutContent :
  T extends `${string}/${string}` ? PageContent | null :
  null;

export type ContentGetter = <T extends ContentFilename>(filename: T) =>
  T extends 'settings' ? ContentData<T> :
  Promise<ContentData<T>>;
