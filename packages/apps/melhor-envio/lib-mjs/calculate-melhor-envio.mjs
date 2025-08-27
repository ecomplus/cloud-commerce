import logger from 'firebase-functions/logger';
import api from '@cloudcommerce/api';
import { newShipment, matchService, sortServicesBy } from './functions/new-shipment.mjs';
import { getMEAxios } from './util/melhor-envio-api.mjs';
import errorHandling from './functions/error-handling.mjs';

export default async ({ params, application }) => {
  const appData = {
    ...application.data,
    ...application.hidden_data,
  };

  if (appData.access_token) {
    process.env.MELHORENVIO_TOKEN = appData.access_token;
  }
  process.env.MELHORENVIO_ENV = appData.sandbox
    ? 'sandbox'
    : process.env.MELHORENVIO_ENV || 'live';
  if (!process.env.MELHORENVIO_TOKEN) {
    logger.warn('Missing Melhor Envio token');
    return {
      status: 409,
      error: 'CALCULATE_SHIPPING_DISABLED',
      message: 'Melhor Envio Token is not set',
    };
  }

  if (
    appData.skip_no_weight_item
    && params.items && params.items.find(({ weight }) => weight && !weight.value)
  ) {
    return {
      status: 409,
      error: 'CALCULATE_SHIPPING_SKIPPED',
      message: 'Melhor Envio configured to skip no weight items',
    };
  }
  // start mounting response body
  // https://apx-mods.e-com.plus/api/v1/calculate_shipping/response_schema.json?store_id=100
  const response = {
    shipping_services: [],
  };

  let shippingRules;
  if (Array.isArray(appData.shipping_rules) && appData.shipping_rules.length) {
    shippingRules = appData.shipping_rules;
  } else {
    shippingRules = [];
  }

  const destinationZip = params.to ? params.to.zip.replace(/\D/g, '') : '';

  const checkZipCode = (rule) => {
    // validate rule zip range
    if (destinationZip && rule.zip_range) {
      const { min, max } = rule.zip_range;
      return Boolean((!min || destinationZip >= min) && (!max || destinationZip <= max));
    }
    return true;
  };

  // search for configured free shipping rule
  if (Array.isArray(shippingRules)) {
    for (let i = 0; i < shippingRules.length; i++) {
      const rule = shippingRules[i];
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

  const meAxios = await getMEAxios();

  if (params.items) {
    const intZipCode = parseInt(params.to.zip.replace(/\D/g, ''), 10);
    if (!appData.merchant_address) {
      // get merchant_address
      const { data } = await meAxios.get('/');
      const merchantAddress = data.address;

      // update config.merchant_address
      appData.merchant_address = merchantAddress;
      // save merchant_address in hidden_data

      try {
        await api.patch(`applications/${application._id}/hidden_data`, {
          merchant_address: merchantAddress,
        });
      } catch (err) {
        logger.warn('Update merchant_address failed');
        logger.error(err);
      }
    }

    let originZip;
    let warehouseCode;
    let postingDeadline;
    let warehouseConfig = {};
    let from = {
      zip: appData.merchant_address.postal_code,
      street: appData.merchant_address.address,
      number: parseInt(appData.merchant_address.number, 10),
    };
    if (params.from) {
      from = params.from;
      originZip = params.from.zip;
    } else if (Array.isArray(appData.warehouses) && appData.warehouses.length) {
      for (let i = 0; i < appData.warehouses.length; i++) {
        const warehouse = appData.warehouses[i];
        if (warehouse && warehouse.zip && checkZipCode(warehouse)) {
          const { code } = warehouse;
          if (!code) {
            continue;
          }
          if (
            params.items
            && params.items.find(({ quantity, inventory }) => {
              return inventory && Object.keys(inventory).length
                && !(inventory[code] >= quantity);
            })
          ) {
            // item not available on current warehouse
            continue;
          }
          originZip = warehouse.zip;
          if (warehouse.posting_deadline) {
            postingDeadline = warehouse.posting_deadline;
          }
          if (warehouse && warehouse.street) {
            ['zip', 'street', 'number', 'complement', 'borough', 'city', 'province_code']
              .forEach((prop) => {
                if (warehouse[prop]) {
                  from[prop] = warehouse[prop];
                }
              });
          }
          /*
          if (warehouse.doc) {
            docNumber = warehouse.doc
          }
          */
          warehouseCode = code;
          warehouseConfig = warehouse;
        }
      }
    }
    if (!originZip) {
      originZip = appData.merchant_address.postal_code;
    }
    originZip = typeof originZip === 'string' ? originZip.replace(/\D/g, '') : '';

    let schema;
    try {
      schema = newShipment(appData, { originZip, ...params });
    } catch (err) {
      logger.warn('Failed parsing shipment');
      logger.error(err);
      return {
        status: 400,
        error: 'CALCULATE_ERR',
        message: 'Unexpected Error Try Later',
      };
    }

    try {
      const { data } = await meAxios.post('/shipment/calculate', schema);

      if (!data.length) {
        logger.warn('Empty ME calculate result', {
          data,
          schema,
        });
      }

      let errorMsg;
      data.forEach((service) => {
        let isAvailable = true;
        // check if service is not disabled
        if (Array.isArray(appData.unavailable_for)) {
          for (let i = 0; i < appData.unavailable_for.length; i++) {
            if (
              appData.unavailable_for[i] && appData.unavailable_for[i].zip_range
              && appData.unavailable_for[i].service_name
            ) {
              const unavailable = appData.unavailable_for[i];
              if (
                intZipCode >= unavailable.zip_range.min
                && intZipCode <= unavailable.zip_range.max
                && matchService(unavailable, service.name)
              ) {
                isAvailable = false;
              }
            }
          }
        }

        if (!service.error && isAvailable) {
          // mounte response body
          const shippingLine = {
            from: {
              ...params.from,
              ...appData.from,
              ...from,
              zip: originZip,
            },
            to: params.to,
            own_hand: service.additional_services.own_hand,
            receipt: service.additional_services.receipt,
            discount: 0,
            total_price: parseFloat(service.price),
            delivery_time: {
              days: parseInt(service.delivery_time, 10),
              working_days: true,
            },
            posting_deadline: {
              days: 3,
              ...appData.posting_deadline,
              ...postingDeadline,
            },
            warehouse_code: warehouseCode,
            custom_fields: [
              {
                field: 'by_melhor_envio',
                value: 'true',
              },
            ],
          };

          const servicePkg = (service.packages && service.packages[0])
            || (service.volumes && service.volumes[0]);
          if (servicePkg) {
            shippingLine.package = {};
            if (servicePkg.dimensions) {
              shippingLine.package.dimensions = {
                width: {
                  value: servicePkg.dimensions.width,
                },
                height: {
                  value: servicePkg.dimensions.height,
                },
                length: {
                  value: servicePkg.dimensions.length,
                },
              };
            }
            if (servicePkg.weight) {
              shippingLine.package.weight = {
                value: parseFloat(servicePkg.weight),
                unit: 'kg',
              };
            }
          }

          const jadlogAgency = warehouseConfig.jadlog_agency || appData.jadlog_agency;
          if (jadlogAgency) {
            shippingLine.custom_fields.push({
              field: 'jadlog_agency',
              value: String(jadlogAgency),
            });
          }

          // check for default configured additional/discount price
          if (appData.additional_price) {
            if (appData.additional_price > 0) {
              shippingLine.other_additionals = [{
                tag: 'additional_price',
                label: 'Adicional padrão',
                price: appData.additional_price,
              }];
            } else {
              // negative additional price to apply discount
              shippingLine.discount -= appData.additional_price;
            }
            // update total price
            shippingLine.total_price += appData.additional_price;
            if (shippingLine.total_price < 0) {
              shippingLine.total_price = 0;
            }
          }

          // search for discount or fixed value by shipping rule
          if (Array.isArray(shippingRules)) {
            for (let i = 0; i < shippingRules.length; i++) {
              const rule = shippingRules[i];
              if (
                rule
                && matchService(rule, service.name)
                && checkZipCode(rule)
                && !(rule.min_amount > params.subtotal)
              ) {
                // valid shipping rule
                if (rule.free_shipping) {
                  shippingLine.discount += shippingLine.total_price;
                  shippingLine.total_price = 0;
                  break;
                } else if (rule.discount && rule.service_name) {
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
                } else if (rule.fixed) {
                  shippingLine.total_price = rule.fixed;
                }
              }
            }
          }

          let label = appData.prefix_labels === true
            ? `ME ${service.name}`
            : service.name;
          if (Array.isArray(appData.services) && appData.services.length) {
            const matchedService = appData.services.find((_service) => {
              return _service && matchService(_service, label);
            });
            if (matchedService?.label) {
              label = matchedService.label;
            }
          }

          response.shipping_services.push({
            label,
            carrier: service.company.name,
            service_name: service.name,
            service_code: `ME ${service.id}`,
            icon: service.company.picture,
            shipping_line: shippingLine,
          });
        } else {
          errorMsg += `${service.name}, ${service.error} \n`;
        }
      });

      if (
        appData.sort_services
        && Array.isArray(response.shipping_services)
        && response.shipping_services.length
      ) {
        response.shipping_services.sort(sortServicesBy(appData.sort_services));
      }
      if (appData.max_services > 0) {
        response.shipping_services = response.shipping_services
          .slice(0, appData.max_services);
      }

      if (
        !Array.isArray(response.shipping_services)
        || !response.shipping_services.length
      ) {
        if (errorMsg) {
          return {
            status: 400,
            error: 'CALCULATE_ERR_MSG',
            message: errorMsg,
          };
        }
      }
      return response;
    } catch (err) {
      let message = 'Unexpected Error Try Later';
      if (err.response && err.isAxiosError) {
        const { data, status, config } = err.response;
        let isAppError = true;
        if (status >= 500) {
          message = 'Melhor Envio offline no momento';
          isAppError = false;
        } else if (data) {
          if (
            data.errors
            && typeof data.errors === 'object'
            && Object.keys(data.errors).length
          ) {
            const errorKeys = Object.keys(data.errors);
            for (let i = 0; i < errorKeys.length; i++) {
              const meError = data.errors[errorKeys[i]];
              if (meError && meError.length) {
                message = Array.isArray(meError) ? meError[0] : meError;
                if (errorKeys[i].startsWith('to.')) {
                  // invalid merchant config on ME
                  // eg.: 'O campo to.postal code deve ter pelo menos 5 caracteres.'
                  isAppError = false;
                  break;
                } else {
                  message += errorKeys[i];
                }
              }
            }
          } else if (data.error) {
            message = `ME: ${data.error}`;
          } else if (data.message) {
            message = `ME: ${data.message}`;
          }
        }

        if (isAppError) {
          // debug unexpected error
          logger.error('CalculateShippingErr:', {
            status,
            data,
            config,
          });
        }
      } else {
        errorHandling(err);
      }
      return {
        status: 409,
        error: 'CALCULATE_ERR',
        message,
      };
    }
  }
  return {
    status: 400,
    error: 'CALCULATE_EMPTY_CART',
    message: 'Cannot calculate shipping without cart items',
  };
};
