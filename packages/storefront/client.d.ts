/// <reference types="./src/vue-globals" />

interface Window {
  firebaseConfig?: {
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
    settings: import('./src/lib/types/cms-settings').default,
    context?: {
      resource: string,
      doc: Record<string, any>,
      timestamp: number,
    },
    modulesInfoPreset?: Partial<typeof import('./src/lib/state/modules-info').default>,
  };
}
