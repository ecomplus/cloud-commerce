import logger from 'firebase-functions/logger';
import api from '@cloudcommerce/api';
import config from '@cloudcommerce/firebase/lib/config';
import { PubSub } from '@google-cloud/pubsub';
import topicName from './get-topic-name.mjs';

const sendMessageTopic = async (json) => {
  await new PubSub()
    .topic(topicName())
    .publishMessage({ json });

  //   logger.log(`[Fill Correios] MessageId: ${messageId}`);

  return Promise.resolve(true);
};

const firstZipCode = 1000001;
const maxZipCode = 99999999;
const zipRangeStep = 5000;

const runDb = async () => {
  const [application] = (await api.get(
    `applications?app_id=${config.get().apps.correiosV2.appId}&fields=hidden_data,data`,
  )).data.result;

  const appData = {
    ...application.data,
    ...application.hidden_data,
  };

  const zipCodeOrigin = appData.zip.replace(/\D/g, '');

  return new Promise((resolve) => {
    const weights = [0.5];
    let weigth = 0;

    do {
      const lastWeight = weights[weights.length - 1];
      weigth = lastWeight + Math.ceil(lastWeight / 10);

      if (lastWeight < 1) {
        weigth = 1;
      } else if (lastWeight >= 40) {
        weigth = 50;
      }
      weights.push(weigth);
    } while (weigth < 50);

    let zipCode = firstZipCode;
    while (zipCode <= maxZipCode) {
      for (let i = 0; i < weights.length; i++) {
        try {
          sendMessageTopic({
            weight: weights[i],
            zipCode,
            zipCodeOrigin,
          });
        } catch (err) {
          logger.error(err);
        }
      }
      zipCode += zipRangeStep;
    }
    resolve(null);
  });
};

export default runDb;

export {
  zipRangeStep,
  sendMessageTopic,
};
