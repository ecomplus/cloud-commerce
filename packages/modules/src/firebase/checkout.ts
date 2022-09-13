import type { Request, Response } from 'firebase-functions';
import { ValidateFunction } from 'ajv';
import {
  ajv,
  sendRequestError,
} from './ajv';
import fixItems from './functions-checkout/fixItem';

const runCheckout = async (
  body: { [key: string]: any },
  res:Response,
  validate: ValidateFunction,
) => {
  if (!validate(body)) {
    return sendRequestError(res, '@checkout', validate.errors);
  }
  // const countCheckoutItems = body.items.length;
  const items = await fixItems(body.items);
  console.log('> ', items);

  return res.status(200).send({
    status: 200,
    message: 'CHECKOUT',
  });
};

export default (
  schema: { [key: string]: any },
  req: Request,
  res:Response,
) => {
  return {
    GET() {
      return res.status(406)
        .send({
          error_code: 'CKT101',
          message: 'GET is acceptable only to JSON schema, at /@checkout/schema',
        });
    },
    POST() {
      const validate = ajv.compile(schema);
      const ip = req.headers['x-real-ip'];
      if (!req.body.browser_ip && ip) {
        req.body.browser_ip = ip;
      }
      runCheckout(req.body, res, validate);
    },
  };
};
