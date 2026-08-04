export default (
  address: Record<string, any> | undefined,
  blingAddress: Record<string, any>,
  blingCityField = 'municipio',
) => {
  if (!address) return;
  ([
    ['name', 'nome', 120],
    ['street', 'endereco', 50],
    ['number', 'numero', 10],
    ['complement', 'complemento', 50],
    ['borough', 'bairro', 30],
    ['zip', 'cep', 10],
    ['city', blingCityField, 30],
    ['province_code', 'uf', 30],
  ] as Array<[string, string, number]>).forEach(([addressField, blingAddressField, maxLength]) => {
    if (address[addressField] && !blingAddress[blingAddressField]) {
      blingAddress[blingAddressField] = String(address[addressField])
        .trim()
        .substring(0, maxLength);
    }
  });
  if (blingAddress.cep && /[0-9]{7,8}/.test(blingAddress.cep)) {
    blingAddress.cep = blingAddress.cep.padStart(8, '0')
      .replace(/^([\d]{2})([\d]{3})([\d]{3})$/, '$1.$2-$3');
  }
};
