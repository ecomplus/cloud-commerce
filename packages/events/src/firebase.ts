/* eslint-disable import/prefer-default-export */

import type { AppEventsTopic } from '@cloudcommerce/types';
import 'source-map-support/register.js';
// eslint-disable-next-line import/no-unresolved
import { initializeApp } from 'firebase-admin/app';
import functions from 'firebase-functions';
import config from '@cloudcommerce/firebase/lib/config';

const { logger } = functions;
initializeApp();

const eventMaxAgeMs = 60000;
const newOrderTopic: AppEventsTopic = 'orders-new';
const { httpsFunctionOptions: { region } } = config.get();

export const onNewOrder = functions.region(region)
  .runWith({ failurePolicy: true })
  .pubsub.topic(newOrderTopic).onPublish((message, context) => {
    const eventAgeMs = Date.now() - Date.parse(context.timestamp);
    if (eventAgeMs > eventMaxAgeMs) {
      logger.warn(`Dropping event ${context.eventId} with age[ms]: ${eventAgeMs}`);
      return;
    }
    // Hide API key for security
    process.env.ECOM_API_KEY = '***';
    const { json } = message;
    logger.info({
      topic: newOrderTopic,
      eventId: context.eventId,
      json,
    });
  });
