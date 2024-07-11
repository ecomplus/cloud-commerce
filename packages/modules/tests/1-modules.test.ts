import type { Customers, Products } from '@cloudcommerce/api/types';
import {
  describe,
  test,
  expect,
  beforeAll,
} from 'vitest';
import {
  modulesUrl,
  getCustomerApi,
  getProductApi,
} from '@cloudcommerce/test-base';

const requestApiModule = (moduleName: string, body: {[x:string]: any}) => {
  return fetch(`${modulesUrl}/${moduleName}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

describe('Test GET Schemas', async () => {
  test('@checkout', async () => {
    const req = await fetch(`${modulesUrl}/@checkout/schema`);
    expect(req.status).toBe(200);
  });
  test('apply_discount', async () => {
    const req = await fetch(`${modulesUrl}/apply_discount/schema`);
    expect(req.status).toBe(200);
  });
  test('calculate_shipping', async () => {
    const req = await fetch(`${modulesUrl}/calculate_shipping/schema`);
    expect(req.status).toBe(200);
  });
  test('create_transaction', async () => {
    const req = await fetch(`${modulesUrl}/create_transaction/schema`);
    expect(req.status).toBe(200);
  });
  test('list_payments', async () => {
    const req = await fetch(`${modulesUrl}/list_payments/schema`);
    expect(req.status).toBe(200);
  });
});

describe('Test POST', async () => {
  let product: Products | null = null;
  let customer: Customers | null = null;
  let item;
  let to;
  let appShipping;
  let appPayment;
  let shipping;
  let transaction;

  beforeAll(async () => {
    product = await getProductApi();
    customer = await getCustomerApi('test@test.com');
  });

  test('calculate_shipping (App Custon shipping)', async () => {
    item = {
      ...product,
      product_id: product?._id,
      quantity: 1,
    };

    to = customer?.addresses?.length && { ...customer?.addresses[0] };
    const bodyCalculateShipping = {
      to,
      items: [item],
    };
    const req = await requestApiModule('calculate_shipping', bodyCalculateShipping);
    const data = await req.json();
    appShipping = data?.result.find((app) => app.app_id === 1253
        && !app.errors
        && app?.response?.shipping_services?.length);

    expect(appShipping).toBeDefined();
    if (to) {
      shipping = {
        app_id: appShipping.app_id,
        to,
        service_code: appShipping.response.shipping_services[0].service_code,
      };
    }
  });

  test('list_payments (App Custon payment)', async () => {
    const bodyListPayments = {
      items: [item],
    };
    const req = await requestApiModule('list_payments', bodyListPayments);
    const data = await req.json();
    appPayment = data?.result.find((app) => app.app_id === 108091
    && !app.errors
    && app?.response?.payment_gateways?.length);

    expect(appPayment).toBeDefined();
    const {
      label,
      payment_method: paymentMethod,
      type,
    } = appPayment.response.payment_gateways[0];
    transaction = {
      app_id: appPayment.app_id,
      label,
      payment_method: paymentMethod,
      type,
      buyer: {
        email: 'test@test.com',
        fullname: 'Usuário Teste',
        birth_date: {
          day: 1,
          month: 1,
          year: 1990,
        },
        phone: {
          number: '999999999',
          country_code: 55,
        },
        registry_type: 'p',
        doc_number: '12345678912',
      },
      to,
    };
  });

  test('@checkout', async () => {
    const bodyCheckout = {
      items: [item],
      customer: {
        name: {
          given_name: 'Teste',
        },
        main_email: 'test@test.com',
      },
      shipping,
      transaction,
    };
    const req = await requestApiModule('@checkout', bodyCheckout);

    expect(req.status).toBe(200);
  });
});
