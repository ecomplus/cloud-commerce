import type { Request, Response } from 'firebase-functions';
import type { FeedProducts } from './serve-feeds';

const renderSitemap = async (req: Request, res: Response, products: FeedProducts) => {
  if (products) {
    res.sendStatus(202);
    return;
  }
  res.sendStatus(400);
};

export default renderSitemap;
