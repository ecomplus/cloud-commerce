import type { AppModuleName, AppModuleBody } from '@cloudcommerce/types';
import { logger } from 'firebase-functions';
import axios, { AxiosResponse } from 'axios';
import config from '@cloudcommerce/firebase/lib/config';

// Blacklist urls to prevent consecultive errors
const blacklist = {};

export default async (
  appId: number,
  modName: AppModuleName,
  url: string,
  data: any,
  isBigTimeout: boolean,
) => {
  if (blacklist[url] > 2) {
    logger.log(`> Skipping blacklisted ${url}`);
    const err = new Error('Blacklited endpoint URL');
    return Promise.reject(err);
  }
  const { storeId, apps } = config.get();

  const checkErrorResponse = (logHead: string, resData: any) => {
    if (typeof resData === 'object' && resData !== null) {
      const { error, message } = resData;
      if (typeof error === 'string' && error.length && typeof message === 'string') {
        logger.warn(logHead, JSON.stringify({ error, message }));
      }
    }
  };

  const debugAndBlacklist = (response: AxiosResponse) => {
    const status = response ? response.status : 0;
    if (!blacklist[url]) {
      blacklist[url] = 1;
    } else {
      blacklist[url] += 1;
    }
    setTimeout(() => {
      if (blacklist[url] > 1) {
        blacklist[url] -= 1;
      } else {
        delete blacklist[url];
      }
    }, !status ? 180000 : 6000);
    const logHead = `${url} : ${status}`;
    if (status >= 400 && status < 500) {
      checkErrorResponse(logHead, response.data);
    } else {
      logger.info(logHead);
    }
  };

  // eslint-disable-next-line no-unused-vars
  let internalModuleFn: undefined | ((_data?: AppModuleBody) => Promise<any>);
  if (modName === 'apply_discount') {
    if (appId === apps.discounts.appId) {
      internalModuleFn = async (_data: AppModuleBody = data) => {
        return import('@cloudcommerce/app-discounts')
          .then(({ applyDiscount }) => applyDiscount(_data));
      };
    }
  } else if (modName === 'calculate_shipping') {
    if (appId === apps.correios.appId) {
      internalModuleFn = async (_data: AppModuleBody = data) => {
        return import('@cloudcommerce/app-correios')
          .then(({ calculateShipping }) => calculateShipping(_data));
      };
    } else if (appId === apps.customShipping.appId) {
      internalModuleFn = async (_data: AppModuleBody = data) => {
        return import('@cloudcommerce/app-custom-shipping')
          .then(({ calculateShipping }) => calculateShipping(_data));
      };
    } else if (appId === apps.frenet.appId) {
      internalModuleFn = async (_data: AppModuleBody = data) => {
        return import('@cloudcommerce/app-frenet')
          .then(({ calculateShipping }) => calculateShipping(_data));
      };
    }
  }
  if (internalModuleFn) {
    /*
    global.app1_apply_discount_middleware = async (
      data: any,
      next: () => Promise<any>,
    ) => {
      if (data.params.x === 'sample') {
        return {};
      }
      return next(data);
    };
    */
    const middleware = global[`app${appId}_${modName}_middleware`];
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
};
