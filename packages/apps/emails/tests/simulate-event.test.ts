import type { Orders } from '@cloudcommerce/api/types';
import {
  describe,
  test,
  expect,
  beforeAll,
  dotenv,
  ecomUtils,
  getContextToCreatePubSub,
  getMessageToCreatePubSub,
} from '@cloudcommerce/test-base';
import api from '@cloudcommerce/api';
import handleApiEvent from '../src/event-to-emails';

const app = {
  _id: ecomUtils.randomObjectId() as string & { length: 24 },
  app_id: 1243,
  data: {},
  hidden_data: {},
};

describe('Events Order Simulate', async () => {
  dotenv.config();

  let orderPaid: Orders;
  beforeAll(async () => {
    orderPaid = await api.get('orders?status=open&financial_status.current=paid')
      .then(({ data }) => {
        const { result } = data;
        return api.get(`orders/${result[0]._id}`);
      })
      .then(({ data }) => data);
  });

  test('Check order paid', () => {
    expect(orderPaid.financial_status?.current).toBe('paid');
  });

  test('Simulate Event Update Payment History', async () => {
    const myId = (process.env.ECOM_AUTHENTICATION_ID
      || ecomUtils.randomObjectId()) as string & { length: 24 };

    const sendEvent = handleApiEvent(
      {
        evName: 'orders-anyStatusSet',
        apiEvent: {
          resource: 'orders',
          action: 'update',
          authentication_id: myId,
          modified_fields: ['payments_history'],
          resource_id: orderPaid._id,
          timestamp: `${Date.now()}`,
        },
        apiDoc: orderPaid,
        app,
      },
      getContextToCreatePubSub(),
      getMessageToCreatePubSub(),
    );

    expect(await sendEvent).toBe(null);
  });
});
