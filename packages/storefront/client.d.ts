/// <reference types="./src/vue-globals" />
/// <reference types="./.auto-imports" />

type DocCleanupFields = 'body_html'
  | 'body_text'
  | 'meta_title'
  | 'meta_description'
  | 'i18n'
  | 'metafields'
  | 'hidden_metafields';

interface Window {
  $firebaseConfig: {
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
  $storefront?: import('@@sf/$storefront').$Storefront & {
    modulesInfoPreset?: Partial<typeof import('./src/lib/state/modules-info').default>,
  };
  $isCmsPreview?: boolean;
}
