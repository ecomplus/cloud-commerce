import type { ApiEventName } from '@cloudcommerce/types';
import config, { BaseConfig } from '@cloudcommerce/config';

const tinyErpEvents: ApiEventName[] = [
  'orders-anyStatusSet',
  'products-new',
  'products-priceSet',
  'applications-dataSet',
];

const sendGridEvents: ApiEventName[] = [
  'orders-new',
  'orders-anyStatusSet',
  'carts-new'
];

const {
  DEPLOY_REGION,
  SSR_DEPLOY_REGION,
  SSR_DEPLOY_MEMORY,
  SSR_DEPLOY_TIMEOUT_SECONDS,
  SSR_DEPLOY_MIN_INSTANCES,
} = process.env;

const mergeConfig = {
  hello: 'from @cloudcommerce/firebase',
  httpsFunctionOptions: {
    region: DEPLOY_REGION || 'southamerica-east1',
  },
  ssrFunctionOptions: {
    region: SSR_DEPLOY_REGION || 'us-central1',
    memory: (SSR_DEPLOY_MEMORY as '128MiB' | '256MiB' | '512MiB' | '1GiB') || '256MiB',
    timeoutSeconds: SSR_DEPLOY_TIMEOUT_SECONDS ? Number(SSR_DEPLOY_TIMEOUT_SECONDS) : 15,
    minInstances: SSR_DEPLOY_MIN_INSTANCES ? Number(SSR_DEPLOY_MIN_INSTANCES) : 1,
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
    sendGrid : {
      appId: 129856,
      events: sendGridEvents
    }
  },
};
config.set(mergeConfig);

export default config as {
  get(): BaseConfig & typeof mergeConfig;
  // eslint-disable-next-line
  set(config: any): void;
};
