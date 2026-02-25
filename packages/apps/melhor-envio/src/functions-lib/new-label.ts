import type { Orders } from '@cloudcommerce/types';

export default (
  order: Orders,
  appConfig: { [x: string]: any },
  merchantData: { [x: string]: any },
) => {
  const {
    firstname, lastname, phone, email, address,
  } = merchantData;
  const from: Record<string, any> = {
    name: `${firstname} ${lastname}`,
    phone: (phone && phone.phone) || '',
    email,
  };
  if (appConfig.sender_info) {
    if (appConfig.sender_info.doc_number) {
      const docNumber = appConfig.sender_info.doc_number.replace(/\D/g, '');
      from[docNumber > 11 ? 'company_document' : 'document'] = docNumber;
    }
    if (appConfig.sender_info.doc_number_type) {
      from.economic_activity_code = appConfig.sender_info.doc_number_type
        .replace('.', '').replace('-', '');
    }
    ['name', 'phone', 'email'].forEach((field) => {
      if (appConfig.sender_info[field]) {
        from[field] = appConfig.sender_info[field];
      }
    });
  }
  if (!from.company_document && !from.document) {
    if (merchantData.company_document) {
      from.company_document = merchantData.company_document;
    }
    if (merchantData.document) {
      const docNumber = merchantData.document.replace(/\D/g, '');
      from[docNumber.length > 11 ? 'company_document' : 'document'] = docNumber;
    }
  }

  const shippingLine = order.shipping_lines?.[0];
  if (shippingLine?.from?.street && shippingLine.from.city) {
    from.address = shippingLine.from.street;
    from.complement = shippingLine.from.complement || '';
    from.number = shippingLine.from.number || 'SN';
    from.district = shippingLine.from.borough;
    from.postal_code = shippingLine.from.zip.replace(/\D/g, '');
    from.city = shippingLine.from.city;
    from.state_abbr = shippingLine.from.province_code;
    from.country_id = 'BR';
  } else if (address) {
    if (typeof address === 'string') {
      from.address = address;
    } else {
      [
        'address',
        'complement',
        'number',
        'district',
        'postal_code',
        'city',
        'state_abbr',
        'country_id',
      ].forEach((field) => {
        from[field] = address[field] || '';
      });
      if (typeof address.city === 'object') {
        from.city = address.city.city || '';
        if (address.city.state) {
          from.state_abbr = address.city.state.state_abbr || '';
          from.country_id = (address.city.state.country && address.city.state.country.id) || '';
        }
      }
    }
  }

  const buyer = order.buyers && order.buyers[0];
  const to: Record<string, any> = {
    email: '',
  };

  if (buyer && buyer.main_email) {
    to.email = buyer.main_email;
    if (buyer.registry_type === 'j') {
      to.company_document = buyer.doc_number || '';
    } else {
      to.document = buyer.doc_number || '';
    }
    if (buyer.phones && buyer.phones[0]) {
      to.phone = buyer.phones[0].number;
    }
  }

  if (shippingLine?.to) {
    const {
      name, street, complement, number, borough, city, zip,
    } = shippingLine.to;
    Object.assign(to, {
      name,
      address: street || '',
      complement,
      number,
      district: borough || '',
      city,
      state_abbr: shippingLine.to.province_code || '',
      country_id: shippingLine.to.country_code || 'BR',
      postal_code: zip || '',
      note: shippingLine.to.near_to || '',
    });
  }

  let physicalWeight = 0;
  if (shippingLine?.package) {
    const { weight } = shippingLine.package;
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
  }

  const getDimensions = (side: string) => {
    const dimensions = shippingLine?.package?.dimensions;
    if (dimensions && dimensions[side]) {
      const dimension = dimensions[side];
      if (dimension && dimension.unit) {
        let dimensionValue: number | undefined;
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
        return dimensionValue;
      }
    }
    return 0;
  };

  const products: Array<Record<string, any>> = [];
  let insuranceValue = 0;
  if (order.items) {
    order.items.forEach((item) => {
      products.push({
        name: item.name,
        quantity: item.quantity,
        unitary_value: item.final_price || item.price,
      });
      insuranceValue += item.final_price || item.price;
    });
  }

  let obs = `Etiqueta referente ao pedido: #${order.number}`;
  if (shippingLine?.warehouse_code) {
    obs += ` [${shippingLine.warehouse_code}]`;
  }
  const options: Record<string, any> = {
    insurance_value: insuranceValue,
    receipt: (appConfig.receipt),
    own_hand: (appConfig.own_hand),
    collect: false,
    reverse: false,
    platform: 'E-Com Plus',
    tags: [
      {
        tag: obs,
      },
      {
        tag: 'order_id',
        url: order._id,
      },
    ],
  };

  // https://docs.menv.io/?version=latest#9a8f308b-4872-4268-b402-e1b0d64d1f1c
  if (appConfig.enabled_non_commercial) {
    options.non_commercial = true;
  }

  const invoice = shippingLine?.invoices?.[0];
  if (invoice?.number) {
    options.invoice = {
      number: invoice.number,
      key: invoice.access_key,
    };
  }

  const label: Record<string, any> = {
    from,
    to,
    package: {
      weight: physicalWeight,
      width: getDimensions('width'),
      height: getDimensions('height'),
      length: getDimensions('length'),
    },
    products,
    options,
  };

  if (shippingLine?.app?.service_code) {
    const serviceCode = shippingLine.app.service_code;
    label.service = parseInt(serviceCode.replace('ME ', ''), 10);
    let propAgency;
    switch (serviceCode) {
      case 'ME 31':
        propAgency = 'loggi_agency';
        break;
      case 'ME 12':
        propAgency = 'latam_agency';
        break;
      case 'ME 3':
      case 'ME 4':
        propAgency = 'jadlog_agency';
        break;
      case 'ME 15':
      case 'ME 16':
        propAgency = 'azul_agency';
        break;
      default:
        propAgency = 'melhor_agency';
    }
    let warehouseConfig = {};
    if (shippingLine.warehouse_code && Array.isArray(appConfig.warehouses)) {
      for (let i = 0; i < appConfig.warehouses.length; i++) {
        const warehouse = appConfig.warehouses[i];
        if (warehouse && warehouse.code === shippingLine.warehouse_code) {
          warehouseConfig = warehouse;
          break;
        }
      }
    }
    const agencyCode = warehouseConfig[propAgency] || appConfig[propAgency];
    if (agencyCode) {
      label.agency = agencyCode;
    }
  }

  return label;
};
