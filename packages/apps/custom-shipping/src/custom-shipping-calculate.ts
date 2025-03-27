import type { AppModuleBody, CalculateShippingResponse } from '@cloudcommerce/types';
import config from '@cloudcommerce/firebase/lib/config';

export const calculateShipping = async (modBody: AppModuleBody<'calculate_shipping'>) => {
  const { params, application } = modBody;
  const appData = {
    ...application.data,
    ...application.hidden_data,
  };
  const response: CalculateShippingResponse = {
    shipping_services: [],
  };
  const shippingRules = appData.shipping_rules;
  if (!Array.isArray(shippingRules) || !shippingRules.length) {
    // Anything to do without shipping rules
    return response;
  }

  const destinationZip = params.to?.zip.replace(/\D/g, '') || '';
  const checkZipCode = (rule) => {
    if (destinationZip && rule.zip_range) {
      const { min, max } = rule.zip_range;
      if (!min && !max) {
        return true;
      }
      if (!max) {
        return destinationZip === min;
      }
      if (!min) {
        return destinationZip === max;
      }
      return destinationZip >= min && destinationZip <= max;
    }
    return true;
  };

  let originZip: string | undefined;
  let warehouseCode: string | undefined;
  let postingDeadline = appData.posting_deadline;
  if (params.from) {
    originZip = params.from.zip;
  } else if (Array.isArray(appData.warehouses) && appData.warehouses.length) {
    for (let i = 0; i < appData.warehouses.length; i++) {
      const warehouse = appData.warehouses[i];
      if (warehouse?.zip && checkZipCode(warehouse)) {
        const { code } = warehouse;
        if (!code) continue;
        if (params.items) {
          const itemNotOnWarehouse = params.items.find(({ quantity, inventory }) => {
            return inventory && Object.keys(inventory).length && !(inventory[code] >= quantity);
          });
          if (itemNotOnWarehouse) continue;
        }
        originZip = warehouse.zip;
        if (warehouse.posting_deadline?.days) {
          postingDeadline = warehouse.posting_deadline;
        }
        warehouseCode = code;
      }
    }
  }
  if (!originZip) {
    originZip = appData.zip;
  }

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
      } else if (!(response.free_shipping_from_value! <= rule.min_amount)) {
        response.free_shipping_from_value = rule.min_amount;
      }
    }
  }
  if (!params.to) {
    // Just a free shipping preview with no shipping address received
    return response;
  }
  if (config.get().countryCode === 'BR' && destinationZip.length !== 8) {
    return {
      error: 'CALCULATE_INVALID_ZIP',
      message: `Zip code ${destinationZip} is invalid for BR country`,
    };
  }

  if (!originZip) {
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
        const serviceCode = rule.service_code;
        if (typeof rule.total_price !== 'number') {
          let service: Record<string, any> | undefined;
          if (Array.isArray(appData.services)) {
            service = appData.services.find((_service) => {
              return _service && _service.service_code === serviceCode;
            });
          }
          rule.total_price = service?.total_price || 0;
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
          let service: Record<string, any> | undefined;
          if (Array.isArray(appData.services)) {
            service = appData.services.find((_service) => {
              return _service && _service.service_code === serviceCode;
            });
            if (service) {
              if (!label) {
                label = service.label;
              }
              if (typeof rule.delivery_time?.days !== 'number') {
                rule.delivery_time = service.delivery_time;
              }
              delete service.delivery_time;
              delete service.total_price;
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
                ...postingDeadline,
                ...rule.posting_deadline,
              },
              warehouse_code: warehouseCode,
            },
          });
        }
      });
    }
  }
  // expecting to have response with shipping services here
  return response;
};

export default calculateShipping;
