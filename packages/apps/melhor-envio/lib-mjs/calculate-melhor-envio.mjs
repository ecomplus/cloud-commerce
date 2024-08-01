import logger from 'firebase-functions/logger';
import api from '@cloudcommerce/api';
import { newShipment, matchService, sortServicesBy } from './functions/new-shipment.mjs';
import meClient from './functions/client-melhor-envio.mjs';
import errorHandling from './functions/error-handling.mjs';

export default async ({ params, application }) => {
  const appData = {
    ...application.data,
    ...application.hidden_data,
  };

  const melhorEnvioToken = appData.access_token;
  if (typeof melhorEnvioToken === 'string' && melhorEnvioToken) {
    process.env.MELHORENVIO_TOKEN = melhorEnvioToken;
  }
  if (!process.env.MELHORENVIO_TOKEN) {
    logger.warn('Missing Melhor Envio token');
    return {
      status: 409,
      error: 'CALCULATE_SHIPPING_DISABLED',
      message: 'Melhor Envio Token is unset',
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

  if (params.items) {
    const intZipCode = parseInt(params.to.zip.replace(/\D/g, ''), 10);
    const { sandbox } = appData;

    if (!appData.merchant_address) {
      // get merchant_address
      const { data } = await meClient(process.env.MELHORENVIO_TOKEN, sandbox).get('/');
      const merchantAddress = data.address;

      // update config.merchant_address
      appData.merchant_address = merchantAddress;
      // save merchant_address in hidden_data

      const bodyUpdate = {
        merchant_address: merchantAddress,
      };
      try {
        await api.patch(`applications/${application._id}/hidden_data`, bodyUpdate);
      } catch (err) {
        logger.error('>>(App Melhor Envio): !<> Update merchant_address failed', err.message);
      }
    }

    let schema;
    try {
      schema = newShipment(appData, params);
    } catch (e) {
      logger.error('>>(App Melhor Envio): NEW_SHIPMENT_PARSE_ERR', e);
      return {
        status: 400,
        error: 'CALCULATE_ERR',
        message: 'Unexpected Error Try Later',
      };
    }

    // calculate the shipment
    try {
      const data = await meClient(process.env.MELHORENVIO_TOKEN, sandbox)
        .post('/shipment/calculate', schema);

      let errorMsg;
      data.forEach((service) => {
        let isAvailable = true;
        // check if service is not disabled
        if (Array.isArray(appData.unavailable_for)) {
          for (let i = 0; i < appData.unavailable_for.length; i++) {
            if (appData.unavailable_for[i] && appData.unavailable_for[i].zip_range
              && appData.unavailable_for[i].service_name
            ) {
              const unavailable = appData.unavailable_for[i];
              if (intZipCode >= unavailable.zip_range.min
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
          const { to } = params;
          const from = {
            zip: appData.merchant_address.postal_code,
            street: appData.merchant_address.address,
            number: parseInt(appData.merchant_address.number, 10),
          };

          const shippingLine = {
            to,
            from,
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
            },
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

          if (appData.jadlog_agency) {
            shippingLine.custom_fields.push({
              field: 'jadlog_agency',
              value: String(appData.jadlog_agency),
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
          }

          // search for discount by shipping rule
          if (Array.isArray(shippingRules)) {
            for (let i = 0; i < shippingRules.length; i++) {
              const rule = shippingRules[i];
              if (rule && matchService(rule, service.name)
                && checkZipCode(rule) && !(rule.min_amount > params.subtotal)
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
                  shippingLine.discount += discountValue;
                  shippingLine.total_price -= discountValue;
                  if (shippingLine.total_price < 0) {
                    shippingLine.total_price = 0;
                  }
                  break;
                }
              }
            }
          }

          let label = service.name;
          if (appData.services && Array.isArray(appData.services) && appData.services.length) {
            const serviceFound = appData.services.find((lookForService) => {
              return lookForService && matchService(lookForService, label);
            });
            if (serviceFound && serviceFound.label) {
              label = serviceFound.label;
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

      // sort services?
      if (appData.sort_services && Array.isArray(response.shipping_services)
        && response.shipping_services.length) {
        response.shipping_services.sort(sortServicesBy(appData.sort_services));
      }

      return (!Array.isArray(response.shipping_services) || !response.shipping_services.length)
        && errorMsg
        ? {
          status: 400,
          error: 'CALCULATE_ERR_MSG',
          message: errorMsg,
        }
        // success response with available shipping services
        : response;
    } catch (err) {
      let message = 'Unexpected Error Try Later';
      if (err.response && err.isAxiosError) {
        const { data, status, config } = err.response;
        let isAppError = true;
        if (status >= 500) {
          message = 'Melhor Envio offline no momento';
          isAppError = false;
        } else if (data) {
          if (data.errors && typeof data.errors === 'object' && Object.keys(data.errors).length) {
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
          logger.error('>>(App Melhor Envio): CalculateShippingErr:', JSON.stringify({
            status,
            data,
            config,
          }, null, 4));
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
  } else {
    return {
      status: 400,
      error: 'CALCULATE_EMPTY_CART',
      message: 'Cannot calculate shipping without cart items',
    };
  }
};
