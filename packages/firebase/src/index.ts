/* eslint-disable import/prefer-default-export */
// import './init';
import * as functions from 'firebase-functions/v1';
import config from './config';
import checkStoreEvents from './handlers/check-store-events';
import cleanCheckoutRateLimits from './handlers/clean-checkout-rate-limits';

const { httpsFunctionOptions: { region } } = config.get();

const functionBuilder = functions
  .region(region)
  .runWith({
    timeoutSeconds: 300,
    memory: '256MB',
  });

export const cronStoreEvents = functionBuilder.pubsub
  .schedule(process.env.CRONTAB_STORE_EVENTS || '* * * * *')
  .onRun(() => {
    return checkStoreEvents();
  });

export const cronCleanCheckoutRateLimits = functionBuilder.pubsub
  .schedule(process.env.CRONTAB_CLEAN_CHECKOUT_RATE_LIMITS || '17 4 * * *')
  .onRun(() => {
    return cleanCheckoutRateLimits();
  });
