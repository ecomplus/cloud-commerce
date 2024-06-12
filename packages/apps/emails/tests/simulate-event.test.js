import {
  describe,
  test,
  before,
} from 'node:test';
import assert from 'node:assert';
import ecomUtils from '@ecomplus/utils';
import api from '@cloudcommerce/api';
import handleEmails from '../lib/event-to-emails.js';

const app = {
  _id: ecomUtils.randomObjectId(),
  app_id: 1243,
  data: {},
  hidden_data: {},
};

describe('Events Order Simulate', async () => {
  let order;
  before(async () => {
    order = await api.get('orders?status=open&financial_status.current=paid')
      .then(({ data }) => {
        const { result } = data;
        return api.get(`orders/${result[0]._id}`);
      })
      .then(({ data }) => data);
  });

  test('Check order paid', () => {
    assert.equal(order.financial_status?.current, 'paid');
  });

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

    assert.equal(await handleEmails(body), null);
  });
});
