import api from '@cloudcommerce/api';
import config from '@cloudcommerce/firebase/lib/config';
import { PubSub } from '@google-cloud/pubsub';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import logger from 'firebase-functions/logger';
import calculateV2 from './correios-v2.mjs';
import { newCorreios } from './utils/correios-axios.mjs';
import {
  weights,
  zipRangeStep,
  getDocId,
  setCredentials,
  dataToDoc,
} from './utils/constants-parsers.mjs';

const VERSION = 1;

const firstZipCode = 1000001;
const maxZipCode = 99999999;
const lastZipCode = maxZipCode - zipRangeStep + 2;

const getAppData = async () => {
  const [application] = (await api.get(
    `applications?app_id=${config.get().apps.correios.appId}&fields=hidden_data,data`,
  )).data.result;

  return {
    ...application.data,
    ...application.hidden_data,
  };
};

const fillDb = async (state) => {
  if (state?.nextZipCode && state.V !== VERSION) {
    logger.warn(`Skip old dup call for (${state.nextZipCode})`);
    return false;
  }

  const continueDbFill = async (retryZipCode) => {
    let json;
    let isRetry = false;
    if (retryZipCode && (!state?.retries || state.retries < 3)) {
      json = { ...state };
      json.nextZipCode = retryZipCode;
      json.retries = state?.retries ? state.retries + 1 : 1;
      isRetry = true;
    }
    if (!isRetry) {
      if (state?.nextZipCode && state.nextZipCode < lastZipCode) {
        json = { ...state };
      } else {
        json = {};
      }
    }

    json.V = VERSION;
    await new PubSub()
      .topic('continueDbFill')
      .publishMessage({ json });
  };

  let configApp;

  if (
    !process.env.CORREIOS_POSTCARD
    || !process.env.CORREIOS_USER
    || !process.env.CORREIOS_ACCESS_CODE
  ) {
    logger.info('> Set credentials');
    try {
      configApp = await getAppData();
      if (configApp) {
        setCredentials(configApp);
      }
    } catch {
      logger.warn('Skipped (404)');
      return continueDbFill();
    }
  }

  if (!state?.cepOrigem) {
    logger.info('Starting');
    if (!state) {
      state = {};
    }

    state.serviceCodes = configApp?.services
      && configApp?.services.length
      && configApp?.services.map((service) => service.service_code);

    state.cepOrigem = configApp?.zip?.replace(/\D/g, '');

    if (!state.cepOrigem || !state.serviceCodes) {
      logger.warn('Skipped (400)');
      return continueDbFill();
    }
  }

  let zipCode;
  const calculateNextZip = async () => {
    const { cepOrigem, serviceCodes } = state;

    if (zipCode === lastZipCode) {
      return false;
    }
    zipCode = state.nextZipCode || firstZipCode;
    state.nextZipCode = Math.min(zipCode + zipRangeStep, lastZipCode);

    const cepDestino = zipCode.toString().padStart(8, '0');
    const _calculateParams = {
      cepOrigem,
      cepDestino,
    };

    const correios = await newCorreios();

    if (!correios?.$contract?.nuContrato) {
      logger.warn('Contract not found');
      return false;
    }

    if (Number(cepDestino) > 2000000) {
      const docSnapshot = await getFirestore()
        .doc(getDocId({
          ..._calculateParams,
          psObjeto: 10000,
          nuContrato: correios?.$contract?.nuContrato,
          serviceCodes,
        })).get();
      if (docSnapshot.exists) {
        const { t } = docSnapshot.data();
        if (t && t.toMillis() > Date.now() - 1000 * 60 * 60 * 24 * 3) {
          logger.warn(`> Skip probably dup call for (${cepDestino})`);
          return false;
        }
      }
    }
    logger.info(`> ZipCode: ${cepDestino}}`);

    const calculateMany = async (calculateWeights, listServiceCode) => {
      return calculateWeights.map((psObjeto) => {
        const promises = [];

        const calculateParams = { ..._calculateParams, psObjeto };
        promises.push(
          calculateV2({
            calculateParams,
            correios,
            serviceCodes: listServiceCode,
          })
            .then(async ({ data }) => {
              const docId = getDocId({
                ...calculateParams,
                nuContrato: correios?.$contract?.nuContrato,
                serviceCodes: listServiceCode,
              });

              await getFirestore().doc(docId)
                .set({
                  ...dataToDoc(data),
                  t: Timestamp.fromDate(new Date()),
                })
                .catch(logger.error);
            }),
        );

        return Promise.all(promises);
      });
    };

    await Promise.all(calculateMany(weights.slice(0, 8), serviceCodes));
    await Promise.all(calculateMany(weights.slice(8, 16), serviceCodes));
    await Promise.allSettled(calculateMany(weights.slice(16), serviceCodes));
    return true;
  };

  try {
    let shouldNext = await calculateNextZip();
    if (shouldNext !== false) shouldNext = await calculateNextZip();
    if (shouldNext !== false) shouldNext = await calculateNextZip();
    if (state?.retries) state.retries = 0;
    return shouldNext !== false ? continueDbFill() : true;
  } catch {
    logger.info(`> May retry ${zipCode}`);
    return continueDbFill(zipCode);
  }
};

export default fillDb;
