import {
  describe,
  test,
} from 'node:test';
import assert from 'node:assert';
import firebaseFunctionsTest from 'firebase-functions-test';
// eslint-disable-next-line import/no-extraneous-dependencies
import ecomUtils from '@ecomplus/utils';
import {
  bodyCreateTransaction as order,
} from '@cloudcommerce/test-base';
import { emails } from '../lib/index.js';

const projectId = process.env.FIREBASE_PROJECT_ID
  || process.env.PROJECT_ID || 'ecom2-demo';

const { wrap, pubsub } = firebaseFunctionsTest({
  projectId,
});

const app = {
  _id: ecomUtils.randomObjectId(),
  app_id: 1243,
  data: {},
  hidden_data: {},
};

describe('Events Order Simulate', async () => {
  test('Simulate Event Update Payment History', async () => {
    const myId = (process.env.ECOM_AUTHENTICATION_ID
      || ecomUtils.randomObjectId());

    const body = {
      evName: 'orders-anyStatusSet',
      apiEvent: {
        resource: 'orders',
        action: 'update',
        authentication_id: myId,
        modified_fields: ['payments_history'],
        resource_id: order._id,
        timestamp: `${Date.now()}`,
      },
      apiDoc: order,
      app,
    };

    const message = pubsub.makeMessage(body);
    const sendEvent = wrap(emails.onStoreEvent);
    assert.equal(await sendEvent(message), null);
  });
});
