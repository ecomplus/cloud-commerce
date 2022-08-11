import type { Request, Response } from 'firebase-functions';
// eslint-disable-next-line import/no-unresolved
import type { Auth } from 'firebase-admin/auth';
// eslint-disable-next-line import/no-unresolved
import type { Firestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import {
  sendError,
  getAuthCustomerApi,
} from './handle-passport';

export default async (
  req: Request,
  res: Response,
  apiAuth: { authenticationId: string, apiKey: string },
  firestore: Firestore,
  authFirebase: Auth,
  storeId: number,
) => {
  const { method } = req;
  if (method !== 'POST') {
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
  const endpoint = url.split('/')[1];
  // endpoint /token
  if (endpoint === 'token' && method === 'POST') {
    const { authtoken } = req.body;
    if (!firestore) {
      return sendError(res, 'Firestore not found', 500);
    } if (storeId < 100) {
      return sendError(res, 'Invalid store');
    }
    try {
      const authCustomerApi = await getAuthCustomerApi(
        firestore,
        apiAuth,
        authtoken,
        authFirebase,
      );
      if (authCustomerApi !== null) {
        return res.send(authCustomerApi);
      }
      return sendError(res, 'Invalid token, unauthorized', 401);
    } catch (e) {
      logger.error(e);
      return sendError(res);
    }
  } else {
    return res.sendStatus(400);
  }
};
