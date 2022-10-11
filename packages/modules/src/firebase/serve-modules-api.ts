import type { Request, Response } from 'firebase-functions';
import { schemas } from '../index';
import handleModule from './handle-module';
import checkout from './checkout';

export default (req: Request, res: Response) => {
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
  if (url.endsWith('.json')) {
    url = url.slice(0, -5);
  }
  [url] = url.split('?');
  url = url.replace('/api/modules', ''); // due to hosting rewrite
  const modName = url.split('/')[1];

  console.log('url ', url, ' ', modName);

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
