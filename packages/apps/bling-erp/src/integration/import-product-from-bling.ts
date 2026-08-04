import type { Products } from '@cloudcommerce/types';
import type Bling from '../bling-auth/client';
import api from '@cloudcommerce/api';
import ecomUtils from '@ecomplus/utils';
import { logger } from '@cloudcommerce/firebase/lib/config';
import { createBlingClient } from '../bling-auth/client';
import parseProduct from './parsers/product-from-bling';
import importCategory from './import-category-from-bling';

const findProductBySku = async (sku: string) => {
  try {
    return (await api.get(`products/skus:${sku}`)).data;
  } catch (err: any) {
    if (err.statusCode === 404 || err.response?.status === 404) {
      return null;
    }
    throw err;
  }
};

const parseStockFromDeposits = (
  blingItem: Record<string, any>,
  blingDeposit: string | number | undefined,
  hasStockReserve: boolean,
) => {
  const depositFind = blingItem.depositos.find(({ id }: Record<string, any>) => {
    return String(id) === String(blingDeposit);
  });
  const deposits = depositFind ? [depositFind] : blingItem.depositos;
  let quantity = 0;
  deposits.forEach((deposit: Record<string, any>) => {
    if (hasStockReserve) {
      const saldoVirtual = Number(deposit.saldoVirtual);
      quantity += !Number.isNaN(saldoVirtual) ? saldoVirtual : 0;
    } else {
      const saldo = typeof deposit.saldo === 'number'
        ? Number(deposit.saldo)
        : Number(deposit.saldoFisico);
      quantity += !Number.isNaN(saldo) ? saldo : 0;
    }
  });
  return quantity;
};

const createUpdateProduct = async (
  appData: Record<string, any>,
  sku: string,
  product: Products | null,
  variationId: string | undefined,
  blingProduct: Record<string, any>,
  isStockOnly: boolean,
) => {
  const blingDeposit = appData.bling_deposit;
  let blingItems = [blingProduct];
  if (Array.isArray(blingProduct.variacoes)) {
    blingItems = blingItems.concat(blingProduct.variacoes);
  }
  blingItems.forEach((blingItem) => {
    if (
      typeof blingItem.estoqueAtual !== 'number'
      && typeof blingItem.estoque?.saldoVirtualTotal === 'number'
    ) {
      blingItem.estoqueAtual = Math.max(0, blingItem.estoque.saldoVirtualTotal);
    }
    if (
      Array.isArray(blingItem.depositos)
      && (blingDeposit || typeof blingItem.estoqueAtual !== 'number')
    ) {
      blingItem.estoqueAtual = parseStockFromDeposits(
        blingItem,
        blingDeposit,
        Boolean(appData.has_stock_reserve),
      );
      delete blingItem.depositos;
    }
  });

  const blingProductFind = !variationId
    ? blingProduct
    // Variations without SKU on Bling are referenced by the Bling ID
    : blingItems.find((item) => item.codigo === sku || String(item.id) === sku);
  let quantity = Number(blingProductFind?.estoqueAtual);
  logger.info(`[STOCK] sku=${sku} quantity=${quantity}`, {
    hasStockReserve: Boolean(appData.has_stock_reserve),
    blingDeposit,
  });

  if (product && (isStockOnly === true || !appData.update_product || variationId)) {
    if (Number.isNaN(quantity)) {
      return null;
    }
    if (quantity < 0) {
      quantity = 0;
    }
    let endpoint = `products/${product._id}`;
    if (variationId) {
      endpoint += `/variations/${variationId}`;
    }
    endpoint += '/quantity';
    logger.info(endpoint, { quantity, sku });
    // @ts-ignore
    return api.put(endpoint, quantity);
  }

  if (!product && blingProduct.codigoPai) {
    logger.info(`Skipping ${sku} - is a variation without parent product on store`);
    return null;
  }

  const isNew = !product;
  const bodyProduct = await parseProduct(
    blingProduct,
    product?.variations,
    isNew,
    appData,
  );
  if (!Number.isNaN(quantity)) {
    bodyProduct.quantity = quantity >= 0 ? quantity : 0;
  }
  if (!product?.metafields?.length) {
    bodyProduct.metafields = [{
      _id: ecomUtils.randomObjectId(),
      namespace: 'bling',
      field: 'bling:id',
      value: `${blingProduct.id}`,
    }] as any;
  }
  if (product) {
    logger.info(`PATCH products/${product._id}`, { bodyProduct });
    return api.patch(`products/${product._id}`, bodyProduct);
  }
  logger.info('POST products', { bodyProduct });
  return api.post('products', bodyProduct);
};

