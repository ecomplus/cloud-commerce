import logger from 'firebase-functions/logger';
import { getFirestore } from 'firebase-admin/firestore';
import getDocId from './correios-db/get-id-doc.mjs';
import calculateV2 from './calculate-v2.mjs';

// const { calculate } = require('../../../lib/correios-calculate');
const zipRangeStep = 5000;

export default async ({ params, application }) => {
  const appData = {
    ...application.data,
    ...application.hidden_data,
  };
  // setup basic required response object
  const response = {
    shipping_services: [],
  };

  if (appData.free_shipping_from_value >= 0) {
    response.free_shipping_from_value = appData.free_shipping_from_value;
  }
  if (!params.to) {
    // just a free shipping preview with no shipping address received
    // respond only with free shipping option
    return response;
  }

  const cepDestino = params.to ? params.to.zip.replace(/\D/g, '') : '';

  let cepOrigem;
  if (params.from) {
    cepOrigem = params.from.zip.replace(/\D/g, '');
  } else if (appData.zip) {
    cepOrigem = appData.zip.replace(/\D/g, '');
  }

  if (!cepOrigem) {
    // must have configured origin zip code to continue
    return {
      error: 'CALCULATE_ERR',
      message: 'Zip code is unset on app hidden data (merchant must configure the app)',
    };
  }
  if (!params.items) {
    return {
      error: 'CALCULATE_EMPTY_CART',
      message: 'Cannot calculate shipping without cart items',
    };
  }

  const checkZipCode = (rule) => {
    // validate rule zip range
    if (cepDestino && rule.zip_range) {
      const { min, max } = rule.zip_range;
      return Boolean((!min || cepDestino >= min) && (!max || cepDestino <= max));
    }
    return true;
  };

  // search for configured free shipping rule
  if (Array.isArray(appData.shipping_rules)) {
    for (let i = 0; i < appData.shipping_rules.length; i++) {
      const rule = appData.shipping_rules[i];
      if (rule.free_shipping && checkZipCode(rule)) {
        if (!rule.min_amount) {
          response.free_shipping_from_value = 0;
          break;
        } else if (!(response.free_shipping_from_value <= rule.min_amount)) {
          response.free_shipping_from_value = rule.min_amount;
        }
      }
    }
  }

  // optinal predefined or configured service codes
  let serviceCodes;
  if (params.service_code) {
    serviceCodes = [params.service_code];
  } else if (appData.services?.[0]?.service_code) {
    serviceCodes = appData.services.map((service) => service.service_code);
  }

  // optional params to Correios services
  let vlDeclarado = 0;
  const servicosAdicionais = [];
  if (params.subtotal && !appData.no_declare_value) {
    vlDeclarado = params.subtotal;
  }
  // https://api.correios.com.br/preco/v1/servicos-adicionais/03220
  if (params.own_hand) {
    servicosAdicionais.push('002');
  }
  if (params.receipt) {
    servicosAdicionais.push('001');
  }

  // calculate weight and pkg value from items list
  let nextDimensionToSum = 'length';
  const pkg = {
    dimensions: {
      width: {
        value: 0,
        unit: 'cm',
      },
      height: {
        value: 0,
        unit: 'cm',
      },
      length: {
        value: 0,
        unit: 'cm',
      },
    },
    weight: {
      value: 0,
      unit: 'g',
    },
  };

  params.items.forEach(({
    price,
    quantity,
    dimensions,
    weight,
  }) => {
    if (!params.subtotal && !appData.no_declare_value) {
      vlDeclarado += price * quantity;
    }
    // sum physical weight
    if (weight && weight.value) {
      let weightValue;
      switch (weight.unit) {
        case 'kg':
          weightValue = weight.value * 1000;
          break;
        case 'g':
          weightValue = weight.value;
          break;
        case 'mg':
          weightValue = weight.value / 1000000;
          break;
        default:
          weightValue = weight.value;
      }
      if (weightValue) {
        pkg.weight.value += weightValue * quantity;
      }
    }

    // sum total items dimensions to calculate cubic weight
    if (dimensions) {
      Object.keys(dimensions).forEach((side) => {
        const dimension = dimensions[side];
        if (dimension && dimension.value) {
          let dimensionValue;
          switch (dimension.unit) {
            case 'cm':
              dimensionValue = dimension.value;
              break;
            case 'm':
              dimensionValue = dimension.value * 100;
              break;
            case 'mm':
              dimensionValue = dimension.value / 10;
              break;
            default:
              dimensionValue = dimension.value;
          }
          // add/sum current side to final dimensions object
          if (dimensionValue) {
            const pkgDimension = pkg.dimensions[side];
            for (let i = 0; i < quantity; i++) {
              if (!pkgDimension.value) {
                pkgDimension.value = dimensionValue;
              } else if (nextDimensionToSum === side) {
                pkgDimension.value += dimensionValue;
                if (nextDimensionToSum === 'length') {
                  nextDimensionToSum = 'width';
                } else {
                  nextDimensionToSum = nextDimensionToSum === 'width' ? 'height' : 'length';
                }
              } else if (pkgDimension.value < dimensionValue) {
                pkgDimension.value = dimensionValue;
              }
            }
          }
        }
      });
    }
  });

  let correiosResult;

  if (!servicosAdicionais || !servicosAdicionais.length) {
    let docId;
    try {
      const docParams = {
        cepOrigem,
        cepDestino: (Number(cepDestino) - (Number(cepDestino) % zipRangeStep) + 1)
          .toString().padStart(8, '0'),
        psObjeto: pkg.weight.value,
        comprimento: pkg.dimensions.length.value,
        altura: pkg.dimensions.height.value,
        largura: pkg.dimensions.width.value,
        vlDeclarado,
      };

      docId = getDocId(docParams);
      const docSnapshot = await getFirestore().doc(docId).get();
      let docData;
      if (docSnapshot.exists) {
        docData = docSnapshot.data();
        correiosResult = docData.data;
      }
    } catch (err) {
      logger.error(new Error(`[calculate Correios V2] Cannot get doc ID ${docId}`));
      logger.error(err);
    }
  }

  // fallback Calculate
  if (!correiosResult) {
    try {
      const { data } = await calculateV2({
        correiosParams: {
          cepOrigem,
          cepDestino,
          psObjeto: pkg.weight.value,
          comprimento: pkg.dimensions.length.value,
          altura: pkg.dimensions.height.value,
          largura: pkg.dimensions.width.value,
          vlDeclarado,
          servicosAdicionais,
        },
        serviceCodes,
      });
      correiosResult = data;
    } catch (err) {
      const message = err?.response?.data?.[0]?.txErro || err.message;
      return {
        error: 'CALCULATE_FAILED',
        message,
      };
    }
  }

  correiosResult.forEach(({
    coProduto,
    // psCobrado
    // peAdValorem
    pcProduto,
    pcTotalServicosAdicionais,
    pcFinal,
    prazoEntrega,
    entregaSabado,
    txErro,
  }) => {
    if (txErro) {
      logger.warn(`[calculate Correios V2] alert/error ${coProduto}`, {
        pcFinal,
        prazoEntrega,
        txErro,
      });
    }
    if (!pcFinal || !prazoEntrega) {
      return;
    }
    // find respective configured service label
    let serviceName;
    switch (coProduto) {
      case '04014':
      case '03220':
      case '03204':
        serviceName = 'SEDEX';
        break;
      case '04510':
      case '03298':
        serviceName = 'PAC';
        break;
      default:
        break;
    }
    let label = serviceName || `Correios ${coProduto}`;
    if (Array.isArray(appData.services)) {
      for (let i = 0; i < appData.services.length; i++) {
        const service = appData.services[i];
        if (service && service.service_code === coProduto && service.label) {
          label = service.label;
        }
      }
    }

    // parse to E-Com Plus shipping line object
    const parseMoney = (str) => (Number(str.replace(',', '.') || 0));
    const shippingLine = {
      from: {
        ...params.from,
        zip: cepOrigem,
      },
      to: params.to,
      package: pkg,
      price: parseMoney(pcProduto || pcFinal),
      declared_value: pcTotalServicosAdicionais ? vlDeclarado : 0,
      declared_value_price: pcTotalServicosAdicionais ? parseMoney(pcTotalServicosAdicionais) : 0,
      own_hand: Boolean(params.own_hand),
      receipt: Boolean(params.receipt),
      discount: 0,
      total_price: parseMoney(pcFinal),
      delivery_time: {
        days: Number(prazoEntrega),
        working_days: entregaSabado !== 'S',
      },
      posting_deadline: {
        days: 3,
        ...appData.posting_deadline,
      },
      flags: ['correios-api'],
    };

    // search for discount by shipping rule
    if (Array.isArray(appData.shipping_rules)) {
      for (let i = 0; i < appData.shipping_rules.length; i++) {
        const rule = appData.shipping_rules[i];
        if (
          rule
          && (!rule.service_code || rule.service_code === coProduto)
          && checkZipCode(rule)
          && !(rule.min_amount > params.subtotal)
        ) {
          // valid shipping rule
          if (rule.free_shipping) {
            shippingLine.discount += shippingLine.total_price;
            shippingLine.total_price = 0;
            break;
          } else if (rule.discount) {
            let discountValue = rule.discount.value;
            if (rule.discount.percentage) {
              discountValue *= (shippingLine.total_price / 100);
            }
            if (discountValue) {
              shippingLine.discount += discountValue;
              shippingLine.total_price -= discountValue;
              if (shippingLine.total_price < 0) {
                shippingLine.total_price = 0;
              }
            }
            break;
          }
        }
      }
    }

    // push shipping service object to response
    response.shipping_services.push({
      label,
      carrier: 'Correios',
      // https://informederendimentos.com/consulta/cnpj-correios/
      carrier_doc_number: '34028316000103',
      service_code: coProduto,
      service_name: serviceName || label,
      shipping_line: shippingLine,
    });
  });

  return response;
};