import type { AppModuleName, AppModuleBody } from '@cloudcommerce/types';
import logger from 'firebase-functions/logger';
import config from '@cloudcommerce/firebase/lib/config';

// Blacklist urls to prevent consecultive errors
const blacklist = {};

declare global {
  // eslint-disable-next-line
  var $appModuleMiddlewares: Record<string,
    (
      data: AppModuleBody<any>,
      next: (_data: AppModuleBody<any>) => Promise<any>,
    ) => Promise<any>
  >;
}
if (!global.$appModuleMiddlewares) {
  global.$appModuleMiddlewares = {};
}

const callAppModule = async (
  appId: number,
  modName: AppModuleName,
  url: string,
  data: AppModuleBody<any>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isBigTimeout: boolean,
) => {
  if (blacklist[url] > 2) {
    logger.log(`> Skipping blacklisted ${url}`);
    const err = new Error('Blacklited endpoint URL');
    return Promise.reject(err);
  }
  const { apps } = config.get();

  const checkErrorResponse = (logHead: string, resData: any) => {
    if (typeof resData === 'object' && resData !== null) {
      const { error, message } = resData;
      if (typeof error === 'string' && error.length && typeof message === 'string') {
        logger.warn(logHead, JSON.stringify({ error, message }));
      }
    }
  };

  // eslint-disable-next-line no-unused-vars
  let internalModuleFn: undefined | ((_data: AppModuleBody<any>) => Promise<any>);
  if (modName === 'apply_discount') {
    if (appId === apps.discounts.appId) {
      internalModuleFn = async (_data = data) => {
        return import('@cloudcommerce/app-discounts')
          .then(({ applyDiscount }) => applyDiscount(_data));
      };
    }
  } else if (modName === 'calculate_shipping') {
    if (appId === apps.correios.appId) {
      internalModuleFn = async (_data = data) => {
        return import('@cloudcommerce/app-correios')
          .then(({ calculateShipping }) => calculateShipping(_data));
      };
    } else if (appId === apps.customShipping.appId) {
      internalModuleFn = async (_data = data) => {
        return import('@cloudcommerce/app-custom-shipping')
          .then(({ calculateShipping }) => calculateShipping(_data));
      };
    } else if (appId === apps.frenet.appId) {
      internalModuleFn = async (_data = data) => {
        return import('@cloudcommerce/app-frenet')
          .then(({ calculateShipping }) => calculateShipping(_data));
      };
    } else if (appId === apps.jadlog.appId) {
      internalModuleFn = async (_data = data) => {
        return import('@cloudcommerce/app-jadlog')
          .then(({ calculateShipping }) => calculateShipping(_data));
      };
    } else if (appId === apps.datafrete.appId) {
      internalModuleFn = async (_data = data) => {
        return import('@cloudcommerce/app-datafrete')
          .then(({ calculateShipping }) => calculateShipping(_data));
      };
    } else if (appId === apps.melhorEnvio.appId) {
      internalModuleFn = async (_data = data) => {
        return import('@cloudcommerce/app-melhor-envio')
          .then(({ calculateShipping }) => calculateShipping(_data));
      };
    } else if (appId === apps.flashCourier.appId) {
      internalModuleFn = async (_data = data) => {
        return import('@cloudcommerce/app-flash-courier')
          .then(({ calculateShipping }) => calculateShipping(_data));
      };
    } else if (appId === apps.mandae.appId) {
      internalModuleFn = async (_data = data) => {
        return import('@cloudcommerce/app-mandae')
          .then(({ calculateShipping }) => calculateShipping(_data));
      };
    }
  } else if (modName === 'list_payments') {
    if (appId === apps.mercadoPago.appId) {
      internalModuleFn = async (_data = data) => {
        return import('@cloudcommerce/app-mercadopago')
          .then(({ listPayments }) => listPayments(_data));
      };
    }
    if (appId === apps.pagarMe.appId) {
      internalModuleFn = async (_data = data) => {
        return import('@cloudcommerce/app-pagarme')
          .then(({ listPayments }) => listPayments(_data));
      };
    }
    if (appId === apps.pix.appId) {
      internalModuleFn = async (_data = data) => {
        return import('@cloudcommerce/app-pix')
          .then(({ listPayments }) => listPayments(_data));
      };
    }
    if (appId === apps.galaxPay.appId) {
      internalModuleFn = async (_data = data) => {
        return import('@cloudcommerce/app-galaxpay')
          .then(({ listPayments }) => listPayments(_data));
      };
    }
    if (appId === apps.customPayment.appId) {
      internalModuleFn = async (_data = data) => {
        return import('@cloudcommerce/app-custom-payment')
          .then(({ listPayments }) => listPayments(_data));
      };
    }
    if (appId === apps.loyaltyPoints.appId) {
      internalModuleFn = async (_data = data) => {
        return import('@cloudcommerce/app-loyalty-points')
          .then(({ listPayments }) => listPayments(_data));
      };
    }
    if (appId === apps.pagHiper.appId) {
      internalModuleFn = async (_data = data) => {
        return import('@cloudcommerce/app-paghiper')
          .then(({ listPayments }) => listPayments(_data));
      };
    }
    if (appId === apps.pagaleve.appId) {
      internalModuleFn = async (_data = data) => {
        return import('@cloudcommerce/app-pagaleve')
          .then(({ listPayments }) => listPayments(_data));
      };
    }
    if (appId === apps.pagarMeV5.appId) {
      internalModuleFn = async (_data = data) => {
        return import('@cloudcommerce/app-pagarme-v5')
          .then(({ listPayments }) => listPayments(_data));
      };
    }
  } else if (modName === 'create_transaction') {
    if (appId === apps.mercadoPago.appId) {
      internalModuleFn = async (_data = data) => {
        return import('@cloudcommerce/app-mercadopago')
          .then(({ createTransaction }) => createTransaction(_data));
      };
    }
    if (appId === apps.pagarMe.appId) {
      internalModuleFn = async (_data = data) => {
        return import('@cloudcommerce/app-pagarme')
          .then(({ createTransaction }) => createTransaction(_data));
      };
    }
    if (appId === apps.pix.appId) {
      internalModuleFn = async (_data = data) => {
        return import('@cloudcommerce/app-pix')
          .then(({ createTransaction }) => createTransaction(_data));
      };
    }
    if (appId === apps.galaxPay.appId) {
      internalModuleFn = async (_data = data) => {
        return import('@cloudcommerce/app-galaxpay')
          .then(({ createTransaction }) => createTransaction(_data));
      };
    }
    if (appId === apps.customPayment.appId) {
      internalModuleFn = async (_data = data) => {
        return import('@cloudcommerce/app-custom-payment')
          .then(({ createTransaction }) => createTransaction(_data));
      };
    }
    if (appId === apps.loyaltyPoints.appId) {
      internalModuleFn = async (_data = data) => {
        return import('@cloudcommerce/app-loyalty-points')
          .then(({ createTransaction }) => createTransaction(_data));
      };
    }
    if (appId === apps.pagHiper.appId) {
      internalModuleFn = async (_data = data) => {
        return import('@cloudcommerce/app-paghiper')
          .then(({ createTransaction }) => createTransaction(_data));
      };
    }
    if (appId === apps.pagaleve.appId) {
      internalModuleFn = async (_data = data) => {
        return import('@cloudcommerce/app-pagaleve')
          .then(({ createTransaction }) => createTransaction(_data));
      };
    }
    if (appId === apps.pagarMeV5.appId) {
      internalModuleFn = async (_data = data) => {
        return import('@cloudcommerce/app-pagarme-v5')
          .then(({ createTransaction }) => createTransaction(_data));
      };
    }
  }
  if (internalModuleFn) {
    /*
    global.$appModuleMiddlewares['123'] = async (data, next) => {
      if (data.module === 'create_transaction' && data.params.x === 'sample') {
        return {};
      }
      return next(data);
    };
    */
    const middleware = global.$appModuleMiddlewares[String(appId)];
    try {
      let appResponse: any;
      if (typeof middleware === 'function') {
        appResponse = await middleware(data, internalModuleFn);
      } else {
        appResponse = await internalModuleFn(data);
      }
      checkErrorResponse(`${appId}_${modName}`, appResponse);
      return appResponse;
    } catch (err) {
      logger.error(err);
      let message = 'Failed to execute module function';
      if (typeof middleware === 'function') {
        message += ' (has middleware)';
      }
      return {
        error: 'INTERNAL_MODULE_ERROR',
        message,
      };
    }
  }

  return Promise.resolve({
    error: 'APP_NOT_IMPLEMENTED',
    message: 'Not handling external modules by URL (returns 403)',
  });
  /* TODO: Update legacy app deploys to accept those requests ?
  return axios({
    method: 'POST',
    maxRedirects: 2,
    responseType: 'json',
    maxContentLength: 1000000, // 1MB
    url,
    data,
    headers: {
      'X-Store-ID': storeId.toString(),
    },
    // Wait 10s by default and 30s in specific cases
    timeout: isBigTimeout ? 30000 : 10000,
  })
    .then((response) => {
      debugAndBlacklist(response);
      return response.data;
    })
    .catch((err) => {
      const { response } = err;
      debugAndBlacklist(response);
      if (err.message || err.code) {
        let msg = `Axios error ${err.code}: ${err.message}`;
        if (data) {
          msg += `\n\n${JSON.stringify(data)}`;
        }
        logger.warn(msg);
      }
      throw err;
    });
  */
};

export default callAppModule;
