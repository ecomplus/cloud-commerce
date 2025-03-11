import type { ProductSet } from '@cloudcommerce/api/types';
import {
  argv,
  fs,
  echo,
  sleep,
} from 'zx';
import { XMLParser } from 'fast-xml-parser';
import { imageSize } from 'image-size';
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

const uploadPicture = async (downloadUrl: string, authHeaders: Record<string, any>) => {
  const downloadRes = await fetch(downloadUrl);
  if (!downloadRes.ok) {
    throw new Error(`Failed downloading ${downloadUrl} with status ${downloadRes.status}`);
  }
  const contentType = downloadRes.headers.get('content-type');
  if (!contentType) {
    throw new Error(`No mime type returned for ${downloadUrl}`);
  }
  const imageBuffer = await downloadRes.arrayBuffer();
  const imageBlob = new Blob([imageBuffer], { type: contentType });
  const formData = new FormData();
  const fileName = downloadUrl.split('/').pop() || 'image.jpg';
  formData.append('file', imageBlob, fileName);
  const uploadRes = await fetch('https://ecomplus.app/api/storage/upload.json', {
    method: 'POST',
    body: formData,
    headers: authHeaders,
  });
  if (!uploadRes.ok) {
    const err: any = new Error(`Failed uploading ${downloadUrl} with ${uploadRes.status}`);
    err.statusCode = uploadRes.status;
    throw err;
  }
  const data = await uploadRes.json();
  const { width, height } = imageSize(Buffer.from(imageBuffer));
  const { picture } = data;
  if (width && height) {
    picture.zoom.size = `${width}x${height}`;
    Object.keys(picture).forEach((thumb) => {
      if (thumb === 'zoom' || !picture[thumb]) return;
      const px = parseInt(picture[thumb].size, 10);
      if (px) {
        if (px >= Math.max(width, height)) {
          picture[thumb].size = picture.zoom.size;
        } else {
          picture[thumb].size = width > height
            ? px + 'x' + Math.round((height * px) / width)
            : Math.round((width * px) / height) + 'x' + px;
        }
      } else {
        delete picture[thumb].size;
      }
    });
  } else {
    Object.keys(picture).forEach((thumb) => {
      if (!picture[thumb]) return;
      delete picture[thumb].size;
    });
  }
  if (fileName) {
    const alt = fileName.replace(/\.[^.]+$/, '');
    Object.keys(picture).forEach((thumb) => {
      if (!picture[thumb]) return;
      picture[thumb].alt = alt;
    });
  }
  return picture;
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
  const ecomAuthHeaders: Record<string, any> = {
    'X-Store-ID': process.env.ECOM_STORE_ID,
    'X-My-ID': process.env.ECOM_AUTHENTICATION_ID,
  };
  const { ECOM_ACCESS_TOKEN, ECOM_API_KEY } = process.env;
  if (ECOM_ACCESS_TOKEN) {
    ecomAuthHeaders['X-Access-Token'] = ECOM_ACCESS_TOKEN;
  } else {
    const { data } = await api.post('authenticate', {
      _id: process.env.ECOM_AUTHENTICATION_ID,
      api_key: ECOM_API_KEY,
    });
    ecomAuthHeaders['X-Access-Token'] = data.access_token;
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
        ii -= 1;
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
    } else if (!isProductItem) {
      productOrVatiation.specifications = {
        size: [{ text: 'Único' }],
      };
    }
  };
  const listItemRemoteImages = (item: (typeof items)[0]) => {
    const remoteImages = Array.isArray(item['g:additional_image_link'])
      ? item['g:additional_image_link']
      : [];
    if (item['g:image_link']) {
      remoteImages.unshift(item['g:image_link']);
    }
    if (typeof item['g:additional_image_link'] === 'string') {
      remoteImages.push(item['g:additional_image_link']);
    }
    return remoteImages;
  };
  for (let i = 0; i < productItems.length; i++) {
    const item = productItems[i];
    const { 'g:id': sku, 'g:title': name } = item;
    if (!sku || !name) continue;
    await echo`\n${new Date().toISOString()}`;
    await echo`${(productItems.length - i)} products to import\n`;
    await echo`SKU: ${sku}`;
    const product: ProductSet = {
      sku,
      name,
      slug: item['g:link']
        ? new URL(item['g:link']).pathname.substring(1).toLowerCase()
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
    const remoteImages = listItemRemoteImages(item);
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
        const variationRemoteImages = listItemRemoteImages(variationItem);
        variationRemoteImages.forEach((imageUrl) => {
          if (!remoteImages.includes(imageUrl)) remoteImages.push(imageUrl);
        });
      });
      product.quantity = totalQuantity;
    } else {
      setSpecifications(product, item, true);
    }
    if (remoteImages.length) {
      product.pictures = [];
    }
    for (let ii = 0; ii < remoteImages.length; ii++) {
      const imageUrl = remoteImages[ii];
      if (imageUrl) {
        let retries = 0;
        while (retries < 4) {
          try {
            const picture = await uploadPicture(imageUrl, ecomAuthHeaders);
            product.pictures?.push(picture);
            break;
          } catch (err: any) {
            // eslint-disable-next-line no-console
            console.error(err);
            if (err.statusCode < 500) {
              throw err;
            }
            retries += 1;
            await sleep(4000);
          }
        }
      }
    }
    await echo`${JSON.stringify(product, null, 2)}\n`;
    await api.post('products', product);
  }
  return echo``;
};

export default importFeed;
