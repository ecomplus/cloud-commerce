import type { ApiEventName, SettingsContent } from '@cloudcommerce/types';
import { join as joinPath } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { AsyncLocalStorage } from 'node:async_hooks';
import * as dotenv from 'dotenv';
import _config, { BaseConfig } from '@cloudcommerce/config';
import _logger from 'firebase-functions/logger';

if (
  !process.env.DEPLOY_REGION
  && !process.env.DEPLOY_REGION
  && !process.env.ECOM_STORE_ID
) {
  const pwd = process.cwd();
  dotenv.config();
  dotenv.config({ path: joinPath(pwd, 'functions/.env') });
}

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
    maxInstances: 100,
  },
  ssrFunctionOptions: {
    region: SSR_DEPLOY_REGION || DEPLOY_REGION || 'us-east4',
    memory: (SSR_DEPLOY_MEMORY as '256MiB' | '512MiB' | '1GiB' | '2GiB' | '4GiB') || '1GiB',
    timeoutSeconds: SSR_DEPLOY_TIMEOUT_SECONDS ? Number(SSR_DEPLOY_TIMEOUT_SECONDS) : 10,
    minInstances: SSR_DEPLOY_MIN_INSTANCES ? Number(SSR_DEPLOY_MIN_INSTANCES) : 0,
  },
  modulesFunctionOptions: {
    memory: (MODULES_DEPLOY_MEMORY as '256MiB' | '512MiB' | '1GiB' | '2GiB') || '512MiB',
    timeoutSeconds: 120,
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
    emails: {
      appId: 1243,
      events: [
        'orders-anyStatusSet',
      ] as ApiEventName[],
    },
    frenet: {
      appId: 1244,
      events: [
        'orders-new',
      ] as ApiEventName[],
    },
    tinyErp: {
      appId: 105922,
      events: [
        'orders-anyStatusSet',
        'products-new',
        'products-priceSet',
        'applications-dataSet',
      ] as ApiEventName[],
    },
    mercadoPago: {
      appId: 111223,
    },
    pagarMe: {
      appId: 117391,
    },
    braspag: {
      appId: 112906,
    },
    pix: {
      appId: 101827,
    },
    jadlog: {
      appId: 115229,
    },
    galaxPay: {
      appId: 123188,
      events: [
        'orders-cancelled',
      ] as ApiEventName[],
    },
    customPayment: {
      appId: 108091,
    },
    loyaltyPoints: {
      appId: 124890,
      events: [
        'orders-new',
        'orders-anyStatusSet',
      ] as ApiEventName[],
    },
    affiliateProgram: {
      appId: 119753,
      events: [
        'orders-anyStatusSet',
        'customers-new',
      ] as ApiEventName[],
    },
    datafrete: {
      appId: 123886,
    },
    pagaleve: {
      appId: 113537,
    },
    pagHiper: {
      appId: 1251,
    },
    melhorEnvio: {
      appId: 1236,
      events: [
        'orders-anyStatusSet',
      ] as ApiEventName[],
    },
    webhooksApp: {
      appId: 123113,
      events: [
        'applications-dataSet',
        'orders-anyStatusSet',
        'carts-delayed',
      ] as ApiEventName[],
    },
    flashCourier: {
      appId: 104136,
    },
    mandae: {
      appId: 124677,
    },
    pagarMeV5: {
      appId: 112381,
      events: [
        'orders-cancelled',
        'products-priceSet',
        'products-quantitySet',
      ] as ApiEventName[],
    },
  },
  settingsContent,
  metafields: {},
};
_config.set(mergeConfig);

export const config = _config as {
  get(): BaseConfig & typeof mergeConfig & { metafields: Record<string, any> };
  // eslint-disable-next-line
  set(config: any): void;
};

export default config;

export const asyncLocalStorage = new AsyncLocalStorage<{ execId: string }>();

const log = (level: 'info' | 'warn' | 'error', msg: any, d?: Record<string, any>) => {
  const execId = asyncLocalStorage.getStore()?.execId;
  if (execId) {
    if (d) {
      if (typeof d === 'object') {
        d = { ...d, execId };
      }
    } else {
      d = { execId };
    }
  }
  return d ? _logger[level](msg, d) : _logger[level](msg);
};

export const logger = {
  info(msg: any, d?: Record<string, any>) {
    return log('info', msg, d);
  },
  warn(msg: any, d?: Record<string, any>) {
    return log('warn', msg, d);
  },
  error(msg: any, d?: Record<string, any>) {
    return log('error', msg, d);
  },
};

// @ts-expect-error: Fallback only, `logger.log` not intended to be typed.
logger.log = logger.info;

export const createExecContext = (next: (...args: any[]) => any) => {
  try {
    return asyncLocalStorage.run({ execId: `${Date.now() + Math.random()}` }, next);
  } catch (err) {
    logger.error(err, {
      __onExecContextRunExp: 1,
    });
    throw err;
  }
};
