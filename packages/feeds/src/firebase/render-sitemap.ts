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
  const fetchingSearchHistory = api.get('search/v1/history', {
    limit: 1000,
  });

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  const searchTermSlugs: string[] = [];
  (await fetchingSearchHistory).data.result.forEach((searchEntry) => {
    if (searchEntry.hits_count && searchEntry.hits_count > 2) {
      const slug = encodeURIComponent(searchEntry.terms.join(' ').toLowerCase());
      if (slug.length < 3) return;
      const regex = new RegExp(`^${slug}(?!%20)`);
      if (searchTermSlugs.find((_slug) => regex.test(_slug))) return;
      searchTermSlugs.push(slug);
    }
  });
  searchTermSlugs.forEach((slug) => {
    xml += `
    <url>
      <loc>https://${domain}/s/${slug}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`;
  });
  const { data: { result: categories } } = await fetchingCategories;
  const { data: { result: brands } } = await fetchingBrands;
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
