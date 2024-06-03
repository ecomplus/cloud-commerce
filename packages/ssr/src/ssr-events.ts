/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
import config from '@cloudcommerce/firebase/lib/config';
import functions from 'firebase-functions';
import saveViews from './lib/cron-ssr-save-views';

const { httpsFunctionOptions: { region } } = config.get();

export const ssr = {
  cronSaveViews: functions.region(region).runWith({
    timeoutSeconds: 179,
    memory: '128MB',
  }).pubsub
    .schedule(process.env.CRONTAB_SSR_SAVE_VIEWS
      || (process.env.BUNNYNET_API_KEY ? '*/3 * * * *' : '49 * * * *'))
    .onRun(saveViews),
};
