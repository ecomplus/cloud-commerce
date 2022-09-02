import correiosCalculate from './correios-ws.mjs';

export default async ({ params, application }) => {
  const config = {
    ...application.data,
    ...application.hidden_data,
  };

  // Correios calculate params
  let nCdServico;
  let sCdMaoPropria;
  let sCdAvisoRecebimento;
  let nVlPeso = 0;
  let nVlValorDeclarado = 0;
  let nCdEmpresa = '';
  let sDsSenha = '';
  const contract = config.correios_contract;
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
  const sCepDestino = params.to?.zip.replace(/\D/g, '') || '';
  const sCepOrigem = params.from?.zip.replace(/\D/g, '')
    || config.zip?.replace(/\D/g, '')
    || '';

  const checkZipCode = (rule) => {
    // validate rule zip range
    if (sCepDestino && rule.zip_range) {
      const { min, max } = rule.zip_range;
      return Boolean((!min || sCepDestino >= min) && (!max || sCepDestino <= max));
    }
    return true;
  };

  // https://apx-mods.e-com.plus/api/v1/calculate_shipping/response_schema.json?store_id=100
  const response = {
    shipping_services: [],
  };
  // search for configured free shipping rule
  if (Array.isArray(config.shipping_rules)) {
    for (let i = 0; i < config.shipping_rules.length; i++) {
      const rule = config.shipping_rules[i];
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
    // must have configured origin zip code to continue
    return {
      error: 'CALCULATE_ERR',
      message: 'Zip code is unset on app hidden data (merchant must configure the app)',
    };
  }

  // optinal predefined or configured service codes
  if (params.service_code) {
    nCdServico = params.service_code;
  } else if (Array.isArray(config.services) && config.services[0]) {
    const firstServiceCode = config.services[0].service_code;
    if (firstServiceCode) {
      nCdServico = firstServiceCode;
      for (let i = 1; i < config.services.length; i++) {
        nCdServico += `,${config.services[i].service_code}`;
      }
    }
  }

  // optional params to Correios services
  if (params.subtotal && !config.no_declare_value) {
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
      price,
      quantity,
      dimensions,
      weight,
    }) => {
      let physicalWeight = 0;
      let cubicWeight = 0;
      if (!params.subtotal && !config.no_declare_value) {
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
      if (!config.free_no_weight_shipping || physicalWeight > 0) {
        const finalWeight = cubicWeight < 5 || physicalWeight > cubicWeight
          ? physicalWeight : cubicWeight;
        nVlPeso += (quantity * finalWeight);
      }
    });

    // pre check for maximum allowed declared value
    if (nVlValorDeclarado > 10000) {
      nVlValorDeclarado = 10000;
    }

    let result;
    try {
      result = await correiosCalculate({
        sCepOrigem,
        sCepDestino,
        nCdEmpresa,
        sDsSenha,
        nCdServico,
        sCdMaoPropria,
        sCdAvisoRecebimento,
        nVlPeso,
        nVlValorDeclarado,
      });
    } catch (err) {
      return {
        error: 'CALCULATE_FAILED',
        message: err.message,
      };
    }

    const { Servicos, cServico } = result;
    // set services array from `Servicos` or `cServico`
    let services;
    if (Servicos) {
      if (Array.isArray(Servicos)) {
        services = Servicos;
      } else if (Servicos.cServico) {
        services = Array.isArray(Servicos.cServico) ? Servicos.cServico : [Servicos.cServico];
      }
    }
    if (!services) {
      services = Array.isArray(cServico) ? cServico : [cServico];
    }

    if (services[0] && services[0].Codigo) {
      let errorMsg;
      services.forEach((service) => {
        // check error first
        let { Erro, PrazoEntrega } = service;
        const { MsgErro, url } = service;
        let notes;
        PrazoEntrega = parseInt(PrazoEntrega, 10);
        // known Correios errors
        switch (Erro) {
          case '010':
          case 10:
            Erro = false;
            notes = MsgErro;
            break;
          case '011':
          case 11:
            Erro = false;
            PrazoEntrega += 7;
            break;
          default:
        }

        if ((!Erro || Erro === '0') && PrazoEntrega >= 0) {
          // fix price strings to number
          [
            'Valor',
            'ValorSemAdicionais',
            'ValorMaoPropria',
            'ValorAvisoRecebimento',
            'ValorValorDeclarado',
          ].forEach((field) => {
            switch (typeof service[field]) {
              case 'number':
                break;
              case 'string':
                service[field] = parseFloat(service[field].replace('.', '').replace(',', '.'));
                break;
              default:
                service[field] = 0;
            }
          });
          const {
            Codigo,
            Valor,
            ValorSemAdicionais,
            ValorMaoPropria,
            ValorAvisoRecebimento,
            ValorValorDeclarado,
          } = service;

          // find respective configured service label
          let serviceName;
          switch (Codigo) {
            case '04014':
              serviceName = 'SEDEX';
              break;
            case '04510':
              serviceName = 'PAC';
              break;
            default:
          }
          let label = serviceName || `Correios ${Codigo}`;
          if (Array.isArray(config.services)) {
            for (let i = 0; i < config.services.length; i++) {
              const service = config.services[i];
              if (service && service.service_code === Codigo && service.label) {
                label = service.label;
              }
            }
          }

          // parse to E-Com Plus shipping line object
          const shippingLine = {
            from: {
              ...params.from,
              zip: sCepOrigem,
            },
            to: params.to,
            package: pkg,
            price: ValorSemAdicionais || Valor,
            declared_value: nVlValorDeclarado,
            declared_value_price: ValorValorDeclarado > 0 ? ValorValorDeclarado : 0,
            own_hand: Boolean(sCdMaoPropria),
            own_hand_price: ValorMaoPropria,
            receipt: Boolean(sCdAvisoRecebimento),
            receipt_price: ValorAvisoRecebimento,
            discount: 0,
            total_price: Valor,
            delivery_time: {
              days: PrazoEntrega,
              working_days: true,
            },
            posting_deadline: {
              days: 3,
              ...config.posting_deadline,
            },
            flags: ['correios-ws'],
            notes,
          };

          // check for default configured additional/discount price
          if (typeof config.additional_price === 'number' && config.additional_price) {
            if (config.additional_price > 0) {
              shippingLine.other_additionals = [{
                tag: 'additional_price',
                label: 'Adicional padrão',
                price: config.additional_price,
              }];
            } else {
              // negative additional price to apply discount
              shippingLine.discount -= config.additional_price;
            }
            // update total price
            shippingLine.total_price += config.additional_price;
          }

          // search for discount by shipping rule
          if (Array.isArray(config.shipping_rules)) {
            for (let i = 0; i < config.shipping_rules.length; i++) {
              const rule = config.shipping_rules[i];
              if (
                rule
                && (!rule.service_code || rule.service_code === Codigo)
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

          if (typeof url === 'string') {
            // add WS URL to custom fields to facilitate debugging
            shippingLine.custom_fields = [{
              field: 'correios_ws_params',
              value: (nCdEmpresa ? url.replace(nCdEmpresa, 'c').replace(sDsSenha, 's') : url)
                .replace(/[^?]+\?(.*)/, '$1')
                .replace(/(StrRetorno|nIndicaCalculo|nCdFormato|nVlDiametro)=[^&]+&?/g, '')
                .slice(0, 255),
            }];
          }

          // push shipping service object to response
          response.shipping_services.push({
            label,
            carrier: 'Correios',
            // https://informederendimentos.com/consulta/cnpj-correios/
            carrier_doc_number: '34028316000103',
            service_code: Codigo,
            service_name: serviceName || label,
            shipping_line: shippingLine,
          });
        } else {
          errorMsg = `Correios erro ${Erro}`;
          if (typeof MsgErro === 'string') {
            errorMsg += `: ${MsgErro}`;
          }
          if (typeof url === 'string') {
            errorMsg += `\n${url}`;
          }
        }
      });

      if (response.shipping_services.length) {
        // free shipping if all items has no weigth
        const freeNoWeightShipping = nVlPeso <= 0 && config.free_no_weight_shipping;
        if (freeNoWeightShipping) {
          let cheapestShippingLine;
          for (let i = 0; i < response.shipping_services.length; i++) {
            const shippingLine = response.shipping_services[i].shipping_line;
            if (!shippingLine.total_price) {
              // already free
              break;
            }
            if (
              !cheapestShippingLine
              || cheapestShippingLine.total_price > shippingLine.total_price
            ) {
              cheapestShippingLine = shippingLine;
            }
          }
          if (cheapestShippingLine) {
            // set the cheapest shipping line free
            cheapestShippingLine.discount = cheapestShippingLine.total_price;
            cheapestShippingLine.total_price = 0;
            cheapestShippingLine.flags.push('free_no_weight');
          }
        }
      } else if (errorMsg) {
        // pass Correios error message
        return {
          error: 'CALCULATE_ERR_MSG',
          message: errorMsg,
        };
      }

      // success response with available shipping services
      return response;
    }

    // unexpected result object
    return {
      error: 'CALCULATE_UNEXPECTED_RSP',
      message: 'Unexpected object from Correios response, please try again later',
    };
  }
  return {
    error: 'CALCULATE_EMPTY_CART',
    message: 'Cannot calculate shipping without cart items',
  };
};
