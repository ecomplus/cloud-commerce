import type { ApiEventName } from '@cloudcommerce/types';
import config, { BaseConfig } from '@cloudcommerce/config';

const tinyErpEvents: ApiEventName[] = [
  'orders-anyStatusSet',
  'products-new',
  'products-priceSet',
  'applications-dataSet',
];

const {
  DEPLOY_REGION,
  DEPLOY_MEMORY,
  DEPLOY_TIMEOUT_SECONDS,
  DEPLOY_MIN_INSTANCES,
} = process.env;

const mergeConfig = {
  hello: 'from @cloudcommerce/firebase',
  httpsFunctionOptions: {
    region: DEPLOY_REGION || 'southamerica-east1',
    memory: DEPLOY_MEMORY as '128MiB' | '256MiB' | '512MiB' | '1GiB' | undefined,
    timeoutSeconds: DEPLOY_TIMEOUT_SECONDS
      ? Number(DEPLOY_TIMEOUT_SECONDS) : undefined,
    minInstances: DEPLOY_MIN_INSTANCES
      ? Number(DEPLOY_MIN_INSTANCES) : undefined,
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
  },
};
config.set(mergeConfig);

export default config as {
  get(): BaseConfig & typeof mergeConfig;
  // eslint-disable-next-line
  set(config: any): void;
};
