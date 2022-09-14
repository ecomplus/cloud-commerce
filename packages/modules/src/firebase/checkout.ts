import type { Request, Response } from 'firebase-functions';
import type { ValidateFunction } from 'ajv';
import type { Orders } from '@cloudcommerce/types';
// import logger from 'firebase-functions/lib/logger';
import {
  ajv,
  sendRequestError,
} from './ajv';
import fixItems from './functions-checkout/fix-items';
import getCustomerAndAuth from './functions-checkout/get-custumer-auth';
import createOrder from './functions-checkout/new-order';

type BodyOrder = Omit<Orders, '_id' | 'created_at' | 'updated_at' | 'store_id' >

const sendError = (
  res:Response,
  status: number,
  errorCode: string,
  message: string,
  userMessage?: {[key:string]:string},
  moreInfo?:string,
) => {
  return res.status(status)
    .send({
      error_code: errorCode,
      message,
      user_message: userMessage,
      more_info: moreInfo,
    });
};

const runCheckout = async (
  body: { [key: string]: any },
  res:Response,
  validate: ValidateFunction,
) => {
  if (!validate(body)) {
    return sendRequestError(res, '@checkout', validate.errors);
  }
  const countCheckoutItems = body.items.length;
  const items = await fixItems(body.items);
  const { customer } = body;
  const customerAndAuth = await getCustomerAndAuth(customer);
  if (customerAndAuth) {
    if (items.length) {
      body.items = items;
      // start mounting order body
      // https://developers.e-com.plus/docs/api/#/store/orders/orders
      const dateTime = new Date().toISOString();
      const orderBody: BodyOrder = {
        opened_at: dateTime,
        buyers: [
        // received customer info
          customer,
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
      items.forEach((item) => {
        subtotal += (item.final_price || item.price * item.quantity);
        // pass each item to prevent object overwrite
        if (orderBody.items) {
          orderBody.items.push({ ...item });
        }
      });
      if (subtotal <= 0 && items.length < countCheckoutItems) {
        return sendError(res, 400, 'CKT801', 'Cannot handle checkout, any valid cart item');
      }
      const amount = {
        subtotal,
        discount: 0,
        freight: 0,
        total: 0,
      };
      const fixAmount = () => {
        Object.keys(amount).forEach((field) => {
          if (amount[field] > 0 && field !== 'total') {
            amount[field] = Math.round(amount[field] * 100) / 100;
          }
        });

        amount.total = Math.round((amount.subtotal + amount.freight - amount.discount) * 100) / 100;
        if (amount.total < 0) {
          amount.total = 0;
        }
        // also save amount to checkout and order body objects
        body.amount = amount;
        orderBody.amount = amount;
      };
      fixAmount();
      body.subtotal = subtotal;

      const transactions = Array.isArray(body.transaction) ? body.transaction : [body.transaction];
      // add customer ID to order and transaction
      customer._id = customerAndAuth._id;
      transactions.forEach(({ buyer }) => {
        if (buyer) {
          buyer.customer_id = customerAndAuth._id;
        }
      });

      const order = await createOrder(orderBody, customerAndAuth.access_token);
      if (order) {
        // TODO: continue code from here
        return res.status(200).send({
          status: 200,
          message: 'CHECKOUT',
          order,
        });
      }
      return sendError(
        res,
        409,
        'CKT701',
        'There was a problem saving your order, please try again later',
        {
          en_us: 'There was a problem saving your order, please try again later',
          pt_br: 'Houve um problema ao salvar o pedido, por favor tente novamente mais tarde',
        },
      );
    }
    return sendError(res, 400, 'CKT801', 'Cannot handle checkout, any valid cart item');
  }
  return sendError(res, 400, 'CKT702', 'There was an error authenticating the customer');
};

export default (
  schema: { [key: string]: any },
  req: Request,
  res:Response,
) => {
  const validate = ajv.compile(schema);
  const ip = req.headers['x-real-ip'];
  if (!req.body.browser_ip && ip) {
    req.body.browser_ip = ip;
  }
  return runCheckout(req.body, res, validate);
};
