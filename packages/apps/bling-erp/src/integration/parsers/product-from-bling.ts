import type { Products, ProductSet } from '@cloudcommerce/types';
import ecomUtils from '@ecomplus/utils';
import { logger } from '@cloudcommerce/firebase/lib/config';
import tryImageUpload from '../helpers/try-image-upload';

const removeAccents = (str: string) => str.replace(/[áàãâÁÀÃÂ]/g, 'a')
  .replace(/[éêÉÊ]/g, 'e')
  .replace(/[óõôÓÕÔ]/g, 'o')
  .replace(/[íÍ]/g, 'i')
  .replace(/[úÚ]/g, 'u')
  .replace(/[çÇ]/g, 'c');

const hexaColors = (color: string) => {
  switch (removeAccents(color.toLowerCase())) {
    case 'azulclaro': return '#add8e6';
    case 'branco':
    case 'branca': return '#ffffff';
    case 'cinza': return '#808080';
    case 'vermelho':
    case 'vermelha': return '#ff0000';
    case 'amarelo':
    case 'amarela': return '#ffff00';
    case 'verde': return '#008000';
    case 'preto':
    case 'preta': return '#000000';
    case 'azul': return '#0000ff';
    case 'petroleo': return '#006666';
    case 'verde limao': return '#32cd32';
    case 'rosa':
    case 'pink': return '#ffc0cb';
    case 'roxo': return '#800080';
    case 'laranja':
    case 'laranjao': return '#ffa500';
    case 'muffin': return '#d6a78a';
    case 'off':
    case 'offwhite':
    case 'off-white':
    case 'off white': return '#fffafa';
    case 'marrom': return '#a52a2a';
    case 'areia': return '#f0e68c';
    case 'vinho':
    case 'vinha': return '#800000';
    case 'ciano': return '#00ffff';
    case 'prata': return '#c0c0c0';
    case 'grafite': return '#808080';
    case 'magento': return '#ff00ff';
    case 'dourado': return '#ffd700';
    case 'turquesa': return '#40e0d0';
    case 'chocolatebranco': return '#d2691e';
    case 'verde oliva': return '#6b8e23';
    case 'caqui': return '#f0e68c';
    case 'pessego': return '#ffe5b4';
    case 'indigo': return '#4b0082';
    default: return '#ffffff';
  }
};

const validateGtin = (gtin: any) => {
  return typeof gtin === 'string' && /^([0-9]{8}|[0-9]{12,14})$/.test(gtin);
};

/*
Reverse of the grid titles sent on exportation, so the store keeps its
first-class grids (`colors`, `size`…) instead of generic ones named after the
Bling label. Unknown titles still fall back to a slug of the label itself.
*/
const gridIdsByTitle = {
  cor: 'colors',
  cores: 'colors',
  tamanho: 'size',
  idade: 'age_group',
  genero: 'gender',
};

const parseGridId = (gridName: string) => {
  const title = removeAccents(gridName.trim().toLowerCase());
  return gridIdsByTitle[title]
    || title
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .substring(0, 30)
      .padStart(2, 'i');
};

const parseDimensions = (dimensoes: Record<string, any> | undefined) => {
  const dimensions: Record<string, any> = {};
  ([
    ['largura', 'width'],
    ['altura', 'height'],
    ['profundidade', 'length'],
  ] as Array<[string, string]>).forEach(([lado, side]) => {
    const value = parseFloat(dimensoes?.[lado]);
    if (value > 0) {
      dimensions[side] = { unit: 'cm', value };
    }
  });
  return Object.keys(dimensions).length ? dimensions : null;
};

/*
Quantidade só é gravada quando o Bling realmente devolveu um saldo: o
`GET /produtos/{id}` não traz estoque nas variações e o `/estoques/saldos` pode
falhar (é tolerado com `catch`), então assumir 0 nesses casos zerava o estoque
do produto e de todas as variações a cada falha transitória.
*/
export const parseStockQuantity = (estoqueAtual: any): number | undefined => {
  if (typeof estoqueAtual !== 'number' || Number.isNaN(estoqueAtual)) {
    return undefined;
  }
  return estoqueAtual > 0 ? estoqueAtual : 0;
};

const getBaseUrl = (link: string) => {
  try {
    const url = new URL(link);
    return `${url.protocol}//${url.hostname}${url.pathname}`;
  } catch {
    return link;
  }
};

