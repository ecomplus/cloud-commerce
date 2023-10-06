import logger from 'firebase-functions/logger';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import getDocId from './get-id-doc.mjs';
import { docToServices } from './doc-parsers.mjs';

const zipRangeStep = 5000;
const findBaseWeight = (weight) => {
  let testWeight = 0.5;
  while (testWeight <= 50) {
    if (testWeight >= weight) {
      return testWeight;
    }
    if (testWeight < 1) {
      testWeight = 1;
    } else if (testWeight >= 40) {
      testWeight = 50;
    } else {
      testWeight += Math.ceil(testWeight / 10);
    }
  }
  return 50;
};

export default async ({ params, application }) => {
  const appData = {
    ...application.data,
    ...application.hidden_data,
  };

  // setup basic required response object
  const response = {
    shipping_services: [],
  };

  // Correios calculate params
  let nVlPeso = 0;
  let nVlValorDeclarado = 0;
  let nCdEmpresa = '';
  let sDsSenha = '';
  let sCdMaoPropria;
  let sCdAvisoRecebimento;
  // check for appDataured Correios contract
  const contract = appData.correios_contract;
  if (contract) {
    const code = typeof contract.code === 'string' && contract.code.trim();
    if (code) {
      nCdEmpresa = code;
      const password = typeof contract.password === 'string' && contract.password.trim();
      if (password) {
        sDsSenha = password;
      }
    }
  }

  const sCepDestino = params.to ? params.to.zip.replace(/\D/g, '') : '';
  let sCepOrigem;
  if (params.from) {
    sCepOrigem = params.from.zip.replace(/\D/g, '');
  } else if (appData.zip) {
    sCepOrigem = appData.zip.replace(/\D/g, '');
  }

  const checkZipCode = (rule) => {
    // validate rule zip range
    if (sCepDestino && rule.zip_range) {
      const { min, max } = rule.zip_range;
      return Boolean((!min || sCepDestino >= min) && (!max || sCepDestino <= max));
    }
    return true;
  };

  // search for appDataured free shipping rule
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

  // params object follows calculate shipping request schema:
  // https://apx-mods.e-com.plus/api/v1/calculate_shipping/schema.json?store_id=100
  if (!params.to) {
    // respond only with free shipping option
    return response;
  }

  if (!sCepOrigem) {
    // must have appDataured origin zip code to continue
    return {
      error: 'CALCULATE_ERR',
      message: 'Zip code is unset on app hidden data (merchant must appDataure the app)',
    };
  }

  // optional params to Correios services
  if (params.subtotal) {
    nVlValorDeclarado = params.subtotal;
  }
  if (params.own_hand) {
    sCdMaoPropria = 's';
  }
  if (params.receipt) {
    sCdAvisoRecebimento = 's';
  }

  // calculate weight and pkg value from items list
  if (params.items) {
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
        unit: 'kg',
      },
    };

    params.items.forEach(({
      price, quantity, dimensions, weight,
    }) => {
      let physicalWeight = 0;
      let cubicWeight = 0;
      if (!params.subtotal) {
        nVlValorDeclarado += price * quantity;
      }

      // sum physical weight
      if (weight && weight.value) {
        switch (weight.unit) {
          case 'kg':
            physicalWeight = weight.value;
            break;
          case 'g':
            physicalWeight = weight.value / 1000;
            break;
          case 'mg':
            physicalWeight = weight.value / 1000000;
            break;
          default:
            break;
        }
        pkg.weight.value += physicalWeight * quantity;
      }

      // sum total items dimensions to calculate cubic weight
      if (dimensions) {
        const sumDimensions = {};
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
                break;
            }
            // add/sum current side to final dimensions object
            if (dimensionValue) {
              sumDimensions[side] = sumDimensions[side]
                ? sumDimensions[side] + dimensionValue
                : dimensionValue;
            }
          }
        });

        // calculate cubic weight
        // https://suporte.boxloja.pro/article/82-correios-calculo-frete
        // (C x L x A) / 6.000
        Object.keys(sumDimensions).forEach((side) => {
          if (sumDimensions[side]) {
            cubicWeight = cubicWeight > 0
              ? cubicWeight * sumDimensions[side]
              : sumDimensions[side];
            pkg.dimensions[side].value += sumDimensions[side] * quantity;
          }
        });
        if (cubicWeight > 0) {
          cubicWeight /= 6000;
        }
      }

      if (!appData.free_no_weight_shipping || physicalWeight > 0) {
        nVlPeso += (quantity * (cubicWeight < 5
          || physicalWeight > cubicWeight ? physicalWeight : cubicWeight));
      }
    });

    // pre check for maximum allowed declared value
    if (nVlValorDeclarado > 10000) {
      nVlValorDeclarado = 10000;
    }

    let isFromWs = false;
    const fallbackCalculate = () => {
      if (isFromWs) {
        throw new Error('WS already tried and failed');
      }
      let nCdServico = '';
      if (Array.isArray(appData?.services) && appData.services[0]) {
        nCdServico = appData.services[0].service_code;
        if (nCdServico) {
          for (let i = 1; i < appData.services.length; i++) {
            nCdServico += `,${appData.services[i].service_code}`;
          }
        }
      }
      const calculateParams = {
        sCepDestino,
        nCdEmpresa,
        sDsSenha,
        nCdServico,
        sCepOrigem,
        nVlPeso,
      };
      // logger.info(`[calculate] Fallback calculate for ${sCepDestino}`)
      return correiosWs(calculateParams, 24000)
        .then((result) => {
          if (result) {
            const services = Array.isArray(result.Servicos)
              ? result.Servicos
              : Array.isArray(result.Servicos.cServico)
                ? result.Servicos.cServico
                : [result.Servicos.cServico];
            if (services[0] && services[0].Codigo) {
              // logger.info(`[calculate] Fallback calculate for ${sCepDestino} finished`)
              isFromWs = true;
              return services;
            }
          }
          throw new Error('Any available service calculated');
        });
    };

    const sendServices = () => {
    };

    let docParams;
    let docId;
    let docSnapshot;

    try {
      docParams = {
        sCepDestino: (Number(sCepDestino) - (Number(sCepDestino) % zipRangeStep) + 1)
          .toString().padStart(8, '0'),
        nVlPeso: findBaseWeight(nVlPeso),
        nCdEmpresa,
        sCepOrigem,
      };
      docId = getDocId(docParams);
      docSnapshot = await getFirestore().doc(docId).get();
    } catch (err) {
      logger.error(new Error(`[calculate] Cannot get doc ID ${docId}`));
      logger.error(err);
    }
    let docData;
    let services;

    if (docSnapshot.exists) {
      try {
        docData = docSnapshot.data();
        services = docData.services || docToServices(docData);
      } catch (err) {
        logger.error(new Error(`[calculate] Cannot parse services for ${docId}`));
        logger.error(err);
      }
    } else {
      logger.warn(`[calculate] No results stored with ${JSON.stringify(docParams)}`);
    }

    if (services && services[0] && services[0].Codigo) {
      return sendServices(services);
    }
    // unexpected result object
    logger.warn(`[calculate] Invalid services object on doc ${docId}`);
    try {
      return fallbackCalculate()
        .then(sendServices);
    } catch {
      return {
        error: 'CALCULATE_UNEXPECTED_RSP',
        message: 'Unexpected object from Correios response, please try again later',
      };
    }
  } else {
    return {
      error: 'CALCULATE_EMPTY_CART',
      message: 'Cannot calculate shipping without cart items',
    };
  }

  return response;
};
