import type { Request, Response } from 'firebase-functions';
import type { ValidateFunction } from 'ajv';
import type { CheckoutBody } from '@cloudcommerce/types';
import type {
  CheckoutBodyWithItems,
  BodyOrder,
  Amount,
  Item,
  BodyPayment,
} from '../types/index';
import {
  ajv,
  sendRequestError,
} from './ajv';
import fixItems from './functions-checkout/fix-items';
import getCustomerId from './functions-checkout/get-custumerId';
import requestModule from './functions-checkout/request-to-module';
import {
  sendError,
  fixAmount,
  getValidResults,
  handleShippingServices,
  handleApplyDiscount,
  handleListPayments,
} from './functions-checkout/utils';
import createOrder from './functions-checkout/new-order';

const runCheckout = async (
  checkoutBody: CheckoutBody,
  accessToken:string,
  res:Response,
  validate: ValidateFunction,
  hostname: string,
) => {
  if (!validate(checkoutBody)) {
    return sendRequestError(res, '@checkout', validate.errors);
  }
  const { items, ...newBody } = checkoutBody;
  const newItems = await fixItems(items);
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

  const countCheckoutItems = body.items.length;
  const { customer } = body;
  const customerId = await getCustomerId(accessToken, customer);
  if (customerId && customer) {
    if (newItems.length) {
      const { _id, ...newCustomer } = customer;
      // start mounting order body
      // https://developers.e-com.plus/docs/api/#/store/orders/orders
      const dateTime = new Date().toISOString();
      const orderBody: BodyOrder = {
        opened_at: dateTime,
        buyers: [
          // received customer info
          {
            _id: customerId,
            ...newCustomer,
          },
        ],
        items: [],
        amount: {
          total: 0,
        },
      };
      // bypass some order fields
      const fields = [
        'utm',
        'affiliate_code',
        'browser_ip',
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

      // count subtotal value
      let subtotal = 0;
      newItems.forEach(
        (item:Item) => {
          subtotal += (item.final_price || item.price * item.quantity);
          // pass each item to prevent object overwrite
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
      // add customer ID to order and transaction
      customer._id = customerId;
      transactions.forEach(({ buyer }) => {
        if (buyer) {
          buyer.customer_id = customerId;
        }
      });

      let listShipping = await requestModule(body, hostname, 'shipping');
      if (listShipping) {
        listShipping = getValidResults(listShipping, 'shipping_services');
        handleShippingServices(body, listShipping, amount, orderBody);
      } else {
      // problem with shipping response object
        return sendError(
          res,
          400,
          'CKT901',
          'Any valid shipping service from /calculate_shipping module',
          {
            en_us: 'Shipping method not available, please choose another',
            pt_br: 'Forma de envio indisponível, por favor escolha outra',
          },
        );
      }

      let discounts = await requestModule(body, hostname, 'discount');
      if (discounts) {
        discounts = getValidResults(discounts);
        handleApplyDiscount(body, discounts, amount, orderBody);
      }

      const { transaction, ...bodyPayment } = body;
      let paymentsBody: BodyPayment;
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

      let listPaymentGateways = await requestModule(paymentsBody, hostname, 'payment');

      if (listPaymentGateways) {
        listPaymentGateways = getValidResults(listPaymentGateways, 'payment_gateways');
        handleListPayments(body, listPaymentGateways, paymentsBody, amount, orderBody);
      } else {
        return sendError(
          res,
          409,
          'CKT902',
          'Any valid payment gateway from /list_payments module',
          {
            en_us: 'Payment method not available, please choose another',
            pt_br: 'Forma de pagamento indisponível, por favor escolha outra',
          },
        );
      }

      return createOrder(
        res,
        accessToken,
        hostname,
        amount,
        checkoutBody,
        orderBody,
        transactions,
        dateTime,
      );
    }
    return sendError(res, 400, 'CKT801', 'Cannot handle checkout, any valid cart item');
  }
  return sendError(
    res,
    404,
    -404,
    'Not found',
    {
      en_us: 'No customers found with ID or email provided',
      pt_br: 'Nenhum cliente encontrado com ID ou e-mail fornecido',
    },
  );
};

export default (
  schema: {[key:string] : any},
  req: Request,
  res:Response,
  hostname: string,
) => {
  const validate = ajv.compile(schema);
  const ip = req.headers['x-real-ip'];
  if (!req.body.browser_ip && ip) {
    req.body.browser_ip = ip;
  }
  let acessToken = req.headers.authorization;
  if (acessToken) {
    acessToken = acessToken.replace(/Bearer /i, '');
    return runCheckout(req.body, acessToken, res, validate, hostname);
  }
  return sendError(
    res,
    401,
    109,
    "Token is required on 'Authorization'",
    {
      en_us: 'No authorization for the requested method and resource',
      pt_br: 'Sem autorização para o método e recurso solicitado',
    },
  );
};
