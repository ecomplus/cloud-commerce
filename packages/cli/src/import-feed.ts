import type { Products } from '@cloudcommerce/api/types';
import {
  argv,
  fs,
  echo,
} from 'zx';
import { XMLParser } from 'fast-xml-parser';
import api from '@cloudcommerce/api';

const clearAccents = (str: string) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};
const slugify = (name: string) => {
  return clearAccents(name).toLocaleLowerCase()
    .replace(/[\s\n/]/g, '-')
    .replace(/[^a-z0-9_-]/ig, '');
};

const importFeed = async () => {
  const feedFilepath = typeof argv.feed === 'string' ? argv.feed : '';
  if (!feedFilepath) {
    await echo`You must specify XML file to import with --feed= argument`;
    return process.exit(1);
  }
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
  });
  const json = parser.parse(fs.readFileSync(argv.feed, 'utf8'));
  const items: Array<Partial<{
    'g:id': string,
    'g:title': string,
    'g:description': string,
    'g:link': `https://www.ladofit.com.br/${string}?${string}`,
    'g:image_link': string,
    'g:condition': 'new' | 'refurbished' | 'used',
    'g:shipping_weight': `${string} g` | `${string} kg`,
    'g:additional_image_link': string[],
    'g:product_type': string,
    'g:availability': 'in stock' | 'out of stock' | 'preorder' | 'backorder',
    'g:price': `${string} BRL`,
    'g:sale_price': `${string} BRL`,
    'g:brand': string,
    'g:item_group_id': string,
    'g:color': string,
    'g:gender': 'male' | 'female' | 'unisex',
    'g:material': string,
    'g:pattern': string,
    'g:size': string,
    'g:size_system': string,
  }>> = json.rss?.channel?.item;
  if (!items?.[0] || typeof items?.[0] !== 'object') {
    await echo`The XML file does not appear to be a valid RSS 2.0 product feed`;
    return process.exit(1);
  }
  const categoryNames: string[] = [];
  const brandNames: string[] = [];
  items.forEach(async (item) => {
    const categoryName = item['g:product_type']?.split('>').pop()?.trim();
    if (categoryName && !categoryNames.includes(categoryName)) {
      categoryNames.push(categoryName);
    }
    const brandName = item['g:brand']?.trim();
    if (brandName && !brandNames.includes(brandName)) {
      brandNames.push(brandName);
    }
  });
  const categories: Exclude<Products['categories'], undefined> = [];
  /* eslint-disable no-await-in-loop */
  for (let i = 0; i < categoryNames.length; i++) {
    const categoryName = categoryNames[i];
    const { data: { result } } = await api.get('categories', {
      params: { name: categoryName },
      fields: [
        'name',
        'i18n',
        'slug',
        'parent',
        'ml_category_id',
        'google_product_category_id',
      ] as const,
    });
    if (result[0]) {
      categories.push(result[0]);
      continue;
    }
    const category = {
      name: categoryName,
      slug: slugify(categoryName),
    };
    const { data: { _id } } = await api.post('categories', category);
    categories.push({ ...category, _id });
  }
  const brands: Exclude<Products['brands'], undefined> = [];
  for (let i = 0; i < brandNames.length; i++) {
    const brandName = brandNames[i];
    const { data: { result } } = await api.get('brands', {
      params: { name: brandName },
      fields: [
        'name',
        'i18n',
        'slug',
        'logo',
      ] as const,
    });
    if (result[0]) {
      brands.push(result[0]);
      continue;
    }
    const brand = {
      name: brandName,
      slug: slugify(brandName),
    };
    const { data: { _id } } = await api.post('brands', brand);
    brands.push({ ...brand, _id });
  }
  await echo`\n\nCategories:`;
  for (let i = 0; i < categories.length; i++) {
    await echo`${categories[i].name} (${categories[i].slug})`;
  }
  await echo`\n\nBrands:`;
  for (let i = 0; i < brands.length; i++) {
    await echo`${brands[i].name} (${brands[i].slug})`;
  }
  return echo``;
};

export default importFeed;
