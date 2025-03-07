import type {
  AppModuleBody,
  CalculateShippingParams,
  CalculateShippingResponse,
} from '@cloudcommerce/types';
import axios from 'axios';
import { logger } from '@cloudcommerce/firebase/lib/config';
import ecomUtils from '@ecomplus/utils';

type ShippingItem = Exclude<CalculateShippingParams['items'], undefined>[0];

const calcWeight = (item: ShippingItem) => {
  if (!item || !item.weight || !item.weight.value) {
    return 0.000000001; // Min weight required by Mandae
  }
  const unit = item.weight.unit;
  switch (unit) {
    case 'kg':
      return item.weight.value;
    case 'g':
      return item.weight.value / 1000;
    case 'mg':
      return item.weight.value / 1000000;
    default:
      return item.weight.value;
  }
};

const calcDimension = (item, dimensionType) => {
  if (!item || !item.dimensions || !item.dimensions[dimensionType]
    || !item.dimensions[dimensionType].value) {
    return 0.1;
  }
  const unit = item.dimensions[dimensionType].unit || 'cm';
  let result;
  switch (unit) {
    case 'm':
      result = item.dimensions[dimensionType].value * 100;
      break;
    case 'dm':
      result = item.dimensions[dimensionType].value * 10;
      break;
    case 'mm':
      result = item.dimensions[dimensionType].value / 10;
      break;
    case 'cm':
      result = item.dimensions[dimensionType].value;
      break;
    default:
      break;
  }
  return result;
};

const checkZipCode = (destinationZip, rule) => {
  // validate rule zip range
  if (destinationZip && rule.zip_range) {
    const { min, max } = rule.zip_range;
    return Boolean((!min || destinationZip >= min) && (!max || destinationZip <= max));
  }
  return true;
};

const applyShippingDiscount = (destinationZip, totalItems, shippingRules, shipping) => {
  let value = shipping.price;
  if (Array.isArray(shippingRules)) {
    for (let i = 0; i < shippingRules.length; i++) {
      const rule = shippingRules[i];
      if (
        rule
        && checkZipCode(destinationZip, rule)
        && (rule.service === 'Todos' || rule.service === shipping.name)
        && totalItems >= rule.min_amount
      ) {
        if (rule.free_shipping) {
          value = 0;
          break;
        } else if (typeof rule.fixed === 'number' && rule.fixed) {
          value = rule.fixed;
          break;
        } else if (rule.discount) {
          let discountValue = rule.discount.value;
          if (rule.discount.percentage || rule.discount.type === 'Percentual') {
            discountValue *= (value / 100);
          } else if (rule.discount.type === 'Percentual no subtotal') {
            discountValue *= (totalItems / 100);
          }
          if (discountValue) {
            value -= discountValue;
            if (value < 0) {
              value = 0;
            }
          }
          break;
        }
      }
    }
  }
  return value;
};

const isDisabledService = (destinationZip, disableServices, shipping) => {
  if (Array.isArray(disableServices)) {
    for (let i = 0; i < disableServices.length; i++) {
      const rule = disableServices[i];
      if (rule && checkZipCode(destinationZip, rule)
        && (rule.service === 'Todos' || rule.service === shipping.name)) {
        return true;
      }
    }
  }
  return false;
};

