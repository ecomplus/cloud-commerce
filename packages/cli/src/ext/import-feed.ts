import type { ProductSet } from '@cloudcommerce/api/types';
import {
  argv,
  fs,
  echo,
  sleep,
} from 'zx';
import { XMLParser } from 'fast-xml-parser';
import api from '@cloudcommerce/api';

type ProductVariation = Exclude<ProductSet['variations'], undefined>[0];

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
  const items: Array<{
    'g:id': string,
    'g:title': string,
    'g:description'?: string,
    'g:link'?: `https://www.ladofit.com.br/${string}?${string}`,
    'g:image_link'?: string,
    'g:condition'?: 'new' | 'refurbished' | 'used',
    'g:shipping_weight'?: `${string} g` | `${string} kg`,
    'g:additional_image_link'?: string[],
    'g:product_type'?: string,
    'g:availability'?: 'in stock' | 'out of stock' | 'preorder' | 'backorder',
    'g:price'?: `${string} BRL`,
    'g:sale_price'?: `${string} BRL`,
    'g:brand'?: string,
    'g:item_group_id'?: string,
    'g:color'?: string,
    'g:gender'?: 'male' | 'female' | 'unisex',
    'g:material'?: string,
    'g:pattern'?: string,
    'g:size'?: string,
    'g:size_system'?: string,
  }> = json.rss?.channel?.item?.filter?.((item: any) => {
    return item?.['g:id'] && item['g:title'];
  });
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
  const categories: Exclude<ProductSet['categories'], undefined> = [];
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
  const brands: Exclude<ProductSet['brands'], undefined> = [];
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
  await echo`\nCategories:`;
  for (let i = 0; i < categories.length; i++) {
    await echo`${categories[i].name} (${categories[i].slug})`;
  }
  await echo`\nBrands:`;
  for (let i = 0; i < brands.length; i++) {
    await echo`${brands[i].name} (${brands[i].slug})`;
  }
  const productItems = items.filter((item) => !item['g:item_group_id']);
  items.forEach((item) => {
    const parentSku = item['g:item_group_id'];
    if (!parentSku || productItems.find((i) => i['g:id'] === parentSku)) return;
    productItems.push({
      ...item,
      'g:id': parentSku,
      'g:title': item['g:title']?.replace(/\s[A-Z]{1,3}$/, ''),
      'g:description': item['g:title'] === item['g:description']
        ? undefined
        : item['g:description'],
    });
  });
  const productItemGroups: Array<typeof items> = [];
  for (let i = 0; i < productItems.length; i += 20) {
    productItemGroups.push(productItems.slice(i, i + 20));
  }
  for (let i = 0; i < productItemGroups.length; i++) {
    const { data: { result } } = await api.get('products', {
      params: {
        sku: productItemGroups[i].map(({ 'g:id': sku }) => sku),
      },
      fields: ['sku'] as const,
    });
    for (let ii = 0; ii < productItems.length; ii++) {
      if (result.find(({ sku }) => sku === productItems[ii]['g:id'])) {
        productItems.splice(ii, 1);
      }
    }
  }
  const setStockAndPrices = (
    productOrVatiation: ProductVariation | ProductSet,
    item: (typeof items)[0],
  ) => {
    productOrVatiation.quantity = item['g:availability'] === 'in stock' ? 100 : 0;
    const price = parseFloat(item['g:price'] || item['g:sale_price'] || '');
    if (price) {
      const salePrice = parseFloat(item['g:sale_price'] || '');
      productOrVatiation.price = salePrice || price;
      if (salePrice && salePrice < price) productOrVatiation.base_price = price;
    }
    if (item['g:shipping_weight']) {
      const [weight, unit] = item['g:shipping_weight'].split(' ');
      if (parseFloat(weight)) {
        productOrVatiation.weight = {
          value: parseFloat(weight),
          unit: unit === 'g' || unit === 'kg' ? unit : 'kg',
        };
      }
    }
  };
  const setSpecifications = (
    productOrVatiation: ProductVariation | ProductSet,
    item: (typeof items)[0],
    isProductItem = false,
  ) => {
    const specifications: (typeof productOrVatiation)['specifications'] = {};
    if (item['g:color']) {
      if (/[A-Z]{1,3}/.test(item['g:color'])) {
        item['g:size'] = item['g:color'];
        delete item['g:color'];
      } else {
        specifications.colors = [{ text: item['g:color'] }];
      }
    }
    ([
      'material',
      'pattern',
      'size',
      'size_system',
      'gender',
    ] as const).forEach((spec) => {
      if (!isProductItem && (spec === 'size_system' || spec === 'gender')) return;
      const text = item[`g:${spec}`];
      if (text) {
        specifications[spec] = [{ text }];
      }
    });
    if (Object.keys(specifications).length) {
      productOrVatiation.specifications = specifications;
    }
  };
  await echo`\n`;
  for (let i = 0; i < productItems.length; i++) {
    const item = productItems[i];
    const { 'g:id': sku, 'g:title': name } = item;
    if (!sku || !name) continue;
    await echo`SKU: ${sku}`;
    const product: ProductSet = {
      sku,
      name,
      slug: item['g:link']
        ? new URL(item['g:link']).pathname.substring(1)
        : slugify(name),
      condition: item['g:condition'],
    };
    const description = item['g:description']?.trim();
    if (description && description !== name) {
      product.body_html = description;
    }
    const categoryName = item['g:product_type']?.split('>').pop()?.trim();
    const category = categoryName && categories.find((c) => c.name === categoryName);
    if (category) {
      product.categories = [category];
    }
    const brandName = item['g:brand']?.trim();
    const brand = brandName && brands.find((b) => b.name === brandName);
    if (brand) {
      product.brands = [brand];
    }
    setStockAndPrices(product, item);
    const variationItems = items.filter((_item) => {
      return _item['g:item_group_id'] === sku;
    });
    if (variationItems.length) {
      let totalQuantity = 0;
      product.variations = [];
      variationItems.forEach((variationItem) => {
        const variation: ProductVariation = {
          sku: variationItem['g:id'],
          name: variationItem['g:title'],
          specifications: {},
        };
        (['g:shipping_weight', 'g:price', 'g:sale_price'] as const).forEach((field) => {
          if (item[field] === variationItem[field]) delete variationItem[field];
        });
        setStockAndPrices(variation, variationItem);
        totalQuantity += variation.quantity || 0;
        setSpecifications(variation, variationItem);
        product.variations!.push(variation);
      });
      product.quantity = totalQuantity;
    } else {
      setSpecifications(product, item, true);
    }
    await sleep(500);
    await echo`${JSON.stringify(product, null, 2)}`;
  }
  return echo``;
};

export default importFeed;
