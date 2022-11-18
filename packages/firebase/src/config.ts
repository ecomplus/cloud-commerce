import type { ApiEventName, CmsSettings } from '@cloudcommerce/types';
import { join as joinPath } from 'path';
import { readFileSync } from 'fs';
import config, { BaseConfig } from '@cloudcommerce/config';

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

const {
  DEPLOY_REGION,
  SSR_DEPLOY_REGION,
  SSR_DEPLOY_MEMORY,
  SSR_DEPLOY_TIMEOUT_SECONDS,
  SSR_DEPLOY_MIN_INSTANCES,
} = process.env;

const cmsSettingsFile = joinPath(process.cwd(), 'content/settings.json');
const cmsSettings: CmsSettings = JSON.parse(readFileSync(cmsSettingsFile, 'utf-8'));

const mergeConfig = {
  hello: 'from @cloudcommerce/firebase',
  httpsFunctionOptions: {
    region: DEPLOY_REGION || 'southamerica-east1',
  },
  ssrFunctionOptions: {
    region: SSR_DEPLOY_REGION || 'us-central1',
    memory: (SSR_DEPLOY_MEMORY as '128MiB' | '256MiB' | '512MiB' | '1GiB') || '512MiB',
    timeoutSeconds: SSR_DEPLOY_TIMEOUT_SECONDS ? Number(SSR_DEPLOY_TIMEOUT_SECONDS) : 10,
    minInstances: SSR_DEPLOY_MIN_INSTANCES ? Number(SSR_DEPLOY_MIN_INSTANCES) : 0,
  },
  apps: {
    discounts: {
      appId: 1252,
    },
    correios: {
      appId: 1248,
    },
    customShipping: {
      appId: 1253,
    },
    frenet: {
      appId: 1244,
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
    pix: {
      appId: 101827,
    },
  },
  cmsSettings,
};
config.set(mergeConfig);

export default config as {
  get(): BaseConfig & typeof mergeConfig;
  // eslint-disable-next-line
  set(config: any): void;
};
