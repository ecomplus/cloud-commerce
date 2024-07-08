import type { Products } from '@cloudcommerce/types';
import logger from 'firebase-functions/logger';
import api from '@cloudcommerce/api';
import updateAppData from '@cloudcommerce/firebase/lib/helpers/update-app-data';
import postTiny from './post-tiny-erp';
import parseProduct from './parsers/product-from-tiny';

const importProduct = async (
  apiDoc,
  queueEntry,
  appData,
  canCreateNew = false,
  isHiddenQueue = false,
) => {
  const [queueSku, queueProductId] = String(queueEntry.nextId)
    .split(';:') as [Products['sku'], Products['_id'] | undefined];
  let product: Products | null = null;
  const { tinyStockUpdate } = queueEntry;
  try {
    const resourceFind = (queueProductId || `sku:${queueSku}` as const);
    product = (await api.get(`products/${resourceFind}`)).data;
  } catch (err: any) {
    if (err.statusCode !== 404) {
      throw err;
    }
    if (!queueProductId) {
      const currentSku = tinyStockUpdate?.produto?.codigo;
      if (currentSku) {
        try {
          product = (await api.get(`products/sku:${currentSku}`)).data;
        } catch {
          //
        }
      }
    }
  }
  let hasVariations: boolean = false;
  let variationId: string | undefined;
  if (product) {
    const { variations } = product;
    hasVariations = Boolean(variations && variations.length);
    if (hasVariations) {
      const variation = variations?.find(({ sku }) => queueSku === sku);
      if (variation) {
        variationId = variation._id;
      } else {
        logger.info(`SKU not found ${queueSku}`);
        if (!isHiddenQueue && !appData.update_product) {
          const msg = queueSku
            + ' corresponde a um produto com variações,'
            + ' especifique o SKU da variação para importar.';
          const err: any = new Error(msg);
          err.isConfigError = true;
          return err;
        }
        return null;
      }
    }
  }

  const handleTinyStock = ({ produto: produtoSaldo, tipo }, tinyProduct?: any) => {
    let quantity = Number(produtoSaldo.saldo);
    if (Number.isNaN(quantity)) {
      quantity = Number(produtoSaldo.estoqueAtual);
    }
    if (produtoSaldo.saldoReservado) {
      quantity -= Number(produtoSaldo.saldoReservado);
    }
    if (product && (!appData.update_product || variationId)) {
      if (!Number.isNaN(quantity)) {
        if (quantity < 0) {
          quantity = 0;
        }
        let endpoint = `products/${product._id}`;
        if (variationId) {
          endpoint += `variations/${variationId}`;
        }
        endpoint += '/quantity';
        logger.info(endpoint, { quantity });
        // @ts-ignore
        return api.put(endpoint, quantity);
      }
      return null;
    }

    if (!product && tinyProduct && tipo === 'produto') {
      if (!canCreateNew) {
        return null;
      }
      return parseProduct(tinyProduct, tipo, true)
        .then((bodyProduct) => {
          return api.post('products', bodyProduct);
        });
    }
    if (!tinyProduct) return null;

    return postTiny('/produto.obter.php', { id: (tinyProduct.id || produtoSaldo.id) })
      .then(({ produto }) => {
        let method;
        let endpoint;
        let productId = product && product._id;
        if (productId) {
          method = 'PATCH';
          endpoint = `products/${productId}`;
        } else if (canCreateNew) {
          method = 'POST';
          endpoint = 'products';
        } else {
          return null;
        }
        // @ts-ignore
        return parseProduct(produto, tipo, method === 'POST').then((parsedProduct: Products) => {
          if (!Number.isNaN(quantity)) {
            parsedProduct.quantity = quantity >= 0 ? quantity : 0;
          }
          logger.info(`${method} ${endpoint}`);
          const promise = api({
            method,
            endpoint,
            data: parsedProduct,
          });

          if (Array.isArray(produto.variacoes) && produto.variacoes.length) {
            if (!queueEntry.app) {
              logger.warn('Variations cannot be queued without `queueEntry.app`');
              return promise;
            }
            promise.then((response) => {
              let skus = appData.__importation && appData.__importation.skus;
              if (!Array.isArray(skus)) {
                skus = [];
              }
              let isQueuedVariations = false;
              produto.variacoes.forEach(({ variacao }) => {
                const { codigo } = variacao;
                let skuAndId = codigo;
                if (!productId) {
                  productId = response.data && response.data._id;
                }
                if (productId) {
                  skuAndId += `;:${productId}`;
                }
                if (!skus.includes(codigo) && !skus.includes(skuAndId)) {
                  isQueuedVariations = true;
                  skus.push(skuAndId);
                }
              });
              return isQueuedVariations
                ? updateAppData(queueEntry.app, {
                  __importation: {
                    ...appData.__importation,
                    skus,
                  },
                })
                : response;
            });
          }
          return promise;
        });
      });
  };

  logger.info(JSON.stringify({
    queueSku,
    queueProductId,
    hasVariations,
    variationId,
  }), { tinyStockUpdate });
  if (tinyStockUpdate && isHiddenQueue && (queueProductId || product?._id)) {
    return handleTinyStock(tinyStockUpdate as any, tinyStockUpdate.produto);
  }
  if (tinyStockUpdate?.tipo === 'produto' && !queueProductId) {
    return handleTinyStock({ produto: {}, tipo: 'produto' }, tinyStockUpdate.produto);
  }

  return postTiny('/produtos.pesquisa.php', { pesquisa: queueSku })
    .then(({ produtos }) => {
      if (Array.isArray(produtos)) {
        let tinyProduct = produtos.find(({ produto }) => queueSku === String(produto.codigo));
        if (tinyProduct) {
          tinyProduct = tinyProduct.produto;
          if (!hasVariations || variationId) {
            if (tinyStockUpdate) {
              return handleTinyStock(tinyStockUpdate as any, tinyProduct);
            }
            return postTiny('/produto.obter.estoque.php', { id: tinyProduct.id })
              .then((tinyStock) => handleTinyStock(tinyStock, tinyProduct));
          }
          return handleTinyStock({ produto: {} } as any, tinyProduct);
        }
      }
      const msg = `SKU ${queueSku} não encontrado no Tiny`;
      const err: any = new Error(msg);
      err.isConfigError = true;
      throw new Error(err);
    });
};

export default importProduct;
