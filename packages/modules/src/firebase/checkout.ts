import type { Request, Response } from 'firebase-functions';
import type { CheckoutBody } from '@cloudcommerce/types';
import type {
  CheckoutBodyWithItems,
  BodyOrder,
  Amount,
  Item,
  Payment,
} from '../types/index';
import config from '@cloudcommerce/firebase/lib/config';
import { checkoutSchema } from '../index';
import { ajv, sendRequestError } from './ajv';
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

export default async (req: Request, res: Response) => {
  const { httpsFunctionOptions } = config.get();
  const modulesBaseURL = req.hostname !== 'localhost'
    ? `https://${req.hostname}${req.url.replace(/\/checkout[^/]*/i, '')}`
    : `http://localhost:5001/${process.env.GCLOUD_PROJECT}`
      + `/${(process.env.FUNCTION_REGION || httpsFunctionOptions.region)}/modules`;

  const validate = ajv.compile(checkoutSchema.params);
  const checkoutBody = req.body as CheckoutBody;
  if (!req.body.browser_ip && req.ip) {
    req.body.browser_ip = req.ip;
  }
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
  const customerId = await getCustomerId(customer);
  if (customerId) {
    if (newItems.length) {
      // start mounting order body
      // https://developers.e-com.plus/docs/api/#/store/orders/orders
      const dateTime = new Date().toISOString();
      const orderBody: BodyOrder = {
        opened_at: dateTime,
        buyers: [
          // received customer info
          {
            ...customer,
            _id: customerId,
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

      let listShipping = await requestModule(body, modulesBaseURL, 'shipping');
      let { msgErr } = listShipping;
      if (listShipping && !msgErr) {
        listShipping = getValidResults(listShipping, 'shipping_services');
        handleShippingServices(body, listShipping, amount, orderBody);
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