export const calculateShipping = async (modBody: AppModuleBody<'calculate_shipping'>) => {
  const { params, application } = modBody;
  const appData = {
    ...application.data,
    ...application.hidden_data,
  };
  const mandaeToken = appData.mandae_token;
  if (mandaeToken && typeof mandaeToken === 'string') {
    process.env.MANDAE_TOKEN = mandaeToken;
  }
  if (!process.env.MANDAE_TOKEN) {
    logger.warn('Missing Mandae token');
    return {
      error: 'NO_MANDAE_TOKEN',
      message: 'The Mandaê token is not defined (merchant must configure the app)',
    };
  }

  const response: CalculateShippingResponse = {
    shipping_services: [],
  };
  if (appData.free_shipping_from_value >= 0) {
    response.free_shipping_from_value = appData.free_shipping_from_value;
  }
  const destinationZip = params.to ? params.to.zip.replace(/\D/g, '') : '';

  if (Array.isArray(appData.shipping_rules)) {
    for (let i = 0; i < appData.shipping_rules.length; i++) {
      const rule = appData.shipping_rules[i];
      if (rule.free_shipping && checkZipCode(destinationZip, rule)) {
        if (!rule.min_amount) {
          response.free_shipping_from_value = 0;
          break;
        } else if (!(response.free_shipping_from_value! <= rule.min_amount)) {
          response.free_shipping_from_value = rule.min_amount;
        }
      }
    }
  }
  if (!params.to) {
    // Just a free shipping preview with no shipping address received
    return response;
  }

  let originZip = '';
  if (params.from) {
    originZip = params.from.zip.replace(/\D/g, '');
  } else if (appData.zip) {
    originZip = appData.zip.replace(/\D/g, '');
  }
  if (!originZip) {
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
  if (destinationZip.length !== 8) {
    return {
      error: 'CALCULATE_INVALID_ZIP',
      message: `Zip code ${destinationZip} is invalid for shipping calculation`,
    };
  }

  const items: Record<string, any>[] = [];
  let totalItems = 0;
  params.items.forEach((item) => {
    if (item.quantity > 0) {
      totalItems += (ecomUtils.price(item) * item.quantity);
      items.push({
        declaredValue: ecomUtils.price(item),
        weight: calcWeight(item),
        height: calcDimension(item, 'height'),
        width: calcDimension(item, 'width'),
        length: calcDimension(item, 'length'),
        quantity: item.quantity,
      });
    }
  });

  return axios(
    {
      url: `https://api.mandae.com.br/v3/postalcodes/${destinationZip}/rates`,
      method: 'POST',
      data: {
        items,
      },
      headers: {
        Authorization: process.env.MANDAE_TOKEN,
      },
    },
  ).then(({ data, status }) => {
    if (status === 200) {
      data.data?.shippingServices?.forEach((shipping) => {
        if (!isDisabledService(destinationZip, appData.disable_services, shipping)) {
          let totalPrice = applyShippingDiscount(
            destinationZip,
            totalItems,
            appData.shipping_rules,
            shipping,
          );

          if (appData.additional_price && totalPrice) {
            totalPrice += appData.additional_price;
          }
          if (totalPrice < 0) {
            totalPrice = 0;
          }
          const discount = shipping.price - totalPrice;
          const shippingService: CalculateShippingResponse['shipping_services'][0] = {
            label: shipping.name,
            carrier: shipping.name,
            service_name: 'Mandae',
            service_code: `Mandae_${shipping.name}`,
            shipping_line: {
              price: shipping.price,
              total_price: totalPrice,
              discount,
              delivery_time: {
                days: shipping.days,
                working_days: true,
              },
              posting_deadline: {
                days: 3,
                ...appData.posting_deadline,
              },
              from: {
                zip: originZip,
              },
              to: {
                ...params.to,
                zip: (data.data && data.data.postalCode) || params.to?.zip,
              },
            },
          };
          if (Array.isArray(appData.carriers)) {
            const carrier = appData.carriers.find(({ service }) => {
              return service === shipping.name || !service || service === 'Todos';
            });
            if (carrier) {
              if (carrier.carrier) {
                shippingService.carrier = carrier.carrier;
              }
              if (carrier.carrier_doc_number) {
                shippingService.carrier_doc_number = carrier.carrier_doc_number.replace(/\D/g, '');
              }
            }
          }
          response.shipping_services.push(shippingService);
        }
      });
      return response;
    }
    const err: any = new Error('Invalid Mandae calculate response');
    err.response = { data, status };
    throw err;
  }).catch((error) => {
    if (error && error.response) {
      const mandaeErrorMsg = error.response.data?.error?.message;
      const message = (typeof mandaeErrorMsg === 'string' && mandaeErrorMsg)
        || (error.message as string)
        || '';
      return {
        error: message.includes('Cep nulo ou não localizado')
          ? 'CALCULATE_INVALID_ZIP'
          : 'CALCULATE_SHIPPING_ERROR',
        message,
      };
    }
    return {
      error: 'CALCULATE_FAILED',
      message: error.message,
    };
  });
};

export default calculateShipping;
