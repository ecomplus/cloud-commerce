import type { Request, Response } from 'firebase-functions';
import type { ApiError } from '@cloudcommerce/api';
import { logger } from 'firebase-functions';
import authenticateCustomer from './authenticate-customer';

export default async (req: Request, res: Response) => {
  let { url } = req;
  if (url.endsWith('.json')) {
    url = url.slice(0, -5);
  }
  url = url.replace('/api/passport', ''); // due to hosting rewrite
  const endpoint = url.split('/')[1];

  if (endpoint !== 'token') {
    res.sendStatus(404);
    return;
  }
  const firebaseAuthToken = req.headers.authorization?.split(' ')[1];
  if (!firebaseAuthToken) {
    res.sendStatus(401);
    return;
  }
  try {
    const authCustomerApi = await authenticateCustomer(firebaseAuthToken);
    if (authCustomerApi !== null) {
      res.send(authCustomerApi);
      return;
    }
    res.status(401).json({
      status: 401,
      error: 'Invalid Firebase Auth token, unauthorized',
    });
  } catch (err) {
    logger.error(err);
    res.sendStatus((err as ApiError).statusCode || 500);
  }
};
