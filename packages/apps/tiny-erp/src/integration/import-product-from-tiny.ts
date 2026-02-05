import type { Products } from '@cloudcommerce/types';
import { logger } from '@cloudcommerce/firebase/lib/config';
import api from '@cloudcommerce/api';
import updateAppData from '@cloudcommerce/firebase/lib/helpers/update-app-data';
import postTiny from './post-tiny-erp';
import parseProduct from './parsers/product-from-tiny';

const getPriceListData = async (productId: number) => {
  const priceListId = process.env.TINY_PRICE_LIST_ID;
  if (!priceListId) return undefined;

  try {
    const { registros } = await postTiny('/listas.precos.excecoes.php', {
      idListaPreco: Number(priceListId),
      idProduto: productId,
    });
    if (Array.isArray(registros) && registros.length > 0) {
      const registro = registros[0];
      return {
        preco: registro.preco,
        preco_promocional: registro.preco_promocional,
      };
    }
  } catch (err) {
    logger.warn(`Failed to get price list data for product ${productId}`, err);
  }
  return undefined;
};

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
    const resourceFind = (queueProductId || `skus:${queueSku}` as const);
    product = (await api.get(`products/${resourceFind}`)).data;
  } catch (err: any) {
    if (err.statusCode !== 404) {
      throw err;
    }
    if (!queueProductId) {
      const currentSku = tinyStockUpdate?.produto?.codigo;
      if (currentSku && queueSku !== currentSku) {
        try {
          product = (await api.get(`products/skus:${currentSku}`)).data;
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
        logger.info(`SKU not found ${queueSku} on any variation`, {
          product,
          isHiddenQueue,
        });
        if (tinyStockUpdate?.tipo !== 'produto') {
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
  }

  const handleTinyStock = ({ produto: produtoSaldo, tipo }, tinyProduct?: any) => {
    if (appData.update_quantity === false) {
      return null;
    }
    let quantity = Number(produtoSaldo.saldo);
    if (Number.isNaN(quantity)) {
      quantity = Number(produtoSaldo.estoqueAtual);
    }
    if (produtoSaldo.saldoReservado) {
      quantity -= Number(produtoSaldo.saldoReservado);
    }
    if (product && (!appData.update_product || variationId)) {
      if (hasVariations && !variationId) {
        return Promise.all((produtoSaldo.variacoes || []).map((variacao: any) => {
          if (!variacao?.codigo) return null;
          const varQnt = Number(variacao.estoqueAtual);
          if (Number.isNaN(varQnt)) return null;
          const variation = product.variations?.find(({ sku }) => variacao.codigo === sku);
          if (!variation) return null;
          const endpoint = `products/${product._id}/variations/${variation._id}/quantity` as const;
          return api.put(endpoint, varQnt).then((response) => {
            logger.info(`${endpoint} -> ${varQnt} [${response.status}]`);
            return response;
          });
        }))
          .then(([response]) => response || null);
      }
      if (!Number.isNaN(quantity)) {
        if (quantity < 0) {
          quantity = 0;
        }
        let endpoint = `products/${product._id}`;
        if (variationId) {
          endpoint += `/variations/${variationId}`;
        }
        endpoint += '/quantity';
        logger.info(endpoint, { quantity });
        // @ts-ignore
        return api.put(endpoint, quantity).then((response) => {
          logger.info(`${endpoint} -> ${quantity} [${response.status}]`);
          return response;
        });
      }
      return null;
    }

    if (!product && tinyProduct && tipo === 'produto') {
      logger.info('Tiny product to import', {
        tinyProduct,
        canCreateNew,
      });
      if (!canCreateNew) {
        return null;
      }
      return parseProduct(tinyProduct, appData, tipo, true)
        .then((bodyProduct) => {
          logger.info(`Creating ${queueSku}`, { bodyProduct });
          return api.post('products', bodyProduct);
        });
    }
    if (!tinyProduct) return null;

    return postTiny('/produto.obter.php', { id: (tinyProduct.id || produtoSaldo.id) })
      .then(async ({ produto }) => {
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
        const priceListData = await getPriceListData(produto.id);
        // @ts-ignore
        return parseProduct(
          produto,
          appData,
          tipo,
          method === 'POST',
          priceListData,
        ).then((parsedProduct) => {
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
  }), {
    tinyStockUpdate,
    isProductFound: !!product,
  });
  if (tinyStockUpdate && isHiddenQueue && (queueProductId || product?._id)) {
    return handleTinyStock(tinyStockUpdate, tinyStockUpdate.produto);
  }
  if (tinyStockUpdate?.tipo === 'produto' && !queueProductId) {
    logger.info(`Handling new SKU ${queueSku}`);
    return handleTinyStock(tinyStockUpdate, tinyStockUpdate.produto);
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
