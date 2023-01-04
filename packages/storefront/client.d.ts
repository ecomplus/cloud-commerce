/* eslint-disable */
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
  storefront?: {
    settings: typeof import('./content/settings.json') & {
      store_id: number,
      lang: string,
      country_code: string,
      currency: string,
      currency_symbol: string,
    },
    context?: {
      resource: string,
      doc: Record<string, any>,
      timestamp: number,
    },
    modulesInfoPreset?: Partial<typeof import('./src/lib/state/modules-info').default>,
  };
}
