import type { Request, Response } from 'firebase-functions';
import { error } from 'firebase-functions/logger';
import api from '@cloudcommerce/api';
import renderCatalog from './render-catalog';
import renderSitemap from './render-sitemap';

const fetchProducts = async (page = 1) => {
  const limit = 300;
  const offset = limit * (page - 1);
  const {
    data: {
      result: products,
      meta: { count },
    },
  } = await api.get('products', {
    limit,
    offset,
    count: true,
    params: {
      visible: true,
    },
    fields: [
      '_id',
      'name',
      'sku',
      'slug',
      'available',
      'quantity',
      'min_quantity',
      'production_time',
      'pictures',
      'currency_id',
      'price',
      'base_price',
      'category_tree',
      'categories.0.name',
      'brands.0.name',
      'google_product_category_id',
      'gtin',
      'mpn',
      'adult',
      'condition',
      'weight',
      'dimensions',
      'specifications',
      'variations',
      'short_description',
      'body_html',
    ] as const,
  });
  return {
    products,
    nextPage: (count && count > offset + limit) ? page + 1 : null,
  };
};

export type FeedProducts = Awaited<ReturnType<typeof fetchProducts>>['products'];

const products: FeedProducts = [];
const fetchAllProducts = async () => {
  let page: number | null = 1;
  while (page) {
    const {
      products: _products,
      nextPage,
      // eslint-disable-next-line no-await-in-loop
    } = await fetchProducts(page);
    page = nextPage;
    _products.forEach((product) => products.push(product));
  }
};

const fetching = new Promise((resolve, reject) => {
  fetchAllProducts().then(resolve).catch(reject);
});

const serveFeeds = async (req: Request, res: Response) => {
  const { method, url } = req;
  if (method !== 'GET') {
    res.sendStatus(405);
    return;
  }
  try {
    await fetching;
  } catch (err) {
    error(err);
    res.sendStatus(500);
    return;
  }
  res.set('Content-Type', 'application/xml; charset=UTF-8');
  res.set('Cache-Control', 'public, max-age=600, s-maxage=900');
  res.set('Content-Security-Policy', "default-src 'self'");
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-XSS-Protection', '1; mode=block');
  res.set('X-Frame-Options', 'DENY');
  switch (url) {
    case '/_feeds/catalog.xml':
    case '/catalog.xml':
      await renderCatalog(req, res, products);
      break;
    case '/sitemap-catalog.xml':
      await renderSitemap(req, res, products);
      break;
    case '/sitemap':
    case '/sitemap.xml':
      res.redirect(302, '/sitemap-catalog.xml');
      break;
    default:
      res.sendStatus(404);
  }
};

export default serveFeeds;