const getBlingProduct = async (
  bling: Bling,
  sku: string,
  blingProductId: string | number | undefined,
  queueEntry: Record<string, any>,
  appData: Record<string, any>,
) => {
  const endpoint = blingProductId ? `/produtos/${blingProductId}` : `/produtos?codigo=${sku}`;
  const { data } = await bling.get(endpoint);
  const responseData = data?.data;
  let foundProduct = !blingProductId && Array.isArray(responseData)
    ? responseData[0]
    : responseData;
  if (!foundProduct && queueEntry._blingId) {
    /*
    Variations without SKU on Bling are imported with the Bling ID as SKU,
    so there's nothing to find by `codigo` and the ID must be used.
    */
    foundProduct = await bling.get(`/produtos/${queueEntry._blingId}`)
      .then(({ data: { data: byId } }) => byId)
      .catch(() => undefined);
  }
  if (!foundProduct) {
    const err: any = new Error(`SKU ${sku} não encontrado no Bling`);
    err.isConfigError = true;
    throw err;
  }

  /*
  Bling may return the variation itself when searching by SKU,
  in that case the parent product must be loaded to import the whole set.
  */
  let blingProductData = foundProduct;
  if (!blingProductId) {
    const { data: { data: fullProduct } } = await bling
      .get(`/produtos/${foundProduct.id || queueEntry._blingId}`);
    const parentId = fullProduct?.variacao?.produtoPai?.id;
    blingProductData = parentId
      ? (await bling.get(`/produtos/${parentId}`)).data.data
      : fullProduct;
  }
  if (!blingProductData) {
    const err: any = new Error(`SKU ${sku} não encontrado no Bling`);
    err.isConfigError = true;
    throw err;
  }

  const idsProdutos: Array<string | number> = [blingProductData.id];
  blingProductData.variacoes?.forEach(({ id }: Record<string, any>) => {
    idsProdutos.push(id);
  });
  const stockParams = idsProdutos.reduce((acc, id) => `${acc}idsProdutos[]=${id}&`, '');
  const blingProductStock = await bling.get(`/estoques/saldos?${stockParams}`)
    .then((response) => response.data?.data)
    .catch((err: any) => {
      logger.warn(`Failed listing Bling stock: ${err.message}`);
      return [];
    });
  if (blingProductStock?.length) {
    const stockProduct = blingProductStock.find(({ produto }) => {
      return produto.id === blingProductData.id;
    });
    if (stockProduct) {
      blingProductData.depositos = stockProduct.depositos;
    }
    blingProductData.variacoes?.forEach((variation: Record<string, any>) => {
      const stockVariation = blingProductStock.find(({ produto }) => produto.id === variation.id);
      if (stockVariation) {
        variation.depositos = stockVariation.depositos;
      }
    });
  }

  const blingStore = appData.bling_store;
  if (blingStore && blingProductData.id) {
    try {
      const { data: { data: produtosLoja } } = await bling
        .get(`/produtos/lojas?idProduto=${blingProductData.id}&idLoja=${blingStore}`);
      if (Array.isArray(produtosLoja) && produtosLoja.length) {
        const {
          preco: precoLoja,
          precoPromocional: precoPromocionalLoja,
        } = produtosLoja[0];
        if (precoLoja) {
          logger.info(`[PRICE_MULTILOJA] sku=${sku} preco=${precoLoja}`);
          blingProductData.preco = precoLoja;
          if (precoPromocionalLoja) {
            blingProductData.precoPromocional = precoPromocionalLoja;
          }
        }
      }
    } catch (err: any) {
      logger.warn(`[PRICE_MULTILOJA] erro ao buscar preço da loja: ${err.message}`);
    }
  }

  if (blingProductData.categoria?.id) {
    try {
      const category = await importCategory(bling, blingProductData.categoria.id);
      if (category) {
        blingProductData.ecomCategories = [{
          _id: category._id,
          name: category.name,
          slug: category.slug,
        }];
      }
    } catch (err: any) {
      const categoryId = blingProductData.categoria.id;
      logger.warn(`[CATEGORY_IMPORT] erro ao importar categoria ${categoryId}: ${err.message}`);
    }
  }

  return blingProductData;
};

