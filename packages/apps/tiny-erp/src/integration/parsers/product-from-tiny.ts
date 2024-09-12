import type { Products, ProductSet } from '@cloudcommerce/types';
import { logger } from '@cloudcommerce/firebase/lib/config';
import axios from 'axios';
import ecomUtils from '@ecomplus/utils';
import getEnv from '@cloudcommerce/firebase/lib/env';

const removeAccents = (str: string) => str.replace(/áàãâÁÀÃÂ/g, 'a')
  .replace(/éêÉÊ/g, 'e')
  .replace(/óõôÓÕÔ/g, 'o')
  .replace(/íÍ/g, 'e')
  .replace(/úÚ/g, 'u')
  .replace(/çÇ/g, 'c');

const tryImageUpload = (
  originImgUrl: string,
  product: Products,
  index?: number,
) => new Promise((resolve) => {
  const {
    storeId,
    apiAuth: {
      authenticationId,
      apiKey,
    },
  } = getEnv();
  axios.get(originImgUrl, {
    responseType: 'arraybuffer',
  }).then(({ data, headers }) => {
    const formData = new FormData();
    formData.append('file', new Blob(data), originImgUrl.replace(/.*\/([^/]+)$/, '$1'));

    return axios.post(`https://apx-storage.e-com.plus/${storeId}/api/v1/upload.json`, formData, {
      headers: {
        'Content-Type': headers['Content-Type'],
        'Content-Length': headers['Content-Length'],
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
    if (index === 0 || index) {
      // @ts-ignore
      product.pictures[index] = picture;
    } else {
      // @ts-ignore
      product.pictures.push(picture);
    }
  }
  return picture;
});

export default (
  tinyProduct,
  tipo?:string,
  isNew = true,
): Promise<ProductSet> => new Promise((resolve) => {
  const sku = tinyProduct.codigo || String(tinyProduct.id);
  const name = (tinyProduct.nome || sku).trim();
  const isProduct = tipo === 'produto';
  const fixToNumber = (shouldBeNumber: any) => {
    return Number(shouldBeNumber) > 0 ? Number(shouldBeNumber) : 0;
  };
  const price = fixToNumber(tinyProduct.preco_promocional || tinyProduct.precoPromocional)
    || fixToNumber(tinyProduct.preco);
  const product: ProductSet = {
    available: tinyProduct.situacao === 'A',
    sku,
    name,
    price,
    base_price: fixToNumber(tinyProduct.preco),
    body_html: tinyProduct.descricao_complementar || tinyProduct.descricaoComplementar,
  };
  const costPrice = fixToNumber(tinyProduct.preco_custo || tinyProduct.precoCusto);
  if (costPrice) {
    product.cost_price = costPrice;
  }
  if (tinyProduct.estoqueAtual) {
    product.quantity = tinyProduct.estoqueAtual;
  }

  if (isNew) {
    if (tinyProduct.seo) {
      if (tinyProduct.seo.slug && tinyProduct.seo.slug.length) {
        product.slug = tinyProduct.seo.slug.trim();
      }
      if (tinyProduct.seo.title && tinyProduct.seo.title.length) {
        product.meta_title = tinyProduct.seo.title.slice(0, 254);
      }
      if (tinyProduct.seo.description && tinyProduct.seo.description.length) {
        product.meta_description = tinyProduct.seo.description.slice(0, 999);
      }
      if (tinyProduct.seo.keywords && tinyProduct.seo.keywords.length) {
        product.keywords = tinyProduct.seo.keywords.split(',');
      }
    }
    product.slug = removeAccents(product.slug || name.toLowerCase())
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_./]/g, '');
    if (!/[a-z0-9]/.test(product.slug.charAt(0))) {
      product.slug = `p-${product.slug}`;
    }
  }
  if (tinyProduct.garantia) {
    product.warranty = tinyProduct.garantia;
  }
  if (tinyProduct.unidade_por_caixa || tinyProduct.unidadePorCaixa) {
    const minQnt = fixToNumber(tinyProduct.unidade_por_caixa || tinyProduct.unidadePorCaixa);
    if (minQnt > 0) {
      product.min_quantity = minQnt;
    }
  }
  if (tinyProduct.ncm) {
    product.mpn = [tinyProduct.ncm];
  }
  const validateGtin = (gtin) => {
    return typeof gtin === 'string' && /^([0-9]{8}|[0-9]{12,14})$/.test(gtin);
  };
  if (validateGtin(tinyProduct.gtin)) {
    product.gtin = [tinyProduct.gtin];
    if (validateGtin(tinyProduct.gtin_embalagem || tinyProduct.gtinEmbalagem)) {
      product.gtin.push(tinyProduct.gtin_embalagem || tinyProduct.gtinEmbalagem);
    }
  }

  const weight = !isProduct
    ? (tinyProduct.peso_bruto || tinyProduct.peso_liquido)
    : (tinyProduct.pesoBruto || tinyProduct.pesoLiquido);
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
      tinyProduct.variacoes.forEach(({ variacaoObj }) => {
        const variacao = !isProduct ? variacaoObj.variacao : variacaoObj;
        const {
          codigo,
          preco,
          grade,
          estoqueAtual,
          anexos,
        } = variacao;
        const gridIdFormat = (text) => {
          return removeAccents(text.toLowerCase())
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '')
            .substring(0, 30)
            .padStart(2, 'i');
        };

        const specifications = {};
        const specTexts: string[] = [];
        if (grade && typeof grade === 'object') {
          Object.keys(grade).forEach((tipoGrade) => {
            if (grade[tipoGrade]) {
              const gridId = gridIdFormat(tipoGrade);
              const spec = {
                text: grade[tipoGrade],
              };
              specTexts.push(spec.text);
              if (gridId !== 'colors') {
                Object.assign(
                  spec,
                  {
                    value: removeAccents(spec.text.toLowerCase()).substring(0, 100),
                  },
                );
              }
              specifications[gridId] = [spec];
            }
          });
        } else if (Array.isArray(grade)) {
          grade.forEach((gd) => {
            const gridId = gridIdFormat(gd.chave);
            const spec = {
              text: gd.valor,
            };
            specTexts.push(spec.text);
            if (gridId !== 'colors') {
              Object.assign(
                spec,
                {
                  value: removeAccents(spec.text.toLowerCase()).substring(0, 100),
                },
              );
            }
            specifications[gridId] = [spec];
          });
        }
        let pictureId = 0;
        if (Array.isArray(anexos) && Array.isArray(tinyProduct.anexos)) {
          pictureId = tinyProduct.anexos.length;
          anexos.forEach((anexo) => tinyProduct.anexos.push(anexo));
        }
        if (specTexts.length) {
          product.variations?.push({
            _id: ecomUtils.randomObjectId(),
            name: `${name} / ${specTexts.join(' / ')}`.substring(0, 100),
            sku: codigo,
            specifications,
            price: parseFloat(preco) !== price ? parseFloat(preco) : undefined,
            quantity: estoqueAtual,
            // @ts-expect-error: `picture_id` will be replaced
            picture_id: pictureId,
          });
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
              _id: ecomUtils.randomObjectId(),
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
      tinyProduct.anexos.forEach((anexo) => {
        let url;
        if (anexo && anexo.anexo) {
          url = anexo.anexo;
        } else if (anexo.url) {
          url = anexo.url;
        }
        if (typeof url === 'string' && url.startsWith('http')) {
          promises.push(tryImageUpload(anexo, product as Products));
        }
      });
      Promise.all(promises).then((images) => {
        if (Array.isArray(product.variations) && product.variations.length) {
          product.variations.forEach((variation) => {
            if (typeof variation.picture_id === 'number') {
              const variationImage = images[variation.picture_id];
              if (variationImage._id) {
                variation.picture_id = variationImage._id;
              } else {
                delete variation.picture_id;
              }
            }
          });
        }
        return resolve(product);
      });
      return;
    }
  }

  resolve(product);
});
