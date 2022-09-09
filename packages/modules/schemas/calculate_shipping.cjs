/* eslint-disable quote-props, comma-dangle, array-bracket-spacing */

const schema = {
  'description': 'Triggered to calculate shipping options, must return calculated values and times',
  'type': 'object',
  'additionalProperties': false,
  'definitions': {
    'address': {
      'type': 'object',
      'additionalProperties': false,
      'required': [ 'zip' ],
      'properties': {
        'zip': {
          'type': 'string',
          'maxLength': 30,
          'description': 'ZIP (CEP, postal...) code'
        },
        'street': {
          'type': 'string',
          'maxLength': 200,
          'description': 'Street or public place name'
        },
        'number': {
          'type': 'integer',
          'minimum': 1,
          'maximum': 9999999,
          'description': 'House or building street number'
        },
        'complement': {
          'type': 'string',
          'maxLength': 100,
          'description': 'Address complement or second line, such as apartment number'
        },
        'borough': {
          'type': 'string',
          'maxLength': 100,
          'description': 'Borough name'
        },
        'near_to': {
          'type': 'string',
          'maxLength': 100,
          'description': 'Some optional other reference for this address'
        },
        'line_address': {
          'type': 'string',
          'maxLength': 255,
          'description': 'Full in line mailing address, should include street, number and borough'
        },
        'city': {
          'type': 'string',
          'maxLength': 100,
          'description': 'City name'
        },
        'country': {
          'type': 'string',
          'maxLength': 50,
          'description': 'Country name'
        },
        'country_code': {
          'type': 'string',
          'minLength': 2,
          'maxLength': 2,
          'pattern': '^[A-Z]+$',
          'description': 'An ISO 3166-2 country code'
        },
        'province': {
          'type': 'string',
          'maxLength': 100,
          'description': 'Province or state name'
        },
        'province_code': {
          'type': 'string',
          'minLength': 2,
          'maxLength': 2,
          'pattern': '^[A-Z]+$',
          'description': 'The two-letter code for the province or state'
        },
        'name': {
          'type': 'string',
          'maxLength': 70,
          'description': 'The name of recipient, generally is the customer\'s name'
        },
        'last_name': {
          'type': 'string',
          'maxLength': 70,
          'description': 'The recipient\'s last name'
        },
        'phone': {
          'type': 'object',
          'additionalProperties': false,
          'required': [ 'number' ],
          'properties': {
            'country_code': {
              'type': 'integer',
              'minimum': 1,
              'maximum': 999,
              'description': 'Country calling code (without +), defined by standards E.123 and E.164'
            },
            'number': {
              'type': 'string',
              'maxLength': 19,
              'pattern': '^[0-9]+$',
              'description': 'The actual phone number, digits only'
            }
          },
          'description': 'Customer phone number for this mailing address'
        }
      },
      'description': 'Address object'
    }
  },
  'properties': {
    'items': {
      'type': 'array',
      'maxItems': 3000,
      'items': {
        'type': 'object',
        'additionalProperties': false,
        'required': [ 'product_id', 'quantity', 'price' ],
        'properties': {
          'product_id': {
            'type': 'string',
            'pattern': '^[a-f0-9]{24}$',
            'description': 'Product ID'
          },
          'variation_id': {
            'type': 'string',
            'pattern': '^[a-f0-9]{24}$',
            'description': 'ID to specify the variation added to cart, if product has variations'
          },
          'sku': {
            'type': 'string',
            'minLength': 2,
            'maxLength': 100,
            'pattern': '^[A-Za-z0-9-_.]+$',
            'description': 'Product or variation unique reference code'
          },
          'name': {
            'type': 'string',
            'maxLength': 255,
            'description': 'Product or variation full name, or other label for this cart item'
          },
          'quantity': {
            'type': 'number',
            // 'multipleOf': 0.0001,
            'minimum': 0,
            'maximum': 9999999,
            'description': 'Item quantity in cart'
          },
          'inventory': {
            'type': 'object',
            'additionalProperties': false,
            'maxProperties': 100,
            'patternProperties': {
              '^[A-Za-z0-9-_]{2,30}$': {
                'type': 'number',
                // 'multipleOf': 0.0001,
                'minimum': 0,
                'maximum': 9999999,
                'description': 'Product quantity available for sale from current warehouse'
              }
            },
            'description': 'Warehouses by code and respective product stock'
          },
          'currency_id': {
            'type': 'string',
            'pattern': '^[A-Z]{3}$',
            'default': 'BRL',
            'description': 'Designator of currency according to ISO 4217 (3 uppercase letters)'
          },
          'currency_symbol': {
            'type': 'string',
            'maxLength': 20,
            'default': 'R$',
            'description': 'Graphic symbol used as a shorthand for currency\'s name'
          },
          'price': {
            'type': 'number',
            // 'multipleOf': 0.00001,
            'minimum': 0,
            'maximum': 999999999,
            'description': 'Product sale price specifically for this cart'
          },
          'final_price': {
            'type': 'number',
            // 'multipleOf': 0.00001,
            'minimum': 0,
            'maximum': 999999999,
            'description': 'Final item price including additions due to customizations and gift wrap'
          },
          'dimensions': {
            'type': 'object',
            'additionalProperties': false,
            'patternProperties': {
              '^width|height|length$': {
                'type': 'object',
                'required': [ 'value' ],
                'additionalProperties': false,
                'properties': {
                  'value': {
                    'type': 'number',
                    // 'multipleOf': 0.001,
                    'minimum': 0,
                    'maximum': 999999,
                    'description': 'Size in specified unit'
                  },
                  'unit': {
                    'type': 'string',
                    'enum': [ 'mm', 'cm', 'm', 'ft', 'in', 'yd', 'mi' ],
                    'default': 'cm',
                    'description': 'Unit of measurement'
                  }
                },
                'description': 'Package width, height and length'
              }
            },
            'description': 'Product dimensions with packaging for freight calculation'
          },
          'weight': {
            'type': 'object',
            'required': [ 'value' ],
            'additionalProperties': false,
            'properties': {
              'value': {
                'type': 'number',
                // 'multipleOf': 0.001,
                'minimum': 0,
                'maximum': 999999,
                'description': 'Size in specified unit'
              },
              'unit': {
                'type': 'string',
                'enum': [ 'mg', 'g', 'kg', 'lb', 'oz' ],
                'default': 'g',
                'description': 'Unit of measurement'
              }
            },
            'description': 'Package weight for freight calculation'
          }
        },
        'description': 'One of the cart items'
      },
      'description': 'Products composing the cart'
    },
    'subtotal': {
      'type': 'number',
      // 'multipleOf': 0.00001,
      'minimum': 0,
      'maximum': 9999999999,
      'description': 'The sum of all items prices'
    },
    'from': {
      '$ref': '#/definitions/address',
      'description': 'Sender\'s address'
    },
    'to': {
      '$ref': '#/definitions/address',
      'description': 'Shipping address (recipient)'
    },
    'own_hand': {
      'type': 'boolean',
      'default': false,
      'description': 'Whether the package must be delivered with additional service "own hand"'
    },
    'receipt': {
      'type': 'boolean',
      'default': false,
      'description': 'If the package will be delivered with acknowledgment of receipt'
    },
    'service_code': {
      'type': 'string',
      'maxLength': 70,
      'description': 'Code of service defined by carrier, if shipping method is already defined'
    },
    'lang': {
      'type': 'string',
      'pattern': '^[a-z]{2}(_[a-z]{2})?$',
      'description': 'Language two letters code, sometimes with region, eg.: pt_br, fr, en_us'
    },
    'is_checkout_confirmation': {
      'type': 'boolean',
      'default': false,
      'description': 'Whether shipping were already chosen and is just being confirmed to complete checkout'
    }
  }
};

