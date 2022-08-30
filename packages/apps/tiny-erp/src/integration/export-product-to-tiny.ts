import type { Products } from '@cloudcommerce/types';
import api from '@cloudcommerce/api';
import postTiny from './post-tiny-erp';
import parseProduct from './parsers/product-to-tiny';

export default async (apiDoc, queueEntry, appData, canCreateNew) => {
  const productId = queueEntry.nextId;
  let product: Products;
  if (productId === apiDoc._id) {
    product = apiDoc;
  } else {
    try {
      product = (await api.get(`products/${productId}`)).data;
    } catch (err: any) {
      if (err.statusCode === 404) {
        const msg = `O produto ${productId} não existe (:${err.statusCode})`;
        const error: any = new Error(msg);
        error.isConfigError = true;
        return error;
      }
      throw err;
    }
  }

  let tinyData: { produtos?: any };
  try {
    tinyData = await postTiny('/produtos.pesquisa.php', {
      pesquisa: product.sku,
    });
  } catch (err: any) {
    if (err.response && err.response.status === 404) {
      tinyData = {};
    } else {
      throw err;
    }
  }

  const { produtos } = tinyData;
  let originalTinyProduct;
  if (Array.isArray(produtos)) {
    originalTinyProduct = produtos.find(({ produto }) => {
      return product.sku === String(produto.codigo);
    });
    if (originalTinyProduct) {
      originalTinyProduct = originalTinyProduct.produto;
    } else if (!canCreateNew) {
      return null;
    }
  }
  const tinyProduct = parseProduct(product, originalTinyProduct, appData);
  return tinyProduct
    ? postTiny(originalTinyProduct ? '/produto.alterar.php' : '/produto.incluir.php', {
      produto: {
        produtos: [{
          produto: tinyProduct,
        }],
      },
    })
    : null;
};
