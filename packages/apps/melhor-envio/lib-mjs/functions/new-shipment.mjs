const convertDimensions = (dimension) => {
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
        break;
    }
  }
  return dimensionValue;
};

const newShipment = (appConfig, params) => {
  const calculate = {};
  const { to, items } = params;

  // https://docs.menv.io/?version=latest#9bbc2460-7786-4871-a0cc-2ae3cd54333e
  // creates a new model for calculating freight in the Melhor Envio API.
  calculate.from = appConfig.merchant_address;

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

  items.forEach((item) => {
    const { dimensions, weight, quantity } = item;
    // sum physical weight
    let physicalWeight = 0;
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

  return calculate;
};

const matchService = (service, name) => {
  const fields = ['service_name', 'service_code'];
  for (let i = 0; i < fields.length; i++) {
    if (service[fields[i]]) {
      return service[fields[i]].trim().toUpperCase() === name.toUpperCase();
    }
  }
  return true;
};

const sortServicesBy = (by) => {
  switch (by) {
    case 'Maior preço':
      return function sort(a, b) {
        return a.shipping_line.total_price < b.shipping_line.total_price;
      };
    case 'Menor preço':
      return function sort(a, b) {
        return a.shipping_line.total_price > b.shipping_line.total_price;
      };
    case 'Maior prazo de entrega':
      return function sort(a, b) {
        return a.shipping_line.delivery_time.days < b.shipping_line.delivery_time.days;
      };
    case 'Menor prazo de entrega':
      return function sort(a, b) {
        return a.shipping_line.delivery_time.days > b.shipping_line.delivery_time.days;
      };
    default:
      break;
  }

  // default
  return function sort(a, b) {
    return a.shipping_line.total_price > b.shipping_line.total_price;
  };
};

export {
  newShipment,
  matchService,
  sortServicesBy,
};
