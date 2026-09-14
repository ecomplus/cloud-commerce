import type { Products } from '@cloudcommerce/types';
import ecomUtils from '@ecomplus/utils';

const parseDimensions = (dimensions: Record<string, any> | undefined) => {
  const blingDimensoes: Record<string, any> = {};
  if (dimensions) {
    Object.keys(dimensions).forEach((side) => {
      const { value } = dimensions[side] || {};
      if (value) {
        let field: string;
        if (side === 'width') {
          field = 'largura';
        } else if (side === 'height') {
          field = 'altura';
        } else {
          field = 'profundidade';
        }
        blingDimensoes[field] = value;
      }
    });
  }
  if (Object.keys(blingDimensoes).length) {
    blingDimensoes.unidadeMedida = 1;
    return blingDimensoes;
  }
  return null;
};

const parseWeight = (weight: Record<string, any> | undefined) => {
  if (!weight?.value) return null;
  let pesoBruto = weight.value;
  switch (weight.unit) {
    case 'mg':
      pesoBruto /= 1000000;
      break;
    case 'g':
      pesoBruto /= 1000;
      break;
    default:
  }
  return pesoBruto;
};

export default (
  product: Products,
  originalBlingProduct: Record<string, any> | undefined,
  appData: Record<string, any>,
) => {
  const isVariations = Boolean(product.variations && product.variations.length);
  let unidade = 'UN';
  if (originalBlingProduct?.unidade) {
    unidade = originalBlingProduct.unidade;
  } else if (
    product.measurement
    && product.measurement.unit !== 'oz'
    && product.measurement.unit !== 'ct'
  ) {
    unidade = product.measurement.unit.substring(0, 6).toUpperCase();
  }

  const blingProduct: Record<string, any> = {
    nome: product.name || '',
    codigo: product.sku || product._id,
    tipo: 'P',
    situacao: product.available && product.visible ? 'A' : 'I',
    formato: isVariations ? 'V' : 'S',
    preco: ecomUtils.price(product),
    descricaoCurta: product.short_description,
    descricaoComplementar: product.body_html,
    unidade,
  };

  if (originalBlingProduct?.id) {
    blingProduct.id = originalBlingProduct.id;
  }

  if (product.condition) {
    blingProduct.condicao = 0;
    if (product.condition === 'new') {
      blingProduct.condicao = 1;
    } else if (product.condition === 'used') {
      blingProduct.condicao = 2;
    }
  }
  if (product.min_quantity) {
    blingProduct.itensPorCaixa = product.min_quantity;
  }
  if (product.mpn && product.mpn.length) {
    blingProduct.tributacao = {
      ncm: product.mpn[0],
    };
  }
  if (product.gtin && product.gtin.length) {
    [blingProduct.gtin] = product.gtin;
    if (product.gtin[1]) {
      blingProduct.gtinEmbalagem = product.gtin[1];
    }
  }

  const pesoBruto = parseWeight(product.weight);
  if (pesoBruto) {
    blingProduct.pesoBruto = pesoBruto;
    blingProduct.pesoLiquido = pesoBruto;
  }
  const dimensoes = parseDimensions(product.dimensions);
  if (dimensoes) {
    blingProduct.dimensoes = dimensoes;
  }

  blingProduct.midia = {};
  if (product.brands && product.brands.length) {
    blingProduct.marca = product.brands[0].name;
  }
  if (product.videos?.length && product.videos[0].url) {
    blingProduct.midia.video = {
      url: product.videos[0].url,
    };
  }
  if (product.pictures && product.pictures.length) {
    blingProduct.midia.imagens = {
      imagensURL: [],
    };
    product.pictures.forEach(({ zoom, big, normal }) => {
      const img = (zoom || big || normal);
      if (img) {
        blingProduct.midia.imagens.imagensURL.push({ link: img.url });
      }
    });
  }

  // Stock
  if (!isVariations) {
    if (
      typeof product.quantity === 'number'
      && (!originalBlingProduct || appData.export_quantity)
    ) {
      blingProduct.estoque = { maximo: product.quantity };
    } else if (typeof originalBlingProduct?.estoque?.maximo === 'number') {
      blingProduct.estoque = { maximo: originalBlingProduct.estoque.maximo };
    }
  }

  if (isVariations && product.variations) {
    blingProduct.variacoes = [];
    product.variations.forEach((variation, i) => {
      const codigo = variation.sku || `${product.sku}-${(i + 1)}`;
      const blingVariationOriginal = originalBlingProduct?.variacoes?.find(
        ({ codigo: codigoFind }) => codigoFind === codigo,
      );
      const blingVariation: Record<string, any> = {
        nome: variation.name,
        tipo: 'P',
        situacao: product.available && product.visible ? 'A' : 'I',
        formato: 'S',
        preco: ecomUtils.price({ ...product, ...variation }),
        codigo: blingVariationOriginal?.codigo || codigo,
      };
      if (blingVariationOriginal?.id) {
        blingVariation.id = blingVariationOriginal.id;
      }

      // Stock variation
      if (
        typeof variation.quantity === 'number'
        && (!blingVariationOriginal || appData.export_quantity)
      ) {
        blingVariation.estoque = { maximo: variation.quantity };
      } else if (typeof blingVariationOriginal?.estoque?.maximo === 'number') {
        blingVariation.estoque = { maximo: blingVariationOriginal.estoque.maximo };
      }

      if (variation.mpn && variation.mpn.length) {
        blingVariation.tributacao = {
          ncm: variation.mpn[0],
        };
      }
      if (variation.gtin && variation.gtin.length) {
        [blingVariation.gtin] = variation.gtin;
        if (variation.gtin[1]) {
          blingVariation.gtinEmbalagem = variation.gtin[1];
        }
      }
      const variationWeight = parseWeight(variation.weight);
      if (variationWeight) {
        blingVariation.pesoBruto = variationWeight;
      }
      const variationDimensoes = parseDimensions(variation.dimensions);
      if (variationDimensoes) {
        blingVariation.dimensoes = variationDimensoes;
      }

      const variacao: Record<string, any> = {
        nome: '',
        ordem: i,
        produtoPai: { cloneInfo: Boolean(!variation.dimensions) },
      };
      const { specifications } = variation;
      if (specifications) {
        Object.keys(specifications).forEach((gridId) => {
          const gridOptions = specifications[gridId];
          if (gridOptions && gridOptions.length) {
            gridOptions.forEach(({ text }, optionIndex) => {
              let gridTitle: string;
              switch (gridId) {
                case 'colors':
                  gridTitle = 'Cor';
                  break;
                case 'size':
                  gridTitle = 'Tamanho';
                  break;
                case 'age_group':
                  gridTitle = 'Idade';
                  break;
                case 'gender':
                  gridTitle = 'Gênero';
                  break;
                default:
                  gridTitle = gridId.charAt(0).toUpperCase() + gridId.slice(1).replace('_', ' ');
              }
              if (variacao.nome) {
                variacao.nome += ';';
                variacao.ordem = optionIndex + 1;
                if (optionIndex > 0) {
                  gridTitle += optionIndex === 1 ? ' secundária' : ` ${(optionIndex + 1)}`;
                }
              }
              variacao.nome += `${gridTitle}:${text.replace(/[:;]/g, '')}`;
            });
          }
        });
      }
      blingVariation.variacao = variacao;
      blingProduct.variacoes.push(blingVariation);
    });
  }

  return blingProduct;
};
