import type { Request, Response } from 'firebase-functions';

export default (req: Request, res: Response) => {
  const { method } = req;
  if (method !== 'GET') {
    res.sendStatus(405);
    return;
  }
  res.sendStatus(202);
};
