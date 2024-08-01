import axios from 'axios';
import { logger } from '@cloudcommerce/firebase/lib/config';

const getDimension = (side, item) => {
  if (item.dimensions && item.dimensions[side]) {
    const { value, unit } = item.dimensions[side];
    switch (unit) {
      case 'm':
        return value * 100;
      case 'dm':
        return value * 10;
      case 'cm':
        return value;
      default:
        return 10;
    }
  }
  return 10;
};

export default async ({ params, application }) => {
  const config = {
    ...application.data,
    ...application.hidden_data,
  };

  const frenetToken = config.frenet_access_token;
  if (typeof frenetToken === 'string' && frenetToken) {
    process.env.FRENET_TOKEN = frenetToken;
  }
  if (!process.env.FRENET_TOKEN) {
    logger.warn('Missing Frenet token');
    return {
      error: 'FRENET_ERR',
      message: 'Frenet token is unset on app hidden data (calculate unavailable) for this store',
    };
  }

  // https://apx-mods.e-com.plus/api/v1/calculate_shipping/response_schema.json?store_id=100
  const { items, subtotal, to } = params;
  const response = {
    shipping_services: [],
  };

  if (config.free_shipping_from_value) {
    response.free_shipping_from_value = config.free_shipping_from_value;
  }

  if (!items || !subtotal || !to || !config.from) {
    // parameters required to perform the request
    return response;
  }

  // calculate
  const startedAt = Date.now();
  const getSchemaFrenet = () => {
    try {
      const schema = {
        SellerCEP: config.from.zip.replace('-', ''),
        RecipientCEP: to.zip.replace('-', ''),
        ShipmentInvoiceValue: subtotal,
        ShippingItemArray: [],
      };
      items.forEach((item) => {
        const { weight, quantity } = item;
        const calculeWeight = () => {
          if (weight) {
            return (weight.unit && weight.unit === 'g') ? (weight.value / 1000) : weight.value;
          }
          return undefined;
        };
        schema.ShippingItemArray.push({
          Weight: calculeWeight(),
          Length: getDimension('length', item),
          Height: getDimension('height', item),
          Width: getDimension('width', item),
          Quantity: quantity,
        });
      });
      return schema;
    } catch (error) {
      const err = new Error('Error with the body sent by the module');
      err.name = 'ParseFrenetSchemaError';
      err.error = error;
      throw err;
    }
  };

  try {
    const schema = getSchemaFrenet();
    const { data } = await axios({
      url: 'http://api.frenet.com.br/shipping/quote',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        token: process.env.FRENET_TOKEN,
      },
      data: schema,
    });
    if (!data || !Array.isArray(data.ShippingSevicesArray)) {
      return {
        error: 'SHIPPING_QUOTE_REQUEST_ERR',
        message: 'ShippingSevicesArray property not found, try Later',
      };
    }
    const { ShippingSevicesArray } = data;
    if (
      ShippingSevicesArray[0]?.Error
      && !ShippingSevicesArray.find(({ Error }) => Error === false)
    ) {
      return {
        error: 'CALCULATE_REQUEST_ERR',
        message: ShippingSevicesArray[0].Msg,
      };
    }

    response.shipping_services = ShippingSevicesArray
      .filter((service) => !service.Error)
      .map((service) => {
        return {
          label: service.ServiceDescription.length > 50
            ? service.Carrier
            : service.ServiceDescription,
          carrier: service.Carrier,
          service_name: service.ServiceDescription.length > 70
            ? service.Carrier
            : service.ServiceDescription,
          service_code: `FR${service.ServiceCode}`,
          delivery_instructions: service.ServiceDescription.length > 50
            ? service.ServiceDescription
            : undefined,
          shipping_line: {
            from: config.from,
            to,
            delivery_time: {
              days: parseInt(service.DeliveryTime || service.OriginalDeliveryTime, 10) || 14,
              working_days: true,
            },
            price: parseFloat(service.OriginalShippingPrice || service.ShippingPrice) || 0,
            total_price: parseFloat(service.ShippingPrice || service.OriginalShippingPrice) || 0,
            custom_fields: [
              {
                field: 'by_frenet',
                value: 'true',
              },
              {
                field: 'frenet:took',
                value: String(Date.now() - startedAt),
              },
            ],
          },
        };
      });
    return response;
  } catch (err) {
    return {
      error: 'FRENET_ERR',
      message: err.message,
    };
  }
};
