const bodyCalculateShipping = {
  to: { zip: '35701000' },
  items: [{
    product_id: '6166cb1528ace502aea2dc36',
    sku: 'GIE2742',
    name: 'Vaso para orquídeas',
    quantity: 1,
    currency_id: 'BRL',
    currency_symbol: 'R$',
    price: 24.99,
    dimensions: {
      width: { unit: 'cm', value: 30 },
      height: { unit: 'cm', value: 30 },
      length: { unit: 'cm', value: 30 },
    },
    weight: { unit: 'kg', value: 0.5 },
  }],
  subtotal: 24.99,
};

const bodyListPayments = {

};

export {
  bodyCalculateShipping,
  bodyListPayments,
};
