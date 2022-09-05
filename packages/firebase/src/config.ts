import type { ApiEventName } from '@cloudcommerce/types';
import config, { BaseConfig } from '@cloudcommerce/config';

const tinyErpEvents: ApiEventName[] = [
  'orders-anyStatusSet',
  'products-new',
  'products-priceSet',
  'applications-dataSet',
];

const mergeConfig = {
  hello: 'from @cloudcommerce/firebase',
  httpsFunctionOptions: {
    region: process.env.DEPLOY_REGION || 'southamerica-east1',
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
