/// <reference types="./src/vue-globals" />

type DocCleanupFields = 'body_html'
  | 'body_text'
  | 'meta_title'
  | 'meta_description'
  | 'i18n'
  | 'metafields'
  | 'hidden_metafields';

interface Window {
  firebaseConfig: {
    apiKey: string,
    authDomain: string,
    projectId: string,
    storageBucket: string,
    messagingSenderId: string,
    appId: string,
    measurementId?: string,
  };
  ECOM_STORE_ID: number;
  ECOM_LANG: string;
  ECOM_CURRENCY: string;
  ECOM_CURRENCY_SYMBOL: string;
  ECOM_COUNTRY_CODE: string;
  storefront?: {
    settings: import('./src/lib/content').SettingsContent,
    context?: {
      resource: 'products',
      doc: Omit<import('@cloudcommerce/api/types').ProductSet, DocCleanupFields>,
      timestamp: number,
    } | {
      resource: 'categories',
      doc: Omit<import('@cloudcommerce/api/types').CategorySet, DocCleanupFields>,
      timestamp: number,
    } | {
      resource: 'brands',
      doc: Omit<import('@cloudcommerce/api/types').BrandSet, DocCleanupFields>,
      timestamp: number,
    } | {
      resource: 'collections',
      doc: Omit<import('@cloudcommerce/api/types').CollectionSet, DocCleanupFields>,
      timestamp: number,
    },
    modulesInfoPreset?: Partial<typeof import('./src/lib/state/modules-info').default>,
  };
  isCMSPreview?: boolean;
}
