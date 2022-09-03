export default async ({ params, application }) => {
  const config = {
    ...application.data,
    ...application.hidden_data,
  };
  // https://apx-mods.e-com.plus/api/v1/calculate_shipping/response_schema.json?store_id=100
  const response = {
    shipping_services: [],
  };
  let shippingRules;
  if (Array.isArray(config.shipping_rules) && config.shipping_rules.length) {
    shippingRules = config.shipping_rules;
  } else {
    // anything to do without shipping rules
    return response;
  }

  const destinationZip = params.to?.zip.replace(/\D/g, '') || '';
  let originZip = params.from?.zip || config.zip || '';
  const checkZipCode = (rule) => {
    // validate rule zip range
    if (destinationZip && rule.zip_range) {
      const { min, max } = rule.zip_range;
      return Boolean((!min || destinationZip >= min) && (!max || destinationZip <= max));
    }
    return true;
  };

  // search for configured free shipping rule and origin zip by rule
  for (let i = 0; i < shippingRules.length; i++) {
    const rule = shippingRules[i];
    if (
      checkZipCode(rule)
      && !rule.total_price
      && !rule.disable_free_shipping_from
      && !(rule.excedent_weight_cost > 0)
      && !(rule.amount_tax > 0)
    ) {
      if (!originZip && rule.from && rule.from.zip) {
        originZip = rule.from.zip;
      }
      if (!rule.min_amount) {
        response.free_shipping_from_value = 0;
        if (originZip) {
          break;
        }
      } else if (!(response.free_shipping_from_value <= rule.min_amount)) {
        response.free_shipping_from_value = rule.min_amount;
      }
    }
  }

  // params object follows calculate shipping request schema:
  // https://apx-mods.e-com.plus/api/v1/calculate_shipping/schema.json?store_id=100
  if (!params.to) {
    // respond only with free shipping option
    return response;
  }

  if (!originZip) {
    // must have configured origin zip code to continue
    const rule = shippingRules.find((_rule) => {
      return Boolean(checkZipCode(_rule) && _rule.from && _rule.from.zip);
    });
    if (rule) {
      originZip = rule.from.zip;
    }
    if (!originZip) {
      return {
        error: 'CALCULATE_ERR',
        message: 'Zip code is unset on app hidden data (merchant must configure the app)',
      };
    }
  }

  // calculate weight and pkg value from items list
  let amount = params.subtotal || 0;
  if (params.items) {
    let finalWeight = 0;
    params.items.forEach(({
      price,
      quantity,
      dimensions,
      weight,
    }) => {
      let physicalWeight = 0;
      let cubicWeight = 1;
      if (!params.subtotal) {
        amount += price * quantity;
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
            cubicWeight *= sumDimensions[side];
          }
        });
        if (cubicWeight > 0) {
          cubicWeight /= 6000;
        }
      }
      const unitWeight = cubicWeight < 5 || physicalWeight > cubicWeight
        ? physicalWeight : cubicWeight;
      finalWeight += (quantity * unitWeight);
    });

    // start filtering shipping rules
    const validShippingRules = shippingRules.filter((rule) => {
      if (typeof rule === 'object' && rule) {
        return (!params.service_code || params.service_code === rule.service_code)
          && checkZipCode(rule)
          && (!rule.min_amount || amount >= rule.min_amount)
          && (!rule.max_cubic_weight
            || rule.excedent_weight_cost > 0
            || finalWeight <= rule.max_cubic_weight);
      }
      return false;
    });

    if (validShippingRules.length) {
      // group by service code selecting lower price
      const shippingRulesByCode = validShippingRules.reduce((_shippingRulesByCode, rule) => {
        if (typeof rule.total_price !== 'number') {
          rule.total_price = 0;
        }
        if (typeof rule.price !== 'number') {
          rule.price = rule.total_price;
        }
        if (rule.excedent_weight_cost > 0 && finalWeight > rule.max_cubic_weight) {
          rule.total_price += (rule.excedent_weight_cost * (finalWeight - rule.max_cubic_weight));
        }
        if (typeof rule.amount_tax === 'number' && !Number.isNaN(rule.amount_tax)) {
          rule.total_price += ((rule.amount_tax * amount) / 100);
        }
        const serviceCode = rule.service_code;
        const currentShippingRule = _shippingRulesByCode[serviceCode];
        if (!currentShippingRule || currentShippingRule.total_price > rule.total_price) {
          _shippingRulesByCode[serviceCode] = rule;
        }
        return _shippingRulesByCode;
      }, {});

      // parse final shipping rules object to shipping services array
      Object.keys(shippingRulesByCode).forEach((serviceCode) => {
        const rule = shippingRulesByCode[serviceCode];
        if (rule) {
          let { label } = rule;
          // delete filter properties from rule object
          delete rule.service_code;
          delete rule.zip_range;
          delete rule.min_amount;
          delete rule.max_cubic_weight;
          delete rule.excedent_weight_cost;
          delete rule.amount_tax;
          delete rule.label;

          // also try to find corresponding service object from config
          let service;
          if (Array.isArray(config.services)) {
            service = config.services.find((_service) => {
              return _service && _service.service_code === serviceCode;
            });
            if (service && !label) {
              label = service.label;
            }
          }
          if (!label) {
            label = serviceCode;
          }

          response.shipping_services.push({
            // label, service_code, carrier (and maybe more) from service object
            ...service,
            service_code: serviceCode,
            label,
            shipping_line: {
              from: {
                ...rule.from,
                ...params.from,
                zip: String((rule.from && rule.from.zip) || originZip).replace(/\D/g, ''),
              },
              to: params.to,
              price: 0,
              total_price: 0,
              // price, total_price (and maybe more) from rule object
              ...rule,
              delivery_time: {
                days: 20,
                working_days: true,
                ...rule.delivery_time,
              },
              posting_deadline: {
                days: 0,
                ...config.posting_deadline,
                ...rule.posting_deadline,
              },
            },
          });
        }
      });
    }
  }
  // expecting to have response with shipping services here
  return response;
};
