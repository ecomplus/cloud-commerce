import axios from 'axios';
import api from '@cloudcommerce/api';
import { logger } from '@cloudcommerce/firebase/lib/config';
import { parseVolumes, buildShippingItems } from './volumes.mjs';

/*
 * Volumes (boxes) of each product in the cart, from the `shipping/volumes`
 * hidden metafield. One request per distinct product, in parallel; a failed
 * request just falls back to the product weight and dimensions.
 */
const fetchVolumes = async (items) => {
  const volumesByProductId = {};
  const productIds = [...new Set(items.map(({ product_id: id }) => id).filter(Boolean))];
  await Promise.all(productIds.map(async (productId) => {
    try {
      const { data } = await api.get(`products/${productId}`, {
        fields: ['hidden_metafields'],
      });
      const volumes = parseVolumes(data.hidden_metafields);
      if (volumes) {
        volumesByProductId[productId] = volumes;
      }
    } catch (err) {
      logger.warn(`Cannot get volumes of product ${productId}`, { err });
    }
  }));
  return volumesByProductId;
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
  const volumesByProductId = await fetchVolumes(items);
  const getSchemaFrenet = () => {
    try {
      return {
        SellerCEP: config.from.zip.replace('-', ''),
        RecipientCEP: to.zip.replace('-', ''),
        ShipmentInvoiceValue: subtotal,
        ShippingItemArray: buildShippingItems(items, volumesByProductId),
      };
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
        'token': process.env.FRENET_TOKEN,
      },
      data: schema,
      timeout: (params.is_checkout_confirmation ? 19000 : 10000),
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
        let label = service.ServiceDescription.length > 50
          ? service.Carrier
          : service.ServiceDescription;
        if (Array.isArray(config.service_labels)) {
          const serviceLabelConfig = config.service_labels.find((labels) => {
            return labels && labels.frenet_label === label && labels.new_label;
          });
          if (serviceLabelConfig) {
            label = serviceLabelConfig.new_label;
          }
        }
        return {
          label,
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
