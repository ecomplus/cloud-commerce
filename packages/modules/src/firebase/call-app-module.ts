import type { AppModuleName } from '@cloudcommerce/types';
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

  const debug = (response: AxiosResponse) => {
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

    logger.info(`${url} : ${status}`);
    if (status >= 400 && status < 500) {
      const { data: resData } = response;
      if (typeof resData === 'object' && resData !== null) {
        const { error, message } = resData;
        if (typeof error === 'string' && error.length && typeof message === 'string') {
          logger.warn(JSON.stringify({ error, message }));
        }
      }
    }
  };

  if (modName === 'apply_discount') {
    if (appId === apps.discounts.appId) {
      return import('@cloudcommerce/app-discounts')
        .then(({ applyDiscount }) => applyDiscount());
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
      debug(response);
      return response.data;
    })
    .catch((err) => {
      const { response } = err;
      debug(response);
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