const importProductFromBling = async (
  _apiDoc: Record<string, any>,
  queueEntry: Record<string, any>,
  appData: Record<string, any>,
  canCreateNew?: boolean,
  isHiddenQueue = false,
) => {
  const [sku, queueProductId] = String(queueEntry.nextId).split(';:');
  let product: Products | null = null;
  if (queueProductId) {
    try {
      product = (await api.get(`products/${queueProductId as Products['_id']}`)).data;
    } catch (err: any) {
      if (err.statusCode !== 404 && err.response?.status !== 404) {
        throw err;
      }
      logger.info(`${queueProductId} not found on store`);
    }
  } else if (sku.length) {
    product = await findProductBySku(sku);
  }

  let variationId: string | undefined;
  const hasVariations = Boolean(product?.variations?.length);
  if (product && hasVariations) {
    const variation = product.variations?.find(({ sku: variationSku }) => sku === variationSku);
    if (variation) {
      variationId = variation._id;
    } else if (isHiddenQueue) {
      if (product.sku !== sku) {
        product = null;
      }
    } else if (!appData.update_product) {
      const err: any = new Error(`${sku} corresponde a um produto com variações,`
        + ' especifique o SKU da variação para importar.');
      err.isConfigError = true;
      return err;
    }
  } else if (!product && !sku.length) {
    const err: any = new Error('Produto sem SKU, especifique-o para importar.');
    err.isConfigError = true;
    return err;
  }

  const canImportNew = appData.import_product && canCreateNew !== false;
  if (!product && (isHiddenQueue || queueProductId) && !canImportNew) {
    logger.info(`Skipping ${sku} / ${queueProductId} => isHiddenQueue: ${isHiddenQueue}`);
    return null;
  }

  const bling = createBlingClient(appData);
  const metafields = (product?.metafields || []) as Array<Record<string, any>>;
  const blingProductId = metafields.find(({ field }) => field === 'bling:id')?.value;
  const blingProduct = await getBlingProduct(bling, sku, blingProductId, queueEntry, appData);

  // Fallback: if variation SKU search failed, try finding by parent product SKU
  if (!product && blingProduct.codigo && blingProduct.codigo !== sku) {
    const parentSku = String(blingProduct.codigo);
    logger.info(`Variation SKU "${sku}" not found, trying parent SKU "${parentSku}"`);
    product = await findProductBySku(parentSku).catch(() => null);
    if (product?.variations?.length) {
      const variation = product.variations.find(({ sku: variationSku }) => variationSku === sku);
      if (variation) {
        variationId = variation._id;
      }
    }
  }

  const isStockOnly = Boolean(
    product && !(appData.update_product || appData.update_product_auto),
  );
  return createUpdateProduct(appData, sku, product, variationId, blingProduct, isStockOnly);
};

export default importProductFromBling;
