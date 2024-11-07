/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
import config from '@cloudcommerce/firebase/lib/config';
import functions from 'firebase-functions/v1';
import saveViews from './lib/cron-ssr-save-views';

const { httpsFunctionOptions: { region } } = config.get();

export const ssr = {
  cronSaveViews: functions.region(region).runWith({
    timeoutSeconds: 230,
    memory: '256MB',
  }).pubsub
    .schedule(process.env.CRONTAB_SSR_SAVE_VIEWS || '49 * * * *')
    .onRun(saveViews),
};
