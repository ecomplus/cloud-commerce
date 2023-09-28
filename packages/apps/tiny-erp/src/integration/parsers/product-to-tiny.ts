import type { Products } from '@cloudcommerce/types';
import ecomUtils from '@ecomplus/utils';

export default async (product: Products, originalTinyProduct, appData) => {
  const hasVariations = product.variations && product.variations.length;
  let unidade: string = originalTinyProduct?.unidade;
  if (!unidade) {
    if (
      product.measurement
      && product.measurement.unit !== 'oz'
      && product.measurement.unit !== 'ct'
    ) {
      unidade = product.measurement.unit.substring(0, 3).toUpperCase();
    } else {
      unidade = 'UN';
    }
  }
  const tinyProduct: Record<string, any> = {
    sequencia: 1,
    origem: 0,
    situacao: product.available && product.visible ? 'A' : 'I',
    tipo: 'P',
    classe_produto: hasVariations ? 'V' : 'S',
    codigo: product.sku,
    nome: ecomUtils.name(product, 'pt_br').substring(0, 120),
    unidade,
  };

  if (ecomUtils.onPromotion(product)) {
    tinyProduct.preco = product.base_price;
    tinyProduct.preco_promocional = ecomUtils.price(product);
  } else {
    tinyProduct.preco = product.price;
  }
  if (product.cost_price) {
    tinyProduct.preco_custo = product.cost_price;
  }
  if (product.min_quantity) {
    tinyProduct.unidade_por_caixa = product.min_quantity < 1000
      ? String(product.min_quantity) : '999';
  }

  if (product.short_description) {
    tinyProduct.descricao_complementar = product.short_description;
  }
  if (product.warranty) {
    tinyProduct.garantia = product.warranty.substring(0, 20);
  }

  if (product.mpn && product.mpn.length) {
    [tinyProduct.ncm] = product.mpn;
  }
  if (product.gtin && product.gtin.length) {
    [tinyProduct.gtin] = product.gtin;
    if (product.gtin[1]) {
      // eslint-disable-next-line prefer-destructuring
      tinyProduct.gtin_embalagem = product.gtin[1];
    }
  }

  if (product.weight && product.weight.value) {
    tinyProduct.peso_bruto = product.weight.value;
    tinyProduct.peso_liquido = product.weight.value;

    const setWeightUnitProduct = global.$tinyErpSetWeightUnitProduct;
    if (setWeightUnitProduct && typeof setWeightUnitProduct === 'function') {
      setWeightUnitProduct({ product });
    }

    if (product.weight.unit === 'mg') {
      tinyProduct.peso_bruto /= 1000000;
      tinyProduct.peso_liquido /= 1000000;
    } else if (product.weight.unit === 'g') {
      tinyProduct.peso_bruto /= 1000;
      tinyProduct.peso_liquido /= 1000;
    }
  }
  const { dimensions } = product;
  if (dimensions) {
    Object.keys(dimensions).forEach((side) => {
      if (dimensions[side] && dimensions[side].value) {
        let field: string;
        if (side === 'width') {
          field = 'largura';
        } else {
          field = side === 'height' ? 'altura' : 'comprimento';
        }
        field += '_embalagem';
        tinyProduct[field] = dimensions[side].value;
        if (dimensions[side].unit === 'mm') {
          tinyProduct[field] *= 0.1;
        } else if (dimensions[side].unit === 'm') {
          tinyProduct[field] *= 100;
        }
      }
    });
  }

  if (product.brands && product.brands.length) {
    tinyProduct.marca = product.brands[0].name;
  }
  if (product.category_tree) {
    tinyProduct.categoria = product.category_tree.replace(/\s?>\s?/g, ' >> ');
  } else if (product.categories && product.categories.length) {
    tinyProduct.categoria = product.categories.map(({ name }) => name).join(' >> ');
  }

  if (product.pictures && product.pictures.length) {
    tinyProduct.anexos = [];
    product.pictures.forEach(({ zoom, big, normal }) => {
      const img = (zoom || big || normal) as { url: string };
      if (img) {
        tinyProduct.anexos.push({
          anexo: img.url,
        });
      }
    });
  }

  if (originalTinyProduct) {
    tinyProduct.id = originalTinyProduct.id;
    if (!appData.update_price) {
      ['preco', 'preco_promocional', 'preco_custo'].forEach((field) => {
        if (typeof originalTinyProduct[field] === 'number') {
          tinyProduct[field] = originalTinyProduct[field];
        }
      });
    }
  } else {
    tinyProduct.estoque_atual = product.quantity || 0;
  }

  if (hasVariations) {
    tinyProduct.variacoes = [];
    product.variations?.forEach((variation, i) => {
      const tinyVariation: Record<string, any> = {
        codigo: variation.sku || `${product.sku}-${(i + 1)}`,
        grade: {},
      };
      if (!originalTinyProduct) {
        tinyVariation.estoque_atual = variation.quantity || 0;
      }
      Object.keys(variation.specifications).forEach((gridId) => {
        const gridOptions = variation.specifications[gridId];
        if (gridOptions && gridOptions.length) {
          gridOptions.forEach(({ text }, ii) => {
            tinyVariation.grade[ii === 0 ? gridId : `${gridId}_${(ii + 1)}`] = text;
          });
        }
      });
      tinyProduct.variacoes.push({
        variacao: tinyVariation,
      });
    });
  }
  return tinyProduct;
};
