/* eslint-disable no-restricted-syntax, guard-for-in */

export const convertDimensions = (dimension) => {
  let dimensionValue = 0;
  if (dimension && dimension.unit) {
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
  }
  return dimensionValue;
};

export const newShipment = (appConfig, params) => {
  const calculate = {};
  const { originZip, to, items } = params;

  // https://docs.menv.io/?version=latest#9bbc2460-7786-4871-a0cc-2ae3cd54333e
  // creates a new model for calculating freight in the Melhor Envio API.
  calculate.from = appConfig.merchant_address;
  if (originZip) {
    calculate.from = {
      postal_code: originZip,
    };
  }
  const useCubicWeight = appConfig.use_cubic_weight;

  calculate.to = {
    postal_code: to.zip,
    address: to.street,
    number: to.number,
  };

  calculate.options = {
    receipt: appConfig.receipt || false,
    own_hand: appConfig.own_hand || false,
    collect: false,
  };

  calculate.products = [];

  let finalCubicWeight = 0;
  let finalPhysicalWeight = 0;
  let finalWeight = 0;
  let cartSubtotal = 0;
  items.forEach((item) => {
    const { dimensions, weight, quantity } = item;
    // sum physical weight
    let physicalWeight = 0;
    let cubicWeight = 0;
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

    finalPhysicalWeight += (quantity * physicalWeight);
    cartSubtotal += (quantity * (item.final_price || item.price));

    const cmDimensions = {};
    const sumDimensions = {};

    if (dimensions && useCubicWeight) {
      for (const side in dimensions) {
        const dimension = dimensions[side];
        if (dimension && dimension.value) {
          switch (dimension.unit) {
            case 'm':
              cmDimensions[side] = dimension.value * 100;
              break;
            case 'mm':
              cmDimensions[side] = dimension.value / 10;
              break;
            default:
              cmDimensions[side] = dimension.value;
          }
          // add/sum current side to final dimensions object
          if (cmDimensions[side]) {
            sumDimensions[side] = sumDimensions[side]
              ? sumDimensions[side] + cmDimensions[side]
              : cmDimensions[side];
          }
        }
      }

      for (const sideCubic in sumDimensions) {
        if (sumDimensions[sideCubic]) {
          cubicWeight = cubicWeight > 0
            ? cubicWeight * sumDimensions[sideCubic]
            : sumDimensions[sideCubic];
        }
      }
      if (cubicWeight > 0) {
        cubicWeight /= 6000;
      }
    }

    if (useCubicWeight && physicalWeight > 0) {
      finalCubicWeight += (quantity * cubicWeight);
      const correctedWeight = cubicWeight < 5 || physicalWeight > quantity
        ? physicalWeight : cubicWeight;
      finalWeight += (quantity * correctedWeight);
    }

    calculate.products.push({
      id: item.product_id,
      weight: physicalWeight,
      width: convertDimensions(dimensions && dimensions.width),
      height: convertDimensions(dimensions && dimensions.height),
      length: convertDimensions(dimensions && dimensions.length),
      quantity: quantity || 1,
      insurance_value: item.final_price || item.price,
    });
  });

  if (useCubicWeight && finalCubicWeight > 0) {
    const num = Math.cbrt(finalCubicWeight);
    const cubicDimension = Math.round(num * 100) / 100;
    delete calculate.products;
    calculate.volumes = [{
      weight: finalWeight || finalPhysicalWeight || 0.5,
      width: cubicDimension || 10,
      height: cubicDimension || 10,
      length: cubicDimension || 10,
      insurance_value: cartSubtotal,
    }];
  }

  return calculate;
};

export const matchService = (service, name) => {
  const fields = ['service_name', 'service_code'];
  for (let i = 0; i < fields.length; i++) {
    if (service[fields[i]]) {
      return service[fields[i]].trim().toUpperCase() === name.toUpperCase();
    }
  }
  return true;
};

export const sortServicesBy = (by) => {
  switch (by) {
    case 'Maior preço':
      return (a, b) => {
        return a.shipping_line.total_price < b.shipping_line.total_price;
      };
    case 'Menor preço':
      return (a, b) => {
        return a.shipping_line.total_price > b.shipping_line.total_price;
      };
    case 'Maior prazo de entrega':
      return (a, b) => {
        return a.shipping_line.delivery_time.days < b.shipping_line.delivery_time.days;
      };
    case 'Menor prazo de entrega':
      return (a, b) => {
        return a.shipping_line.delivery_time.days > b.shipping_line.delivery_time.days;
      };
    default:
  }
  return () => 0;
};
