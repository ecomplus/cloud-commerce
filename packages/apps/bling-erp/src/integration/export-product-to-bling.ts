import type { Products } from '@cloudcommerce/types';
import type Bling from '../bling-auth/client';
import { URLSearchParams } from 'url';
import ecomUtils from '@ecomplus/utils';
import api from '@cloudcommerce/api';
import { logger } from '@cloudcommerce/firebase/lib/config';
import { createBlingClient } from '../bling-auth/client';
import parseProduct from './parsers/product-to-bling';
import parseStockFromDeposits, { hasDepositBalance } from './helpers/parse-stock-from-deposits';

const getBlingStockBalances = (bling: Bling, blingProductId: string | number) => {
  const params = new URLSearchParams({ 'idsProdutos[]': String(blingProductId) });
  return bling.get(`/estoques/saldos?${params.toString()}`)
    .then(({ data }) => data?.data?.[0] as Record<string, any> | undefined)
    .catch((err: any) => {
      logger.warn(`Failed listing Bling stock balances: ${err.message}`);
      return undefined;
    });
};

const exportProductToBling = async (
  apiDoc: Record<string, any>,
  queueEntry: Record<string, any>,
  appData: Record<string, any>,
  canCreateNew?: boolean,
) => {
  const productId = queueEntry.nextId;
  logger.info(`>> Export product to Bling ${productId}`);
  const blingStore = appData.bling_store;
  const blingDeposit = appData.bling_deposit;
  let product: Products;
  if (productId === apiDoc._id) {
    product = apiDoc as Products;
  } else {
    try {
      product = (await api.get(`products/${productId}`)).data;
    } catch (err: any) {
      const status = err.statusCode || err.response?.status;
      if (status >= 400 && status < 500) {
        const error: any = new Error(`O produto ${productId} não existe (:${status})`);
        error.isConfigError = true;
        return error;
      }
      throw err;
    }
  }

  const metafields = (product.metafields || []) as Array<Record<string, any>>;
  const metafieldCodigo = metafields.find(({ field }) => field === 'bling:codigo');
  const metafieldId = metafields.find(({ field }) => field === 'bling:id');
  const blingProductCode = metafieldCodigo?.value || product.sku;
  let blingProductId: string | number | undefined = metafieldId?.value;

  const bling = createBlingClient(appData);
  const urlParams: Record<string, string> = { codigo: String(blingProductCode) };
  if (blingStore) {
    urlParams.idLoja = String(blingStore);
  }
  const params = new URLSearchParams(urlParams);
  const searchEndpoint = `/produtos?${params.toString()}`;

  const findBlingProducts = async () => {
    const endpoint = blingProductId ? `/produtos/${blingProductId}` : searchEndpoint;
    try {
      return (await bling.get(endpoint)).data.data;
    } catch (err: any) {
      if (err.response?.status !== 404) {
        throw err;
      }
      if (blingProductId) {
        return (await bling.get(searchEndpoint)).data.data;
      }
      return null;
    }
  };

  const blingProducts = await findBlingProducts();
  let originalBlingProduct: Record<string, any> | undefined;
  // Resposta de detalhe (`/produtos/{id}`) já é o documento completo
  let isDetailLoaded = false;
  if (Array.isArray(blingProducts) && blingProducts.length) {
    originalBlingProduct = blingProducts.find(({ codigo }) => product.sku === String(codigo));
    if (!blingProductId && originalBlingProduct) {
      blingProductId = originalBlingProduct.id;
    }
    if (!canCreateNew && !originalBlingProduct) {
      logger.info(`${productId} not found on Bling and cannot create new`);
      return null;
    }
  } else if (blingProducts && !Array.isArray(blingProducts)) {
    originalBlingProduct = blingProducts;
    blingProductId = blingProducts.id;
    isDetailLoaded = true;
  }

  /*
  Evento de quantidade (`products-quantitySet`) só movimenta estoque: o
  `PUT /produtos` completo sobrescreveria no Bling edições feitas por lá (nome,
  descrição, preço, NCM...) a cada movimentação — inclusive no eco de um
  callback de estoque do próprio Bling, que dispara esse mesmo evento.
  */
  const isStockOnlyEvent = Boolean(queueEntry.isStockOnlyEvent);
  if (isStockOnlyEvent && !originalBlingProduct) {
    logger.info(`${productId} not on Bling, skipping creation on quantity event`);
    return null;
  }

  let response: any = null;
  let bodyBlingProduct: Record<string, any> | undefined;
  if (canCreateNew || appData.export_quantity || !blingStore) {
    /*
    Listing endpoints return a summarized product, without `variacoes`. The full
    document is required to send each variation with its Bling ID, otherwise the
    update is rejected as if the variations were being created again. Skipped
    when the detail response was already loaded (simple product would repeat an
    identical GET on every exportation).
    */
    if (blingProductId && !isDetailLoaded && !originalBlingProduct?.variacoes) {
      originalBlingProduct = await bling.get(`/produtos/${blingProductId}`)
        .then(({ data }) => data.data)
        .catch(() => originalBlingProduct);
    }
    /* Montado mesmo sem o `PUT`: o lançamento de estoque por variação abaixo
    depende dele para casar variação da loja -> id do Bling. */
    bodyBlingProduct = parseProduct(product, originalBlingProduct, appData);
    if (!isStockOnlyEvent) {
      const endpoint = `/produtos${originalBlingProduct ? `/${blingProductId}` : ''}`;
      logger.info(`[${originalBlingProduct ? 'put' : 'post'}]: ${endpoint}`, { bodyBlingProduct });
      response = originalBlingProduct
        ? await bling.put(endpoint, bodyBlingProduct)
        : await bling.post(endpoint, bodyBlingProduct);
    }
  }

  const responseData = response?.data?.data;
  if (responseData?.id) {
    blingProductId = String(responseData.id);
  }
  let isMetafieldsChanged = false;
  if (blingProductId) {
    if (metafieldId) {
      if (metafieldId.value !== String(blingProductId)) {
        metafieldId.value = String(blingProductId);
        isMetafieldsChanged = true;
      }
    } else {
      metafields.push({
        _id: ecomUtils.randomObjectId(),
        namespace: 'bling',
        field: 'bling:id',
        value: String(blingProductId),
      });
      isMetafieldsChanged = true;
    }
  }
  if (blingProductCode && !metafieldCodigo) {
    metafields.push({
      _id: ecomUtils.randomObjectId(),
      namespace: 'bling',
      field: 'bling:codigo',
      value: String(blingProductCode),
    });
    isMetafieldsChanged = true;
  }
  /*
  O `PATCH` substitui o array inteiro a partir do documento do evento: gravar
  sem mudança nenhuma custa uma escrita na Store API por movimentação de estoque
  (o eco de callback passa por aqui) e ainda pode descartar metafield que outro
  app escreveu depois do snapshot. Em regime estável não há o que persistir.
  */
  if (isMetafieldsChanged) {
    await api.patch(`products/${product._id}`, { metafields } as any).catch(logger.error);
  }

  if (!blingProductId) {
    return response;
  }

  /*
  Bling ignores the price sent for each variation when saving the parent product,
  applying the parent price to all of them, so variations priced differently on
  the store must be updated one by one.
  */
  if (!isStockOnlyEvent && bodyBlingProduct?.variacoes?.length) {
    const divergentVariations = bodyBlingProduct.variacoes.filter(({ preco }) => {
      return preco && preco !== bodyBlingProduct!.preco;
    });
    if (divergentVariations.length) {
      const savedVariations = await bling.get(`/produtos/${blingProductId}`)
        .then(({ data }) => data.data?.variacoes as Array<Record<string, any>> | undefined)
        .catch((err: any) => {
          logger.warn(`Failed listing Bling variations: ${err.message}`);
          return undefined;
        });
      for (let i = 0; i < divergentVariations.length; i++) {
        const { codigo, preco } = divergentVariations[i];
        const savedVariation = savedVariations?.find((variacao) => variacao.codigo === codigo);
        if (savedVariation?.id && savedVariation.preco !== preco) {
          logger.info(`Fixing variation ${codigo} price to ${preco}`);
          // eslint-disable-next-line no-await-in-loop
          await bling.put(`/produtos/${savedVariation.id}`, { ...savedVariation, preco })
            .catch((err: any) => {
              const errData = err.response?.data;
              logger.warn(`Failed updating variation ${codigo} price`, {
                response: errData,
              });
            });
        }
      }
    }
  }

  const stockBalances = await getBlingStockBalances(bling, blingProductId);
  const blingDeposits: Array<Record<string, any>> = stockBalances?.depositos || [];
  const depositsWithBalance = blingDeposits.filter(hasDepositBalance);
  if (!blingDeposit && depositsWithBalance.length > 1) {
    /* Sem `bling_deposit` configurado a comparação soma os depósitos com saldo,
    mas a escrita iria só para um: a soma nunca converge e o depósito seria
    sobrescrito com o total da loja. A guarda só dispara com 2+ depósitos COM
    saldo (um segundo depósito vazio, de devolução/avaria, não trava o estoque
    em 0 para sempre), e devolve `isConfigError` para a falha aparecer nos
    `logs` do painel em vez de um `logger.warn` que o lojista nunca vê. */
    const error: any = new Error(
      `O produto ${blingProductId} tem ${depositsWithBalance.length} depósitos`
      + ' com saldo no Bling e nenhum `bling_deposit` configurado:'
      + ' estoque NÃO exportado, configure o depósito no app',
    );
    error.isConfigError = true;
    return error;
  }
  /* Sem depósito configurado a escrita vai para o (único) depósito com saldo,
  para a base comparada e a base escrita convergirem; produto zerado em todos
  cai no primeiro depósito devolvido. */
  const estoqueId = blingDeposit || depositsWithBalance[0]?.id || blingDeposits[0]?.id;
  if (!estoqueId) {
    return response;
  }

  const isVariations = Boolean(product.variations && product.variations.length);
  const isUpdateStock = appData.export_quantity === true || !originalBlingProduct;
  const stockRequests: Array<Promise<any>> = [];
  if (!isVariations) {
    const productQuantity = product.quantity || 0;
    // Compara contra a MESMA base que a importação grava (parseStockFromDeposits):
    // saldoVirtual quando a loja usa reserva, senão saldo físico; do depósito
    // configurado ou somando todos. Comparar contra saldoVirtualTotal (virtual,
    // total) movimentava a cada exportação ou deixava de corrigir o físico.
    const blingBalance = stockBalances
      ? parseStockFromDeposits(stockBalances, blingDeposit, Boolean(appData.has_stock_reserve))
      : undefined;
    if (isUpdateStock && blingBalance !== productQuantity) {
      stockRequests.push(bling.post('/estoques', {
        produto: { id: Number(blingProductId) },
        deposito: { id: Number(estoqueId) },
        operacao: 'B',
        quantidade: productQuantity,
        observacoes: `Update in ${new Date().toISOString()}`,
      }).catch(logger.error));
    }
  } else if (bodyBlingProduct?.variacoes) {
    let newVariations: Array<Record<string, any>> = responseData?.variacoes || [];
    if (!newVariations.length && !originalBlingProduct) {
      /* O `POST /produtos` da API v3 responde só com o id do produto criado,
      então o produto deve ser relido para obter os ids das variações criadas
      e inicializar o estoque de cada uma. */
      newVariations = await bling.get(`/produtos/${blingProductId}`)
        .then(({ data }) => data.data?.variacoes || [])
        .catch((err: any) => {
          logger.warn(`Failed reading created variations: ${err.message}`);
          return [];
        });
    }
    product.variations?.forEach((variation) => {
      const variationFind = bodyBlingProduct!.variacoes.find(({ nome }) => nome === variation.name);
      if (!variationFind) return;
      const newVariation = newVariations.find(({ codigo, nomeVariacao, nome }) => {
        if (codigo && variationFind.codigo) return codigo === variationFind.codigo;
        return (nomeVariacao || nome) === variationFind.variacao?.nome;
      });
      const isUpdateStockVariation = appData.export_quantity === true || Boolean(newVariation);
      const variationBlingId = (newVariation || variationFind).id;
      if (!isUpdateStockVariation || !variationBlingId) return;
      stockRequests.push(bling.post('/estoques', {
        produto: { id: Number(variationBlingId) },
        deposito: { id: Number(estoqueId) },
        operacao: 'B',
        quantidade: variation.quantity || 0,
        observacoes: `Update in ${new Date().toISOString()}`,
      }).catch(logger.error));
    });
  }
  await Promise.all(stockRequests);

  return response;
};

export default exportProductToBling;
