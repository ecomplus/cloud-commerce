/// <reference types="./src/vue-globals" />
/// <reference types="gtag.js" />

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
  $reCaptchaSiteKey?: string;
  ECOM_STORE_ID: number;
  ECOM_LANG: string;
  ECOM_CURRENCY: string;
  ECOM_CURRENCY_SYMBOL: string;
  ECOM_COUNTRY_CODE: string;
  OAUTH_PROVIDERS?: Array<'google'>;
  GIT_BRANCH: string;
  GIT_REPO?: string;
  AB_EXPERIMENT_ID?: string;
  GTAG_TAG_ID?: string;
  GA_TRACKING_ID?: string;
  GOOGLE_ADS_ID?: string;
  CMS_CUSTOM_CONFIG?: Record<string, any>;
  CMS_SSO_URL?: string | null;
  CMS_REPO_BASE_DIR?: string;
  CMS_LANG?: string;
  CMS_MAX_FILE_SIZE?: number;
  CMS?: Record<string, any>;
  $storefront?: import('@@sf/$storefront').$Storefront & {
    modulesInfoPreset?: Partial<typeof import('./src/lib/state/modules-info').default>,
  };
  $firstInteraction?: Promise<void>;
  $prefetch?: typeof import('astro:prefetch').prefetch;
  $isCmsPreview?: boolean;
}

declare module 'gtag.js';