exports.params = schema;

exports.response = {
  'description': `Response - ${schema.description}`,
  'type': 'object',
  'required': [ 'shipping_services' ],
  'additionalProperties': false,
  'definitions': {
    ...schema.definitions
  },
  'properties': {
    'free_shipping_from_value': {
      'type': 'number',
      // 'multipleOf': 0.00001,
      'minimum': 0,
      'maximum': 9999999999,
      'description': 'Optional minimum cart subtotal to earn free shipping with some shipping service'
    },
    'shipping_services': {
      'type': 'array',
      'maxItems': 30,
      'items': {
        'type': 'object',
        'additionalProperties': false,
        'required': [ 'label', 'shipping_line' ],
        'properties': {
          'label': {
            'type': 'string',
            'maxLength': 50,
            'description': 'Name of shipping method shown to customers'
          },
          'carrier': {
            'type': 'string',
            'maxLength': 200,
            'description': 'Carrier name'
          },
          'carrier_doc_number': {
            'type': 'string',
            'maxLength': 19,
            'pattern': '^[0-9]+$',
            'description': 'Carrier document number (only numbers)'
          },
          'service_name': {
            'type': 'string',
            'maxLength': 70,
            'description': 'Name of service (shipping method) defined by carrier'
          },
          'service_code': {
            'type': 'string',
            'maxLength': 70,
            'description': 'Code of service defined by carrier'
          },
          'contract': {
            'type': 'string',
            'maxLength': 70,
            'description': 'Contract number of the shop with carrier, if exists'
          },
          'icon': {
            'type': 'string',
            'maxLength': 255,
            'format': 'uri',
            'description': 'Shipping method icon image URI'
          },
          'shipping_line': {
            'type': 'object',
            'additionalProperties': false,
            'required': [ 'from', 'to' ],
            'properties': {
              'from': {
                '$ref': '#/definitions/address',
                'description': 'Sender\'s address'
              },
              'to': {
                '$ref': '#/definitions/address',
                'description': 'Shipping address (recipient)'
              },
              'package': {
                'type': 'object',
                'additionalProperties': false,
                'properties': {
                  'dimensions': {
                    'type': 'object',
                    'additionalProperties': false,
                    'patternProperties': {
                      '^width|height|length$': {
                        'type': 'object',
                        'required': [ 'value' ],
                        'additionalProperties': false,
                        'properties': {
                          'value': {
                            'type': 'number',
                            // 'multipleOf': 0.001,
                            'minimum': 0,
                            'maximum': 999999,
                            'description': 'Size in specified unit'
                          },
                          'unit': {
                            'type': 'string',
                            'enum': [ 'mm', 'cm', 'm', 'ft', 'in', 'yd', 'mi' ],
                            'default': 'cm',
                            'description': 'Unit of measurement'
                          }
                        },
                        'description': 'Package width, height and length'
                      }
                    },
                    'description': 'Package dimensions'
                  },
                  'weight': {
                    'type': 'object',
                    'required': [ 'value' ],
                    'additionalProperties': false,
                    'properties': {
                      'value': {
                        'type': 'number',
                        // 'multipleOf': 0.001,
                        'minimum': 0,
                        'maximum': 999999,
                        'description': 'Size in specified unit'
                      },
                      'unit': {
                        'type': 'string',
                        'enum': [ 'mg', 'g', 'kg', 'lb', 'oz' ],
                        'default': 'g',
                        'description': 'Unit of measurement'
                      }
                    },
                    'description': 'Package weight for freight calculation'
                  }
                },
                'description': 'Shipping object information'
              },
              'pick_up': {
                'type': 'string',
                'enum': [ 'store', 'locker', 'point', 'other' ],
                'description': 'Pick up option when no (or optional) freight'
              },
              'price': {
                'type': 'number',
                // 'multipleOf': 0.00001,
                'minimum': 0,
                'maximum': 9999999999,
                'description': 'Freight cost for this shipping line, without additionals'
              },
              'declared_value': {
                'type': 'number',
                // 'multipleOf': 0.00001,
                'minimum': 0,
                'maximum': 9999999999,
                'description': 'The package value declared to carrier, generally the sum of all items prices'
              },
              'declared_value_price': {
                'type': 'number',
                // 'multipleOf': 0.00001,
                'minimum': 0,
                'maximum': 999999,
                'description': 'Cost for the "declared value" additional service'
              },
              'own_hand': {
                'type': 'boolean',
                'default': false,
                'description': 'Whether the package must be delivered with additional service "own hand"'
              },
              'own_hand_price': {
                'type': 'number',
                // 'multipleOf': 0.00001,
                'minimum': 0,
                'maximum': 999999,
                'description': 'Cost for the "own hand" additional service'
              },
              'receipt': {
                'type': 'boolean',
                'default': false,
                'description': 'If the package will be delivered with acknowledgment of receipt'
              },
              'receipt_price': {
                'type': 'number',
                // 'multipleOf': 0.00001,
                'minimum': 0,
                'maximum': 999999,
                'description': 'Cost for the "acknowledgment of receipt" additional service'
              },
              'other_additionals': {
                'type': 'array',
                'maxItems': 30,
                'items': {
                  'type': 'object',
                  'additionalProperties': false,
                  'required': [ 'label' ],
                  'properties': {
                    'tag': {
                      'type': 'string',
                      'maxLength': 20,
                      'pattern': '^[a-z0-9_]+$',
                      'description': 'Tag to identify object, use only lowercase letters, digits and underscore'
                    },
                    'label': {
                      'type': 'string',
                      'maxLength': 50,
                      'description': 'Name of the additional service'
                    },
                    'price': {
                      'type': 'number',
                      // 'multipleOf': 0.00001,
                      'minimum': 0,
                      'maximum': 999999,
                      'description': 'Cost for this additional service'
                    }
                  },
                  'description': 'Additional service'
                },
                'description': 'List of other additional services for this shipping line'
              },
              'taxes': {
                'type': 'array',
                'maxItems': 30,
                'items': {
                  'type': 'object',
                  'additionalProperties': false,
                  'required': [ 'label' ],
                  'properties': {
                    'tag': {
                      'type': 'string',
                      'maxLength': 20,
                      'pattern': '^[a-z0-9_]+$',
                      'description': 'Tag to identify object, use only lowercase letters, digits and underscore'
                    },
                    'label': {
                      'type': 'string',
                      'maxLength': 50,
                      'description': 'Tax title'
                    },
                    'price': {
                      'type': 'number',
                      // 'multipleOf': 0.00001,
                      'minimum': 0,
                      'maximum': 999999999,
                      'description': 'Tax value applied'
                    },
                    'rate': {
                      'type': 'number',
                      // 'multipleOf': 0.0001,
                      'minimum': 0,
                      'maximum': 100,
                      'description': 'Tax rate as a function of package value'
                    }
                  },
                  'description': 'Applied tax or additional service'
                },
                'description': 'List of taxes or other additional services for this shipping line'
              },
              'discount': {
                'type': 'number',
                // 'multipleOf': 0.0001,
                'minimum': -999999999,
                'maximum': 999999999,
                'description': 'Discount on shipping price, negative if value was additionated (not discounted)'
              },
              'total_price': {
                'type': 'number',
                // 'multipleOf': 0.00001,
                'minimum': 0,
                'maximum': 9999999999,
                'description': 'Total cost for this shipping line, with additionals and taxes'
              },
              'posting_deadline': {
                'type': 'object',
                'required': [ 'days' ],
                'additionalProperties': false,
                'properties': {
                  'days': {
                    'type': 'integer',
                    'minimum': 0,
                    'maximum': 999999,
                    'description': 'Number of days to post the product after purchase'
                  },
                  'working_days': {
                    'type': 'boolean',
                    'default': true,
                    'description': 'If the deadline is calculated in working days'
                  },
                  'after_approval': {
                    'type': 'boolean',
                    'default': true,
                    'description': 'Whether days will be counted after payment approval'
                  }
                },
                'description': 'Deadline for sending the package'
              },
              'delivery_time': {
                'type': 'object',
                'required': [ 'days' ],
                'additionalProperties': false,
                'properties': {
                  'days': {
                    'type': 'integer',
                    'minimum': 0,
                    'maximum': 999999,
                    'description': 'Number of days for delivery after shipping'
                  },
                  'working_days': {
                    'type': 'boolean',
                    'default': true,
                    'description': 'If the deadline is calculated in working days'
                  }
                },
                'description': 'Estimated delivery time'
              },
              'scheduled_delivery': {
                'type': 'object',
                'additionalProperties': false,
                'patternProperties': {
                  '^start|end$': {
                    'type': 'string',
                    'format': 'date-time',
                    'description': 'Scheduled date and time on the ISO 8601 representation'
                  }
                },
                'description': 'Date range when delivery will be made'
              },
              'delivery_instructions': {
                'type': 'string',
                'maxLength': 1000,
                'description': 'Additional text instructions for pick up or custom delivery process'
              },
              'warehouse_code': {
                'type': 'string',
                'pattern': '^[A-Za-z0-9-_]{2,30}$',
                'description': 'For multi DC, set warehouse where the stock will be handled'
              },
              'flags': {
                'type': 'array',
                'uniqueItems': true,
                'maxItems': 10,
                'items': {
                  'type': 'string',
                  'maxLength': 20,
                  'description': 'Flag title'
                },
                'description': 'Flags to associate additional info'
              },
              'custom_fields': {
                'type': 'array',
                'maxItems': 10,
                'items': {
                  'type': 'object',
                  'additionalProperties': false,
                  'required': [ 'field', 'value' ],
                  'properties': {
                    'field': {
                      'type': 'string',
                      'maxLength': 50,
                      'description': 'Field name'
                    },
                    'value': {
                      'type': 'string',
                      'maxLength': 255,
                      'description': 'Field value'
                    }
                  },
                  'description': 'Custom field object'
                },
                'description': 'List of custom fields'
              },
              'notes': {
                'type': 'string',
                'maxLength': 2000,
                'description': 'Optional notes with additional info about this shipping line'
              }
            },
            'description': 'Order shipping line object'
          }
        },
        'description': 'Shipping method option (service)'
      },
      'description': 'Shipping method options list'
    }
  }
};
