import type { ApiEventName, SettingsContent } from '@cloudcommerce/types';
import { join as joinPath } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import * as dotenv from 'dotenv';
import config, { BaseConfig } from '@cloudcommerce/config';

if (
  !process.env.DEPLOY_REGION
  && !process.env.DEPLOY_REGION
  && !process.env.ECOM_STORE_ID
) {
  const pwd = process.cwd();
  dotenv.config();
  dotenv.config({ path: joinPath(pwd, 'functions/.env') });
}

const tinyErpEvents: ApiEventName[] = [
  'orders-anyStatusSet',
  'products-new',
  'products-priceSet',
  'applications-dataSet',
];
const emailsEvents: ApiEventName[] = [
  'orders-new',
  'orders-anyStatusSet',
];
const galaxPayEvents: ApiEventName[] = [
  'orders-cancelled',
];
const loyaltyPointsEvents: ApiEventName[] = [
  'orders-new',
  'orders-anyStatusSet',
];
const frenetEvents: ApiEventName[] = [
  'orders-new',
];
const fbConversionsEvents: ApiEventName[] = [
  'orders-new',
  'carts-customerSet',
];
const googleAnalyticsEvents: ApiEventName[] = [
  'orders-anyStatusSet',
];
const melhorEnvioEvents: ApiEventName[] = [
  'orders-anyStatusSet',
];
const webhooksAppEvents: ApiEventName[] = [
  'applications-dataSet',
  'orders-anyStatusSet',
  'carts-delayed',
];

const affiliateProgramEvents: ApiEventName[] = [
  'orders-anyStatusSet',
  'customers-new',
];

const pagarMeV5Events: ApiEventName[] = [
  'orders-cancelled',
  'products-priceSet',
  'products-quantitySet',
];

const {
  SETTINGS_FILEPATH,
  DEPLOY_REGION,
  DEPLOY_MEMORY,
  SSR_DEPLOY_REGION,
  SSR_DEPLOY_MEMORY,
  SSR_DEPLOY_TIMEOUT_SECONDS,
  SSR_DEPLOY_MIN_INSTANCES,
  MODULES_DEPLOY_MEMORY,
  API_EVENTS_DELAYED_MS,
} = process.env;

let settingsContentFile = SETTINGS_FILEPATH && existsSync(SETTINGS_FILEPATH)
  ? SETTINGS_FILEPATH
  : joinPath(process.cwd(), 'content/settings.json');
if (!existsSync(settingsContentFile)) {
  settingsContentFile = joinPath(process.cwd(), 'functions/ssr/content/settings.json');
}
const settingsContent: SettingsContent = JSON.parse(readFileSync(settingsContentFile, 'utf-8'));

const disabledEvents: ApiEventName[] = [];
const mergeConfig = {
  hello: 'from @cloudcommerce/firebase',
  httpsFunctionOptions: {
    region: DEPLOY_REGION || 'us-east4',
    memory: (DEPLOY_MEMORY as '128MB' | '256MB' | '512MB' | '1GB' | '2GB') || '256MB',
  },
  ssrFunctionOptions: {
    region: SSR_DEPLOY_REGION || DEPLOY_REGION || 'us-east4',
    memory: (SSR_DEPLOY_MEMORY as '256MiB' | '512MiB' | '1GiB' | '2GiB' | '4GiB') || '1GiB',
    timeoutSeconds: SSR_DEPLOY_TIMEOUT_SECONDS ? Number(SSR_DEPLOY_TIMEOUT_SECONDS) : 10,
    minInstances: SSR_DEPLOY_MIN_INSTANCES ? Number(SSR_DEPLOY_MIN_INSTANCES) : 0,
  },
  modulesFunctionOptions: {
    memory: (MODULES_DEPLOY_MEMORY as '256MiB' | '512MiB' | '1GiB' | '2GiB') || '512MiB',
  },
  apiEvents: {
    delayedMs: API_EVENTS_DELAYED_MS
      ? parseInt(API_EVENTS_DELAYED_MS, 10)
      : 1000 * 60 * 5,
    disabledEvents,
  },
  apps: {
    discounts: {
      appId: 1252,
    },
    correios: {
      appId: 126334,
    },
    customShipping: {
      appId: 1253,
    },
    frenet: {
      appId: 1244,
      events: frenetEvents,
    },
    tinyErp: {
      appId: 105922,
      events: tinyErpEvents,
    },
    mercadoPago: {
      appId: 111223,
    },
    emails: {
      appId: 1243,
      events: emailsEvents,
    },
    pagarMe: {
      appId: 117391,
    },
    pix: {
      appId: 101827,
    },
    jadlog: {
      appId: 115229,
    },
    galaxPay: {
      appId: 123188,
      events: galaxPayEvents,
    },
    customPayment: {
      appId: 108091,
    },
    loyaltyPoints: {
      appId: 124890,
      events: loyaltyPointsEvents,
    },
    fbConversions: {
      appId: 131670,
      events: fbConversionsEvents,
    },
    datafrete: {
      appId: 123886,
    },
    googleAnalytics: {
      appId: 122241,
      events: googleAnalyticsEvents,
    },
    pagHiper: {
      appId: 1251,
    },
    melhorEnvio: {
      appId: 1236,
      events: melhorEnvioEvents,
    },
    webhooksApp: {
      appId: 123113,
      events: webhooksAppEvents,
    },
    affiliateProgram: {
      appId: 119753,
      events: affiliateProgramEvents,
    },
    flashCourier: {
      appId: 104136,
    },
    mandae: {
      appId: 124677,
    },
    pagarMeV5: {
      appId: 112381,
      events: pagarMeV5Events,
    },
  },
  settingsContent,
  metafields: {},
};
config.set(mergeConfig);

export default config as {
  get(): BaseConfig & typeof mergeConfig & { metafields: Record<string, any> };
  // eslint-disable-next-line
  set(config: any): void;
};