export default async (
  blingProduct: Record<string, any>,
  variations: Products['variations'] | undefined,
  isNew: boolean,
  appData: Record<string, any>,
): Promise<ProductSet> => {
  const sku = blingProduct.codigo || String(blingProduct.id);
  const name = (blingProduct.nome || sku).trim();
  const product: ProductSet = {
    available: blingProduct.situacao === 'A',
    sku,
    name,
    price: Number(blingProduct.preco),
  };
  const quantity = parseStockQuantity(blingProduct.estoqueAtual);
  if (quantity !== undefined) {
    product.quantity = quantity;
  } else if (isNew) {
    // Produto novo precisa nascer com alguma quantidade; atualização não
    product.quantity = 0;
  }

  if (!appData.non_update_description) {
    if (blingProduct.descricaoComplementar) {
      product.body_html = String(blingProduct.descricaoComplementar);
    } else if (blingProduct.descricaoCurta) {
      product.body_html = String(blingProduct.descricaoCurta);
    }
  }

  if (blingProduct.preco && blingProduct.precoPromocional) {
    product.price = Number(blingProduct.precoPromocional);
    product.base_price = Number(blingProduct.preco);
  }

  if (Array.isArray(blingProduct.ecomCategories) && blingProduct.ecomCategories.length) {
    product.categories = blingProduct.ecomCategories;
  }
  if (blingProduct.itensPorCaixa) {
    product.min_quantity = Number(blingProduct.itensPorCaixa);
  }
  if (blingProduct.tributacao?.ncm) {
    product.mpn = [String(blingProduct.tributacao.ncm)];
  }
  if (validateGtin(blingProduct.gtin)) {
    product.gtin = [blingProduct.gtin];
    if (validateGtin(blingProduct.gtinEmbalagem)) {
      product.gtin.push(blingProduct.gtinEmbalagem);
    }
  }

  if (isNew) {
    product.slug = removeAccents(name.toLowerCase())
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_./]/g, '');
    if (!/[a-z0-9]/.test(product.slug.charAt(0))) {
      product.slug = `p-${product.slug}`;
    }
  }

  if (blingProduct.midia?.video?.url) {
    product.videos = [{ url: blingProduct.midia.video.url }];
  }

  const weight = parseFloat(blingProduct.pesoBruto || blingProduct.pesoLiq);
  if (weight > 0) {
    product.weight = { unit: 'kg', value: weight };
  }
  const dimensions = parseDimensions(blingProduct.dimensoes);
  if (dimensions) {
    product.dimensions = dimensions;
  }

  // Picture indexes to be replaced by the uploaded picture IDs
  const pendingPictureIds: Array<{ variation: Record<string, any>, pictureIndex: number }> = [];

  if (Array.isArray(blingProduct.variacoes) && blingProduct.variacoes.length) {
    product.variations = (variations || []) as Exclude<ProductSet['variations'], undefined>;
    if (!blingProduct.midia) blingProduct.midia = {};
    if (!blingProduct.midia.imagens) blingProduct.midia.imagens = {};
    if (!Array.isArray(blingProduct.midia.imagens.externas)) {
      blingProduct.midia.imagens.externas = [];
    }
    const { externas } = blingProduct.midia.imagens;
    const externalLinks = new Set(externas.map(({ link }) => getBaseUrl(link)));

    blingProduct.variacoes.forEach((variacao: Record<string, any>) => {
      if (!variacao?.nome || !variacao.variacao?.nome) return;
      const gridsAndValues = String(variacao.variacao.nome).split(';');
      if (!gridsAndValues.length) return;
      const specifications: Record<string, Array<Record<string, any>>> = {};
      const specTexts: string[] = [];
      gridsAndValues.forEach((gridAndValue) => {
        const [gridName, text] = gridAndValue.trim().split(':');
        if (!gridName || !text) return;
        const gridId = parseGridId(gridName);
        const spec: Record<string, any> = { text };
        specTexts.push(text);
        if (gridId === 'colors') {
          spec.value = hexaColors(text);
        } else {
          spec.value = removeAccents(text.toLowerCase()).substring(0, 100);
        }
        if (!specifications[gridId]) {
          specifications[gridId] = [spec];
        } else {
          specifications[gridId].push(spec);
        }
      });
      if (!specTexts.length) return;

      const {
        midia,
        codigo,
        preco,
        gtin,
        dimensoes,
        pesoBruto,
        pesoLiq,
        tributacao,
        id,
      } = variacao;
      let pictureId = 0;
      if (Array.isArray(midia?.imagens?.externas) && midia.imagens.externas.length) {
        midia.imagens.externas.forEach(({ link }: Record<string, any>) => {
          const baseUrl = getBaseUrl(link);
          if (!externalLinks.has(baseUrl)) {
            externas.push({ link });
            externalLinks.add(baseUrl);
          }
        });
        pictureId = externas.length - 1;
      }
      let variation = variations
        ?.find(({ sku: variationSku }) => variationSku === codigo) as Record<string, any>;
      if (!variation) {
        variation = { _id: ecomUtils.randomObjectId() };
        product.variations!.push(variation as any);
      }
      variation.name = `${name} / ${specTexts.join(' / ')}`.substring(0, 100);
      variation.sku = codigo || String(id);
      variation.specifications = specifications;
      const variationQuantity = parseStockQuantity(variacao.estoqueAtual);
      if (variationQuantity !== undefined) {
        variation.quantity = variationQuantity;
      }
      if (pictureId > 0) {
        pendingPictureIds.push({ variation, pictureIndex: pictureId });
      }
      const price = parseFloat(preco);
      if (price && preco !== blingProduct.preco) {
        variation.price = price;
      }
      if (validateGtin(gtin)) {
        variation.gtin = gtin;
      }
      const variationDimensions = parseDimensions(dimensoes);
      if (variationDimensions) {
        variation.dimensions = variationDimensions;
      }
      const variationWeight = parseFloat(pesoBruto || pesoLiq);
      if (variationWeight > 0) {
        variation.weight = { unit: 'kg', value: variationWeight };
      }
      if (tributacao?.ncm) {
        variation.mpn = String(tributacao.ncm);
      }
    });
  }

  if (isNew && blingProduct.midia?.imagens) {
    const { externas, internas } = blingProduct.midia.imagens;
    const links: string[] = [
      ...(Array.isArray(externas) ? externas : []),
      ...(Array.isArray(internas) ? internas : []),
    ]
      .map(({ link }) => link)
      .filter((link) => typeof link === 'string' && link.startsWith('http'));
    if (links.length) {
      const pictures: Array<Record<string, any>> = [];
      for (let i = 0; i < links.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        pictures.push(await tryImageUpload(links[i], name));
      }
      product.pictures = pictures as any;
      pendingPictureIds.forEach(({ variation, pictureIndex }) => {
        const picture = pictures[pictureIndex];
        if (picture?._id) {
          variation.picture_id = picture._id;
        }
      });
      logger.info(`Uploaded ${pictures.length} pictures for ${sku}`);
    }
  }

  return product;
};
