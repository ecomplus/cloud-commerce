import type { Request, Response } from 'firebase-functions';
import type { FeedProducts } from './serve-feeds';
import config from '@cloudcommerce/firebase/lib/config';

const renderCatalog = async (req: Request, res: Response, products: FeedProducts) => {
  const {
    storeId,
    settingsContent: { domain, name },
  } = config.get();
  const title = `Products feed - ${name}`;
  const isSkipVariations = !!req.query.skip_variations;
  const discount = Number(req.query.discount) || 0;
  let querystring = req.query.qs ? String(req.query.qs) : '?_=feed';
  if (querystring.charAt(0) !== '?') {
    querystring = `?${querystring}`;
  }
  let propsSet: Record<string, any> = {};
  if (typeof req.query.set_properties === 'string') {
    try {
      propsSet = JSON.parse(req.query.set_properties);
      if (typeof propsSet !== 'object' || !propsSet) {
        throw new Error('Invalid');
      }
    } catch {
      res.sendStatus(400);
      return;
    }
  }
  const isFacebook = (req.get('User-Agent') || '').includes('facebook');

  let xml = `<?xml version="1.0"?>
  <feed xmlns="http://www.w3.org/2005/Atom" xmlns:g="http://base.google.com/ns/1.0">
    <title><![CDATA[${title}]]></title>
    <link href="https://${domain}/" rel="alternate" type="text/html"/>
    <updated>${new Date().toISOString()}</updated>
    <id><![CDATA[#${storeId},${Math.random()}]]></id>
    <author>
      <name>e-com.plus Cloud Commerce</name>
    </author>`;

  const convertProduct = (p: (typeof products)[0], groupId?: string) => {
    if (p.name) {
      const entry: Record<string, any> = {
        id: p.sku || p._id,
        title: p.name,
        item_group_id: groupId,
        google_product_category: p.google_product_category_id,
      };
      if (p.short_description) {
        entry.description = p.short_description;
      } else if (p.body_html) {
        entry.description = p.body_html
          .replace(/<style\b[^>]*>.*?<\/style>/isg, '')
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, '');
      } else {
        entry.description = p.name;
      }
      if (p.slug) {
        entry.link = `https://${domain}/${p.slug}${querystring}`;
        if (groupId) entry.link += `&amp;var=${p._id}`;
        if (discount > 0) entry.link += `&amp;discount=${discount}`;
      }
      if (
        (p.quantity === undefined || p.quantity)
        && (!p.min_quantity || p.quantity! >= p.min_quantity)
      ) {
        entry.availability = 'in stock';
      } else {
        entry.availability = 'out of stock';
      }
      if (p.production_time?.days) {
        entry.min_handling_time = p.production_time.days;
        if (p.production_time.max_time) {
          entry.max_handling_time = p.production_time.max_time;
        }
      }
      if (p.pictures?.length) {
        const additionalImages: string[] = [];
        for (let i = 0; i < p.pictures.length && i < 10; i++) {
          const picture = p.pictures[i];
          let img = picture.zoom?.url || picture.big?.url || picture.normal?.url;
          if (img) {
            img = img.replace(
              /(\w+\.)?(ecoms\d)\.com/i,
              '$2-nyc3.nyc3.cdn.digitaloceanspaces.com',
            );
            if (!entry.image_link) {
              entry.image_link = img;
            } else {
              additionalImages.push(img);
            }
          }
        }
        if (additionalImages.length) {
          entry.additional_image_link = additionalImages;
        }
      }
      if (p.price) {
        if (p.base_price && p.base_price > p.price) {
          entry.price = `${p.base_price} ${p.currency_id}`;
          entry.sale_price = (p.price * (1 - discount)).toFixed(2) + ` ${p.currency_id}`;
        } else {
          entry.price = (p.price * (1 - discount)).toFixed(2) + ` ${p.currency_id}`;
        }
      }
      if (p.category_tree) {
        entry.product_type = p.category_tree;
      } else if (p.categories?.length) {
        entry.product_type = p.categories[0].name;
      }
      let isIdentifierExists = false;
      if (p.brands?.length) {
        isIdentifierExists = true;
        entry.brand = p.brands[0].name;
      }
      (['gtin', 'mpn'] as const).forEach((field) => {
        const codes = p[field];
        if (Array.isArray(codes) && codes.length) {
          entry[field] = codes[0];
          isIdentifierExists = true;
        }
      });
      entry.identifier_exists = isIdentifierExists ? 'yes' : 'no';
      if (p.adult) {
        entry.adult = 'yes';
      }
      if (p.condition) {
        entry.condition = p.condition !== 'not_specified' ? p.condition : 'new';
      }
      if (p.weight) {
        entry.shipping_weight = `${p.weight.value} ${p.weight.unit || ''}`;
      }
      if (p.dimensions && !isFacebook) {
        (['length', 'width', 'height'] as const).forEach((side) => {
          const dimension = p.dimensions![side];
          if (dimension) {
            entry[`shipping_${side}`] = `${dimension.value} ${dimension.unit || ''}`;
          }
        });
      }
      if (p.specifications) {
        let customLabel = 0;
        Object.keys(p.specifications).forEach((spec) => {
          const values = p.specifications![spec];
          if (!values.length) return;
          const [val] = values;
          /* eslint-disable no-case-declarations */
          switch (spec) {
            case 'energy_efficiency_class':
            case 'age_group':
            case 'gender':
            case 'size_type':
            case 'size_system':
              entry[spec] = val.value || val.text;
              break;
            case 'size':
            case 'pattern':
            case 'material':
              entry[spec] = val.text;
              break;
            case 'colors':
            case 'color':
            case 'cor':
            case 'cores':
              let colors = val.text.replace(/[/]/g, ' ');
              for (let i = 1; i < values.length; i++) {
                colors += `/${values[i].text.replace(/[/]/g, ' ')}`;
              }
              entry.color = colors;
              break;
            default:
              let commonSpec: string | null = null;
              let fixedText = val.value || val.text;
              switch (fixedText.toLowerCase()) {
                case 'm':
                case 'l':
                case 'g':
                case 's':
                case 'p':
                case 'xs':
                case 'pp':
                case 'xl':
                case 'gg':
                case 'xxl':
                case 'xg':
                case 'u':
                case 'Único':
                case 'unico':
                  commonSpec = 'size';
                  break;
                case 'adult':
                case 'adulto':
                case 'kids':
                case 'criança':
                case 'infant':
                case 'infantil':
                case 'newborn':
                case 'recém-nascido':
                case 'toddler':
                  commonSpec = 'age_group';
                  break;
                case 'male':
                case 'masculino':
                case 'female':
                case 'feminino':
                case 'unisex':
                  commonSpec = 'gender';
                  break;
                case 'homem':
                  commonSpec = 'gender';
                  fixedText = 'male';
                  break;
                case 'mulher':
                  commonSpec = 'gender';
                  fixedText = 'female';
                  break;
                default:
                  if (customLabel < 5) {
                    entry[`custom_label_${customLabel}`] = val.text;
                    customLabel += 1;
                  }
                  break;
              }
              if (commonSpec !== null && !entry[commonSpec]) {
                entry[commonSpec] = fixedText;
              }
              break;
          }
        });
      }
      Object.keys(propsSet).forEach((key) => {
        entry[key] = propsSet[key];
      });

      xml += `
      <entry>`;
      Object.keys(entry).forEach((key) => {
        const val = entry[key];
        if (val === undefined || val === null) return;
        if (typeof val === 'object' && val) {
          Object.keys(entry).forEach((nKey) => {
            const nested = val[nKey];
            xml += `<g:${key}><![CDATA[${nested}]]></g:${key}>`;
          });
          return;
        }
        if (key === 'link') {
          xml += `<g:${key}><!--${p._id}-->${val}</g:${key}>`;
          return;
        }
        xml += `<g:${key}><![CDATA[${val}]]></g:${key}>`;
      });
      xml += `
      </entry>`;

      if (p.variations && !isSkipVariations) {
        p.variations.forEach((variation) => {
          const mergedItem = { ...p, ...variation };
          if (p.specifications) {
            mergedItem.specifications = {
              ...p.specifications,
              ...variation.specifications,
            };
          }
          if (!variation.sku && p.sku) {
            mergedItem.sku = `${p.sku}-${Math.ceil(Math.random() * 1000)}`;
          }
          if (variation.picture_id && p.pictures) {
            const picture = p.pictures.find(({ _id }) => _id === variation.picture_id);
            if (picture) mergedItem.pictures = [picture];
          }
          delete mergedItem.variations;
          convertProduct(mergedItem as any, entry.id);
        });
      }
    }
  };

  products.forEach((p) => convertProduct(p));
  xml += `
  </feed>`;
  res.send(xml);
};

export default renderCatalog;
