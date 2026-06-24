import type { Request, Response } from 'firebase-functions/v1';
import config, { logger } from '@cloudcommerce/firebase/lib/config';
import { schemas } from '../index';
import handleModule from './handle-module';
import checkout from './checkout';
import antiFraudRateLimit from './antifraud-rate-limit';

export default async (req: Request, res: Response) => {
  const { method } = req;
  if (method !== 'POST' && method !== 'GET') {
    return res.sendStatus(405);
  }
  if (
    method === 'POST'
    && (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))
  ) {
    return res.sendStatus(400);
  }

  let { url } = req;
  [url] = url.split('?');
  if (url.endsWith('.json')) {
    url = url.slice(0, -5);
  }
  url = url.replace('/_api/modules', ''); // due to hosting rewrite
  const modName = url.split('/')[1];

  const sendSchema = (isResponseSchema = false) => {
    return res.status(200)
      .setHeader('Cache-Control', 'public, max-age=3600')
      .send(schemas[modName][isResponseSchema ? 'response' : 'params']);
  };

  if (modName === '@checkout') {
    if (url === '/@checkout') {
      if (method === 'GET') {
        return res.status(405)
          .send({
            error_code: 'CKT101',
            message: 'GET is acceptable only to JSON schema, at /@checkout/schema',
          });
      }
      const { checkoutAntiFraud } = config.get();
      if (checkoutAntiFraud !== false) {
        let blocked = false;
        try {
          ({ blocked } = await antiFraudRateLimit(
            req,
            typeof checkoutAntiFraud === 'object' ? checkoutAntiFraud : {},
          ));
        } catch (err) {
          logger.warn('Anti-fraud guard threw, allowing checkout', { err });
        }
        if (blocked) {
          return res.status(429).json({
            error_code: 'CKT429',
            message: 'Too many checkout attempts. Try again later.',
          });
        }
      }

      return checkout(req, res);
    }
    if (url === '/@checkout/schema') {
      return sendSchema();
    }
    return res.sendStatus(404);
  }

  if (schemas[modName]) {
    const { params: schema, response: responseSchema } = schemas[modName];
    if (!schema.$schema) {
      schema.$schema = 'http://json-schema.org/draft-07/schema#';
      schema.title = `Module \`${modName}\`: Params model`;
    }
    if (!responseSchema.$schema) {
      responseSchema.$schema = 'http://json-schema.org/draft-07/schema#';
      responseSchema.title = `Module \`${modName}\`: App response model`;
    }
    if (url === `/${modName}/schema`) {
      return sendSchema();
    }
    if (url === `/${modName}/response_schema`) {
      return sendSchema(true);
    }
    if (url === `/${modName}`) {
      return handleModule(modName, schema, responseSchema, req, res)[method]();
    }
  }
  return res.sendStatus(404);
};
