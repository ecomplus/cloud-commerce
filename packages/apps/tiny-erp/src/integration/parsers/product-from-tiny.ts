import type { ResourceId, Products } from '@cloudcommerce/types';
import logger from 'firebase-functions/logger';
import axios from 'axios';
import FormData from 'form-data';
import ecomUtils from '@ecomplus/utils';
import getEnv from '@cloudcommerce/firebase/lib/env';

const removeAccents = (str: string) => str.replace(/áàãâÁÀÃÂ/g, 'a')
  .replace(/éêÉÊ/g, 'e')
  .replace(/óõôÓÕÔ/g, 'o')
  .replace(/íÍ/g, 'e')
  .replace(/úÚ/g, 'u')
  .replace(/çÇ/g, 'c');

const tryImageUpload = (originImgUrl: string, product: Products) => new Promise((resolve) => {
  const {
    storeId,
    apiAuth: {
      authenticationId,
      apiKey,
    },
  } = getEnv();
  axios.get(originImgUrl, {
    responseType: 'arraybuffer',
  }).then(({ data }) => {
    const form = new FormData();
    form.append('file', Buffer.from(data), originImgUrl.replace(/.*\/([^/]+)$/, '$1'));

    return axios.post(`https://apx-storage.e-com.plus/${storeId}/api/v1/upload.json`, form, {
      headers: {
        ...form.getHeaders(),
        'X-Store-ID': storeId,
        'X-My-ID': authenticationId,
        'X-API-Key': apiKey,
      },
    }).then(({ data: { picture }, status }) => {
      if (picture) {
        Object.keys(picture).forEach((imgSize) => {
          if (picture[imgSize]) {
            if (!picture[imgSize].url) {
              delete picture[imgSize];
              return;
            }
            if (picture[imgSize].size !== undefined) {
              delete picture[imgSize].size;
            }
            picture[imgSize].alt = `${product.name} (${imgSize})`;
          }
        });
        if (Object.keys(picture).length) {
          return resolve({
            _id: ecomUtils.randomObjectId(),
            ...picture,
          });
        }
      }
      const err: any = new Error('Unexpected Storage API response');
      err.response = { data, status };
      throw err;
    });
  })

    .catch((err) => {
      logger.error(err);
      resolve({
        _id: ecomUtils.randomObjectId(),
        normal: {
          url: originImgUrl,
          alt: product.name,
        },
      });
    });
}).then((picture) => {
  if (product && product.pictures) {
    // @ts-ignore
    product.pictures.push(picture);
  }
  return picture;
});

export default (tinyProduct, isNew = true) => new Promise((resolve) => {
  const sku = tinyProduct.codigo || String(tinyProduct.id);
  const name = (tinyProduct.nome || sku).trim();
  const product: Omit<Products, '_id'| 'store_id' | 'created_at' | 'updated_at'> = {
    available: tinyProduct.situacao === 'A',
    sku,
    name,
    cost_price: tinyProduct.preco_custo,
    price: tinyProduct.preco_promocional || tinyProduct.preco,
    base_price: tinyProduct.preco,
    body_html: tinyProduct.descricao_complementar,
  };

  if (isNew) {
    product.slug = removeAccents(name.toLowerCase())
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_./]/g, '');
    if (!/[a-z0-9]/.test(product.slug.charAt(0))) {
      product.slug = `p-${product.slug}`;
    }
  }
  if (tinyProduct.garantia) {
    product.warranty = tinyProduct.garantia;
  }
  if (tinyProduct.unidade_por_caixa) {
    product.min_quantity = Number(tinyProduct.unidade_por_caixa);
  }
  if (tinyProduct.ncm) {
    product.mpn = [tinyProduct.ncm];
  }
  const validateGtin = (gtin) => {
    return typeof gtin === 'string' && /^([0-9]{8}|[0-9]{12,14})$/.test(gtin);
  };
  if (validateGtin(tinyProduct.gtin)) {
    product.gtin = [tinyProduct.gtin];
    if (validateGtin(tinyProduct.gtin_embalagem)) {
      product.gtin.push(tinyProduct.gtin_embalagem);
    }
  }

  const weight = tinyProduct.peso_bruto || tinyProduct.peso_liquido;
  if (weight > 0) {
    product.weight = {
      unit: 'kg',
      value: parseFloat(weight),
    };
  }
  [
    ['largura', 'width'],
    ['altura', 'height'],
    ['comprimento', 'length'],
  ].forEach(([lado, side]) => {
    const dimension = tinyProduct[`${lado}_embalagem`] || tinyProduct[`${lado}Embalagem`];
    if (dimension > 0) {
      if (!product.dimensions) {
        product.dimensions = {};
      }
      product.dimensions[side] = {
        unit: 'cm',
        value: parseFloat(dimension),
      };
    }
  });

  if (isNew) {
    if (Array.isArray(tinyProduct.variacoes) && tinyProduct.variacoes.length) {
      product.variations = [];
      tinyProduct.variacoes.forEach(({ variacao }) => {
        const { codigo, preco, grade } = variacao;
        if (grade && typeof grade === 'object') {
          const specifications = {};
          const specTexts: string[] = [];
          Object.keys(grade).forEach((tipo) => {
            if (grade[tipo]) {
              const gridId = removeAccents(tipo.toLowerCase())
                .replace(/\s+/g, '_')
                .replace(/[^a-z0-9_]/g, '')
                .substring(0, 30)
                .padStart(2, 'i');
              const spec: Record<string, string> = {
                text: grade[tipo],
              };
              specTexts.push(spec.text);
              if (gridId !== 'colors') {
                spec.value = removeAccents(spec.text.toLowerCase()).substring(0, 100);
              }
              specifications[gridId] = [spec];
            }
          });

          if (specTexts.length) {
            product.variations?.push({
              _id: ecomUtils.randomObjectId() as ResourceId,
              name: `${name} / ${specTexts.join(' / ')}`.substring(0, 100),
              sku: codigo,
              specifications,
              price: parseFloat(preco || 0),
            });
          }
        }
      });
    }

    if (Array.isArray(tinyProduct.imagens_externas)) {
      product.pictures = [];
      tinyProduct.imagens_externas.forEach((imagemExterna) => {
        if (imagemExterna.imagem_externa) {
          const { url } = imagemExterna.imagem_externa;
          if (url) {
            product.pictures?.push({
              normal: { url },
              _id: ecomUtils.randomObjectId() as ResourceId,
            });
          }
        }
      });
    }

    if (tinyProduct.anexos) {
      if (!product.pictures) {
        product.pictures = [];
      }
      const promises: Promise<any>[] = [];
      tinyProduct.anexos.forEach(({ anexo }) => {
        if (typeof anexo === 'string' && anexo.startsWith('http')) {
          promises.push(tryImageUpload(anexo, product as Products));
        }
      });
      Promise.all(promises).then(() => resolve(product));
      return;
    }
  }

  resolve(product);
});
