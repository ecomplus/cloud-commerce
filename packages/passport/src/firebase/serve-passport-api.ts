import type { Request, Response } from 'firebase-functions';
import { logger } from 'firebase-functions';
import { getAuthCustomerApi } from './handle-passport';

export default async (req: Request, res: Response) => {
  let { url } = req;
  if (url.endsWith('.json')) {
    url = url.slice(0, -5);
  }
  const endpoint = url.split('/')[1];
  if (endpoint !== 'token') {
    return res.sendStatus(404);
  }
  if (req.method === 'POST') {
    const { authToken } = req.body;
    try {
      const authCustomerApi = await getAuthCustomerApi(authToken);
      if (authCustomerApi !== null) {
        return res.send(authCustomerApi);
      }
      return res.status(401).json({
        status: 401,
        error: 'Invalid Firebase Auth token, unauthorized',
      });
    } catch (e) {
      logger.error(e);
      return res.sendStatus(500);
    }
  }
  return res.sendStatus(405);
};
