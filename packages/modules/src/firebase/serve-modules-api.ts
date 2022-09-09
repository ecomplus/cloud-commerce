import type { Request, Response } from 'firebase-functions';
import { schemas } from '../index';
import handleModule from './handle-module';

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
  const modNameAndQuery = url.split('/')[1].split('?');
  const modName = modNameAndQuery[0];

  const sendSchema = (isResponseSchema = false) => {
    return res.status(200)
      .setHeader('Cache-Control', 'public, max-age=3600')
      .send(schemas[modName][isResponseSchema ? 'response' : 'params']);
  };

  if (modName === '@checkout') {
    if (url === '/@checkout') {
      return res.status(200).send({
        status: 200,
        message: 'CHECKOUT',
      });
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
    if (url === `/${modName}` || url === `/${modName}?${modNameAndQuery[1]}`) {
      return handleModule(modName, schema, responseSchema, req, res);
    }
  }
  return res.sendStatus(404);
};
