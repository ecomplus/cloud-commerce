import axios from 'axios';

export default async ({ params, application }) => {
  const appData = {
    ...application.data,
    ...application.hidden_data,
  };

  // setup basic required response object

  const response = {
    shipping_services: [],
  };

  if (appData.free_shipping_from_value >= 0) {
    response.free_shipping_from_value = appData.free_shipping_from_value;
  }
  if (!params.to) {
    // just a free shipping preview with no shipping address received
    // respond only with free shipping option
    return response;
  }

  const flashcourierKey = appData.flashcourier_contract && appData.flashcourier_contract.key;
  if (!flashcourierKey) {
    return {
      status: 409,
      error: 'CALCULATE_AUTH_ERR',
      message: 'Key unset on app hidden data (merchant must configure the app)',
    };
  }

  if (appData.free_shipping_from_value >= 0) {
    response.free_shipping_from_value = appData.free_shipping_from_value;
  }

  const destinationZip = params.to ? params.to.zip.replace(/\D/g, '') : '';
  let originZip = '';
  if (params.from) {
    originZip = params.from.zip.replace(/\D/g, '');
  } else if (appData.zip) {
    originZip = appData.zip.replace(/\D/g, '');
  }

  if (!originZip) {
    return {
      status: 409,
      error: 'CALCULATE_ERR',
      message: 'Zip code is unset on app hidden data (merchant must configure the app)',
    };
  }

  if (params.items) {
    // calculate weight and pkg value from items list
    let finalWeight = 0;
    params.items.forEach(({
      price, quantity, dimensions, weight,
    }) => {
      let physicalWeight = 0;
      let cubicWeight = 1;

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
            cubicWeight *= sumDimensions[side];
          }
        });
        if (cubicWeight > 1) {
          cubicWeight /= 6000;
        }
      }
      finalWeight += (quantity * (physicalWeight > cubicWeight ? physicalWeight : cubicWeight));
    });

    // https://www.flashcalculador-sp.com.br/documentacao-api
    const flashcourierUrl = 'https://www.flashcalculador-sp.com.br/api/v2/calcular_frete'
      + `?cep_destino=${destinationZip}`
      + `&peso_gramas=${(finalWeight ? finalWeight * 1000 : 100)}`
      + `&cliente_chave=${flashcourierKey}`;
    let flashcourierResult;
    try {
      flashcourierResult = (await axios(flashcourierUrl)).data;
    } catch (err) {
      let { message } = err;
      if (err.response && err.response.data && err.response.data.message) {
        message = err.response.data.message;
      }
      // console.warn(`[calc] failed ${flashcourierUrl}`)
      return {
        status: 409,
        error: 'CALCULATE_FAILED_WS',
        message,
      };
    }
    if (!flashcourierResult || !Array.isArray(flashcourierResult.products)) {
      return {
        status: 409,
        error: 'CALCULATE_FAILED_EMPTY',
        message: 'Flash Courier API doesnt return valid result',
      };
    }

    flashcourierResult.products.forEach((flashcourierProduto) => {
      Object.keys(flashcourierProduto).forEach((label) => {
        let price;
        let days;
        if (typeof flashcourierProduto[label] === 'object') {
          price = parseFloat(flashcourierProduto[label].preco);
          const minDays = parseInt(flashcourierProduto[label].prazo_min, 10);
          const maxDays = parseInt(flashcourierProduto[label].prazo_max, 10);
          days = Math.ceil((minDays + maxDays) / 2);
        } else {
          price = parseFloat(flashcourierProduto[label]);
          days = 7;
        }
        const shippingLine = {
          from: {
            ...params.from,
            zip: originZip,
          },
          to: params.to,
          price,
          total_price: price,
          discount: 0,
          delivery_time: {
            days,
            working_days: true,
          },
          posting_deadline: {
            days: 1,
            ...appData.posting_deadline,
          },
          package: {
            weight: {
              value: finalWeight,
              unit: 'kg',
            },
          },
          flags: ['flashcr-ws'],
        };
        if (appData.additional_price) {
          if (appData.additional_price > 0) {
            shippingLine.other_additionals = [{
              tag: 'additional_price',
              label: 'Adicional padrão',
              price: appData.additional_price,
            }];
          } else {
            shippingLine.discount -= appData.additional_price;
          }
          shippingLine.total_price += appData.additional_price;
          if (shippingLine.total_price < 0) {
            shippingLine.total_price = 0;
          }
        }
        response.shipping_services.push({
          label,
          shipping_line: shippingLine,
        });
      });
    });

    response.shipping_services.sort((a, b) => {
      if (a.price > b.price) {
        return 1;
      }
      return -1;
    });
  } else {
    return {
      status: 400,
      error: 'CALCULATE_EMPTY_CART',
      message: 'Cannot calculate shipping without cart items',
    };
  }

  return response;
};
