import type { Request, Response } from 'firebase-functions';
import type { OrderSet, CheckoutBody } from '@cloudcommerce/types';
import type {
  CheckoutBodyWithItems,
  Amount,
  Payment,
} from '../types/index';
import { info } from 'firebase-functions/logger';
import { fullName as getFullname } from '@ecomplus/utils';
import { checkoutSchema } from '../index';
import { ajv, sendRequestError } from './ajv';
import fixItems from './functions-checkout/fix-items';
import readOrSaveCustomer from './functions-checkout/read-or-save-customer';
import requestModule from './functions-checkout/request-to-module';
import {
  sendError,
  fixAmount,
  getValidResults,
  handleShippingServices,
  handleApplyDiscount,
  handleListPayments,
} from './functions-checkout/checkout-utils';
import createOrder from './functions-checkout/new-order';

type Item = Exclude<OrderSet['items'], undefined>[number]

export default async (req: Request, res: Response) => {
  const host = req.hostname !== 'localhost' && req.hostname !== '127.0.0.1'
    ? `https://${req.hostname}`
    : 'http://127.0.0.1:5000';
  const modulesBaseURL = `${host}${req.url.replace(/\/@?checkout[^/]*$/i, '')}`;

  const validate = ajv.compile(checkoutSchema.params);
  const checkoutBody = req.body as CheckoutBody;
  req.body.client_ip = req.ip;
  const userAgent = req.get('user-agent');
  req.body.client_user_agent = userAgent === 'string'
    ? userAgent.substring(0, 255)
    : '';
  if (!validate(checkoutBody)) {
    return sendRequestError(res, '@checkout', validate.errors);
  }
  const { items, ...newBody } = checkoutBody;
  info(`Checkout by ${checkoutBody.customer.main_email}`, { checkoutBody });
  const newItems = await fixItems(items) as Exclude<OrderSet['items'], undefined>;
  const amount: Amount = {
    subtotal: 0,
    discount: 0,
    freight: 0,
    total: 0,
  };
  const body: CheckoutBodyWithItems = {
    ...newBody,
    items: [...newItems],
    subtotal: 0,
    amount,
  };
  if (!newItems.length) {
    return sendError(res, 400, 'CKT801', 'Cannot handle checkout, any valid cart item');
  }

  const countCheckoutItems = body.items.length;
  const { customer } = body;
  const savedCustomer = await readOrSaveCustomer({
    ...customer,
    addresses: !body.shipping.to.line_address?.includes('***')
      ? [body.shipping.to]
      : undefined,
  });
  const customerId = savedCustomer._id;
  if (customerId === customer._id) {
    Object.keys(savedCustomer).forEach((field) => {
      if (customer[field] === undefined) {
        customer[field] = savedCustomer[field];
      }
    });
    if (customer.name.family_name?.includes('***') && savedCustomer.name) {
      customer.name = savedCustomer.name;
    }
    if (customer.phones?.[0].number.match(/^0{3,}\d{1,4}$/)) {
      customer.phones = savedCustomer.phones;
    }
  }
  customer._id = customerId;
  const fixMaskedAddr = (bodyAddr: typeof body.shipping.to) => {
    if (bodyAddr.line_address?.includes('***') || bodyAddr.name?.includes('***')) {
      const savedAddr = savedCustomer.addresses?.find(({ zip }) => zip === bodyAddr.zip);
      if (savedAddr) {
        Object.assign(bodyAddr, savedAddr);
        delete bodyAddr.line_address;
      }
    }
  };
  fixMaskedAddr(body.shipping.to);

  // start mounting order body
  // https://developers.e-com.plus/docs/api/#/store/orders/orders
  const dateTime = new Date().toISOString();
  const orderBody: OrderSet = {
    opened_at: dateTime,
    buyers: [{
      ...customer,
      _id: customerId,
    }],
    items: [],
    amount: {
      total: 0,
    },
  };
  // bypass some order fields
  const fields = [
    'utm',
    'affiliate_code',
    'client_ip',
    'client_user_agent',
    'channel_id',
    'channel_type',
    'domain',
    'notes',
  ];
  fields.forEach((field) => {
    if (body[field]) {
      orderBody[field] = body[field];
    }
  });
  if (orderBody.domain) {
    // consider default Storefront app routes
    if (!orderBody.checkout_link) {
      orderBody.checkout_link = `https://${orderBody.domain}/app/#/checkout/(_id)`;
    }
    if (!orderBody.status_link) {
      orderBody.status_link = `https://${orderBody.domain}/app/#/order/(_id)`;
    }
  }

  let subtotal = 0;
  newItems.forEach(
    (item: Item) => {
      subtotal += ((item.final_price || item.price) * item.quantity);
      if (orderBody.items) {
        orderBody.items.push({ ...item });
      }
    },
  );
  if (subtotal <= 0 && items.length < countCheckoutItems) {
    return sendError(res, 400, 'CKT801', 'Cannot handle checkout, any valid cart item');
  }
  amount.subtotal = subtotal;
  body.subtotal = subtotal;
  fixAmount(amount, body, orderBody);

  const transactions = Array.isArray(body.transaction) ? body.transaction : [body.transaction];
  transactions.forEach((transaction) => {
    transaction.buyer.customer_id = customerId;
    (['buyer', 'payer'] as const).forEach((field) => {
      const buyerOrPayer = transaction[field];
      if (buyerOrPayer?.fullname?.includes('***')) {
        buyerOrPayer.fullname = getFullname(customer);
        if (customer.phones?.[0]) buyerOrPayer.phone = customer.phones[0];
      }
    });
    (['billing_address', 'to'] as const).forEach((field) => {
      const addr = transaction[field];
      if (addr) fixMaskedAddr(addr);
    });
  });

  let shippingOptions = await requestModule(body, modulesBaseURL, 'shipping');
  let { msgErr } = shippingOptions;
  if (shippingOptions && !msgErr) {
    shippingOptions = getValidResults(shippingOptions, 'shipping_services');
    handleShippingServices(body, shippingOptions, amount, orderBody);
  } else {
    // problem with shipping response object
    return sendError(
      res,
      msgErr?.status || 400,
      msgErr?.code || 'CKT901',
      'Any valid shipping service from /calculate_shipping module',
      {
        en_us: 'Shipping method not available, please choose another',
        pt_br: 'Forma de envio indisponível, por favor escolha outra',
      },
      msgErr?.moreInfo,
    );
  }

  let discounts = await requestModule(body, modulesBaseURL, 'discount');
  if (discounts) {
    discounts = getValidResults(discounts);
    handleApplyDiscount(body, discounts, amount, orderBody);
  }

  const { transaction, ...bodyPayment } = body;
  let paymentsBody: Payment;
  if (Array.isArray(transaction)) {
    paymentsBody = {
      ...bodyPayment,
      transaction: transaction[0],
    };
  } else {
    paymentsBody = {
      ...bodyPayment,
      transaction,
    };
  }

  let listPaymentGateways = await requestModule(paymentsBody, modulesBaseURL, 'payment');
  msgErr = listPaymentGateways.msgErr;
  if (listPaymentGateways && !msgErr) {
    listPaymentGateways = getValidResults(listPaymentGateways, 'payment_gateways');
    handleListPayments(body, listPaymentGateways, paymentsBody, amount, orderBody);
  } else {
    return sendError(
      res,
      msgErr?.status || 409,
      msgErr?.code || 'CKT902',
      'Any valid payment gateway from /list_payments module',
      {
        en_us: 'Payment method not available, please choose another',
        pt_br: 'Forma de pagamento indisponível, por favor escolha outra',
      },
      msgErr?.moreInfo,
    );
  }

  return createOrder(
    res,
    modulesBaseURL,
    amount,
    checkoutBody,
    orderBody,
    transactions,
    dateTime,
  );
};
