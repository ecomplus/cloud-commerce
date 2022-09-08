import axios from 'axios';

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

  if (!config.frenet_access_token) {
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
  let took = Date.now();
  const getSchemaFrenet = () => new Promise((resolve, reject) => {
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
      resolve({ schema });
    } catch (error) {
      const err = new Error('Error with the body sent by the module');
      err.name = 'ParseFrenetSchemaError';
      err.error = error;
      reject(err);
    }
  });

  try {
    const { schema } = await getSchemaFrenet();
    const { data } = await axios({
      url: 'http://api.frenet.com.br/shipping/quote',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        token: config.frenet_access_token,
      },
      data: schema,
    });
    if (data && !data.ShippingSevicesArray) {
      return {
        error: 'SHIPPING_QUOTE_REQUEST_ERR',
        message: 'ShippingSevicesArray property not found, try Later',
      };
    }
    took = Date.now() - took;
    const { ShippingSevicesArray } = data;

    if (ShippingSevicesArray && Array.isArray(ShippingSevicesArray)
      && ShippingSevicesArray.length) {
      if (ShippingSevicesArray[0].Error && ShippingSevicesArray[0].Msg) {
        return {
          error: 'CALCULATE_REQUEST_ERR',
          message: ShippingSevicesArray[0].Msg,
        };
      }
    }

    const services = ShippingSevicesArray
      .filter((service) => !service.Error)
      .map((service) => {
        return {
          label: service.ServiceDescription,
          carrier: service.Carrier,
          service_name: service.ServiceDescription,
          service_code: `FR${service.ServiceCode}`,
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
                value: String(took),
              },
            ],
          },
        };
      });

    response.shipping_services = services;
    return response;
  } catch (err) {
    return {
      error: 'FRENET_ERR',
      message: err.message,
    };
  }
};
