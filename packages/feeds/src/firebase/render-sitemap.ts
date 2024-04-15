import type { Request, Response } from 'firebase-functions';
import type { FeedProducts } from './serve-feeds';
import api from '@cloudcommerce/api';
import config from '@cloudcommerce/firebase/lib/config';

const renderSitemap = async (req: Request, res: Response, products: FeedProducts) => {
  const {
    settingsContent: { domain },
  } = config.get();
  const fetchingCategories = api.get('categories', {
    limit: 3000,
    fields: ['slug'] as const,
  });
  const fetchingBrands = api.get('brands', {
    limit: 3000,
    fields: ['slug'] as const,
  });
  const { data: { result: categories } } = await fetchingCategories;
  const { data: { result: brands } } = await fetchingBrands;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  [...categories, ...brands].forEach(({ slug }) => {
    if (!slug) return;
    xml += `
    <url>
      <loc>https://${domain}/${slug}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`;
  });
  products.forEach(({ slug }) => {
    if (!slug) return;
    xml += `
    <url>
      <loc>https://${domain}/${slug}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
    </url>`;
  });
  xml += `
  </urlset>`;
  res.send(xml);
};

export default renderSitemap;
