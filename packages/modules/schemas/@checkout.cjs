/* eslint-disable quote-props, comma-dangle, array-bracket-spacing */

exports.params = {
  '$schema': 'http://json-schema.org/draft-07/schema#',
  'title': 'Checkout body',
  'description': 'Triggered to handle checkout with billing and shipping and create new order',
  'type': 'object',
  'required': [ 'items', 'shipping', 'transaction', 'customer' ],
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
    },
    'transaction': {
      'type': 'object',
      'additionalProperties': false,
      'required': [ 'app_id', 'buyer', 'payment_method' ],
      'properties': {
        'app_id': {
          'type': 'integer',
          'minimum': 1000,
          'maximum': 16777215,
          'description': 'ID of application chosen for transaction'
        },
        'type': {
          'type': 'string',
          'enum': [ 'payment', 'recurrence' ],
          'default': 'payment',
          'description': 'Transaction type'
        },
        'payment_method': {
          'type': 'object',
          'required': [ 'code' ],
          'additionalProperties': false,
          'properties': {
            'code': {
              'type': 'string',
              'enum': [
                'credit_card',
                'banking_billet',
                'online_debit',
                'account_deposit',
                'debit_card',
                'balance_on_intermediary',
                'loyalty_points',
                'other'
              ],
              'description': 'Standardized payment method code'
            },
            'name': {
              'type': 'string',
              'maxLength': 200,
              'description': 'Short description for payment method'
            }
          },
          'description': 'Chosen payment method object'
        },
        'label': {
          'type': 'string',
          'maxLength': 50,
          'description': 'Name of payment method shown to customers'
        },
        'icon': {
          'type': 'string',
          'maxLength': 255,
          'format': 'uri',
          'description': 'Payment icon image URI'
        },
        'intermediator': {
          'type': 'object',
          'additionalProperties': false,
          'required': [ 'code' ],
          'properties': {
            'name': {
              'type': 'string',
              'maxLength': 255,
              'description': 'Name of payment intermediator'
            },
            'link': {
              'type': 'string',
              'maxLength': 255,
              'format': 'uri',
              'description': 'URI to intermediator website'
            },
            'code': {
              'type': 'string',
              'minLength': 6,
              'maxLength': 70,
              'pattern': '^[a-z0-9_]+$',
              'description': 'Gateway name standardized as identification code'
            }
          },
          'description': 'Payment intermediator'
        },
        'payment_url': {
          'type': 'string',
          'maxLength': 255,
          'format': 'uri',
          'description': 'Base URI to payments'
        },
        'buyer': {
          'type': 'object',
          'additionalProperties': false,
          'required': [ 'email', 'fullname', 'birth_date', 'phone', 'registry_type', 'doc_number' ],
          'properties': {
            'customer_id': {
              'type': 'string',
              'pattern': '^[a-f0-9]{24}$',
              'description': 'Customer ID in the store'
            },
            'email': {
              'type': 'string',
              'maxLength': 200,
              'format': 'email',
              'description': 'Buyer email address'
            },
            'fullname': {
              'type': 'string',
              'maxLength': 255,
              'description': 'Customer full name or company corporate name'
            },
            'gender': {
              'type': 'string',
              'enum': [ 'f', 'm', 'x' ],
              'description': 'Customer gender, female, male or third gender (X)'
            },
            'birth_date': {
              'type': 'object',
              'additionalProperties': false,
              'properties': {
                'day': {
                  'type': 'integer',
                  'minimum': 1,
                  'maximum': 31,
                  'description': 'Day of birth'
                },
                'month': {
                  'type': 'integer',
                  'minimum': 1,
                  'maximum': 12,
                  'description': 'Number of month of birth'
                },
                'year': {
                  'type': 'integer',
                  'minimum': 1800,
                  'maximum': 2200,
                  'description': 'Year of birth'
                }
              },
              'description': 'Date of customer birth'
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
                },
                'type': {
                  'type': 'string',
                  'enum': [ 'home', 'personal', 'work', 'other' ],
                  'description': 'The type of phone'
                }
              },
              'description': 'Buyer contact phone'
            },
            'registry_type': {
              'type': 'string',
              'enum': [ 'p', 'j' ],
              'description': 'Physical or juridical (company) person'
            },
            'doc_country': {
              'type': 'string',
              'minLength': 2,
              'maxLength': 2,
              'pattern': '^[A-Z]+$',
              'description': 'Country of document origin, an ISO 3166-2 code'
            },
            'doc_number': {
              'type': 'string',
              'maxLength': 19,
              'pattern': '^[0-9]+$',
              'description': 'Responsible person or organization document number (only numbers)'
            },
            'inscription_type': {
              'type': 'string',
              'enum': [ 'State', 'Municipal' ],
              'description': 'Municipal or state registration if exists'
            },
            'inscription_number': {
              'type': 'string',
              'maxLength': 50,
              'description': 'Municipal or state registration number (with characters) if exists'
            }
          },
          'description': 'Order buyer info'
        },
        'payer': {
          'type': 'object',
          'additionalProperties': false,
          'properties': {
            'fullname': {
              'type': 'string',
              'maxLength': 255,
              'description': 'Payer full name or company corporate name'
            },
            'birth_date': {
              'type': 'object',
              'additionalProperties': false,
              'properties': {
                'day': {
                  'type': 'integer',
                  'minimum': 1,
                  'maximum': 31,
                  'description': 'Day of birth'
                },
                'month': {
                  'type': 'integer',
                  'minimum': 1,
                  'maximum': 12,
                  'description': 'Number of month of birth'
                },
                'year': {
                  'type': 'integer',
                  'minimum': 1800,
                  'maximum': 2200,
                  'description': 'Year of birth'
                }
              },
              'description': 'Date of payer birth'
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
                },
                'type': {
                  'type': 'string',
                  'enum': [ 'home', 'personal', 'work', 'other' ],
                  'description': 'The type of phone'
                }
              },
              'description': 'Payer contact phone'
            },
            'registry_type': {
              'type': 'string',
              'enum': [ 'p', 'j' ],
              'description': 'Physical or juridical (company) person'
            },
            'doc_country': {
              'type': 'string',
              'minLength': 2,
              'maxLength': 2,
              'pattern': '^[A-Z]+$',
              'description': 'Country of document origin, an ISO 3166-2 code'
            },
            'doc_number': {
              'type': 'string',
              'maxLength': 19,
              'pattern': '^[0-9]+$',
              'description': 'Responsible person or organization document number (only numbers)'
            }
          },
          'description': 'Transation payer info'
        },
        'intermediator_buyer_id': {
          'type': 'string',
          'maxLength': 255,
          'description': 'ID of customer account in the intermediator'
        },
        'billing_address': {
          '$ref': '#/definitions/address',
          'description': 'The mailing address associated with the payment method'
        },
        'to': {
          '$ref': '#/definitions/address',
          'description': 'Shipping address (recipient)'
        },
        'credit_card': {
          'type': 'object',
          'additionalProperties': false,
          'properties': {
            'holder_name': {
              'type': 'string',
              'maxLength': 100,
              'description': 'Full name of the holder, as it is on the credit card'
            },
            'bin': {
              'type': 'integer',
              'minimum': 1,
              'maximum': 9999999,
              'description': 'Issuer identification number (IIN), known as bank identification number (BIN)'
            },
            'company': {
              'type': 'string',
              'maxLength': 100,
              'description': 'Credit card issuer name, eg.: Visa, American Express, MasterCard'
            },
            'last_digits': {
              'type': 'string',
              'maxLength': 4,
              'pattern': '^[0-9]+$',
              'description': 'Last digits (up to 4) of credit card number'
            },
            'token': {
              'type': 'string',
              'maxLength': 255,
              'description': 'Unique credit card token'
            },
            'cvv': {
              'type': 'integer',
              'minimum': 99,
              'maximum': 99999,
              'description': 'Credit card CVV number (Card Verification Value)'
            },
            'hash': {
              'type': 'string',
              'maxLength': 6000,
              'description': 'Credit card encrypted hash'
            },
            'save': {
              'type': 'boolean',
              'default': true,
              'description': 'Whether the hashed credit card should be saved for further use'
            }
          },
          'description': 'Credit card data, if payment will be done with credit card'
        },
        'installments_number': {
          'type': 'integer',
          'minimum': 1,
          'maximum': 199,
          'description': 'Number of installments chosen'
        },
        'loyalty_points_applied': {
          'type': 'object',
          'additionalProperties': false,
          'maxProperties': 30,
          'patternProperties': {
            '^[a-z0-9_]{2,30}$': {
              'type': 'number',
              // 'multipleOf': 0.00001,
              'minimum': 0,
              'maximum': 999999999,
              'description': 'Number of loyalty points used'
            }
          },
          'description': 'Customer\'s loyalty points used, program ID as property'
        },
        'open_payment_id': {
          'type': 'string',
          'maxLength': 255,
          'description': 'Payment or order ID if pre committed on gateway (authorization/capture)'
        },
        'amount_part': {
          'type': 'number',
          // 'multipleOf': 0.01,
          'minimum': 0,
          'maximum': 1,
          'default': 1,
          'description': 'Numeric part (multiplier) for final amount when ordering with 2+ transactions'
        }
      },
      'description': 'Transaction options object'
    }
  },
  'properties': {
    'items': {
      'type': 'array',
      'maxItems': 3000,
      'items': {
        'type': 'object',
        'additionalProperties': false,
        'required': [ 'product_id', 'quantity' ],
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
          'picture': {
            'type': 'object',
            'additionalProperties': false,
            'patternProperties': {
              '^small|normal|big|zoom|custom$': {
                'type': 'object',
                'required': [ 'url' ],
                'additionalProperties': false,
                'properties': {
                  'url': {
                    'type': 'string',
                    'maxLength': 255,
                    'format': 'uri',
                    'description': 'Image link'
                  },
                  'size': {
                    'type': 'string',
                    'maxLength': 11,
                    'pattern': '^[1-9]([0-9]+)?x[1-9]([0-9]+)?$',
                    'description': 'Image size (width x height) in px, such as 100x50 (100px width, 50px height)'
                  },
                  'alt': {
                    'type': 'string',
                    'maxLength': 255,
                    'description': 'Alternative text, HTML alt tag (important for SEO)'
                  }
                },
                'description': 'Image size variation'
              }
            },
            'description': 'Product or variation picture for this cart item'
          },
          'customizations': {
            'type': 'array',
            'maxItems': 100,
            'items': {
              'type': 'object',
              'required': [ '_id', 'option' ],
              'additionalProperties': false,
              'properties': {
                '_id': {
                  'type': 'string',
                  'pattern': '^[a-f0-9]{24}$',
                  'description': 'Customization field ID'
                },
                'label': {
                  'type': 'string',
                  'maxLength': 70,
                  'description': 'Title for this customization field, can be the grid title'
                },
                'option': {
                  'type': 'object',
                  'required': [ 'text' ],
                  'additionalProperties': false,
                  'properties': {
                    'option_id': {
                      'type': 'string',
                      'pattern': '^[a-z0-9_]{2,30}$',
                      'description': 'Identify option if it was predefined (not custom value created by customer)'
                    },
                    'text': {
                      'type': 'string',
                      'maxLength': 70,
                      'description': 'Option text value displayed for the client'
                    },
                    'colors': {
                      'type': 'array',
                      'maxItems': 6,
                      'items': {
                        'type': 'string',
                        'pattern': '^#[a-f0-9]{6}$',
                        'description': 'RGB code with #'
                      },
                      'description': 'Option color palette (if the field involves colors), starting by main color'
                    }
                  },
                  'description': 'Option chosen or created by customer'
                },
                'attachment': {
                  'type': 'string',
                  'maxLength': 255,
                  'format': 'uri',
                  'description': 'URL of file attached by customer to this field'
                },
                'add_to_price': {
                  'type': 'object',
                  'required': [ 'addition' ],
                  'additionalProperties': false,
                  'properties': {
                    'type': {
                      'type': 'string',
                      'enum': [ 'percentage', 'fixed' ],
                      'default': 'percentage',
                      'description': 'Type of price addition'
                    },
                    'addition': {
                      'type': 'number',
                      // 'multipleOf': 0.0001,
                      'minimum': -99999999,
                      'maximum': 99999999,
                      'description': 'Additional value, could be negative'
                    }
                  },
                  'description': 'Price alteration due to this customization'
                }
              },
              'description': 'Customization field'
            },
            'description': 'Item customization fields'
          },
          'kit_product': {
            'type': 'object',
            'additionalProperties': false,
            'required': [ '_id' ],
            'properties': {
              '_id': {
                'type': 'string',
                'pattern': '^[a-f0-9]{24}$',
                'description': 'Kit product ID'
              },
              'name': {
                'type': 'string',
                'maxLength': 255,
                'description': 'Kit product full name'
              },
              'pack_quantity': {
                'type': 'number',
                // 'multipleOf': 0.0001,
                'minimum': 0,
                'maximum': 9999999,
                'description': 'Total quantity of items to close a kit unit'
              },
              'price': {
                'type': 'number',
                // 'multipleOf': 0.00001,
                'minimum': 0,
                'maximum': 999999999,
                'description': 'Kit total price'
              }
            },
            'description': 'Parent kit product for this item'
          },
          'gift_wrap': {
            'type': 'object',
            'required': [ 'label' ],
            'additionalProperties': false,
            'properties': {
              'tag': {
                'type': 'string',
                'maxLength': 20,
                'pattern': '^[a-z0-9_]+$',
                'description': 'Tag to identify object, use only lowercase letters, digits and underscore'
              },
              'label': {
                'type': 'string',
                'maxLength': 70,
                'description': 'Title describing this gift wrap'
              },
              'add_to_price': {
                'type': 'number',
                // 'multipleOf': 0.0001,
                'minimum': 0,
                'maximum': 99999999,
                'description': 'Additional value due to this gift wrap'
              }
            },
            'description': 'Gift wrap chosen by customer'
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
          }
        }
      }
    },
    'shipping': {
      'type': 'object',
      'additionalProperties': false,
      'required': [ 'app_id', 'to' ],
      'properties': {
        'app_id': {
          'type': 'integer',
          'minimum': 1000,
          'maximum': 16777215,
          'description': 'ID of application chosen for shipping'
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
        }
      },
      'description': 'Shipping options to calculate freight and deadline'
    },
    'transaction': {
      'oneOf': [
        {
          '$ref': '#/definitions/transaction'
        },
        {
          'type': 'array',
          'maxItems': 5,
          'items': {
            '$ref': '#/definitions/transaction'
          }
        }
      ],
      'description': 'Payment options to create transaction(s)'
    },
    'discount': {
      'type': 'object',
      'required': [ 'app_id' ],
      'additionalProperties': false,
      'properties': {
        'app_id': {
          'type': 'integer',
          'minimum': 1000,
          'maximum': 16777215,
          'description': 'ID of application chosen for extra discount'
        },
        'discount_coupon': {
          'type': 'string',
          'maxLength': 255,
          'description': 'Text of discount coupon applied by customer'
        }
      },
      'description': 'Extra discount to apply by coupon or UTM campaign'
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
    'lang': {
      'type': 'string',
      'pattern': '^[a-z]{2}(_[a-z]{2})?$',
      'description': 'Language two letters code, sometimes with region, eg.: pt_br, fr, en_us'
    },
    'utm': {
      'type': 'object',
      'additionalProperties': false,
      'properties': {
        'source': {
          'type': 'string',
          'maxLength': 100,
          'description': 'Parameter "utm_source", the referrer: (e.g. google, newsletter)'
        },
        'medium': {
          'type': 'string',
          'maxLength': 100,
          'description': 'Parameter "utm_medium", the marketing medium: (e.g. cpc, banner, email)'
        },
        'campaign': {
          'type': 'string',
          'maxLength': 200,
          'description': 'Parameter "utm_campaign", the product, promo code, or slogan (e.g. spring_sale)'
        },
        'term': {
          'type': 'string',
          'maxLength': 100,
          'description': 'Parameter "utm_term", identifies the paid keywords'
        },
        'content': {
          'type': 'string',
          'maxLength': 255,
          'description': 'Parameter "utm_content", used to differentiate ads'
        }
      },
      'description': 'UTM campaign HTTP parameters'
    },
    'affiliate_code': {
      'type': 'string',
      'maxLength': 200,
      'description': 'Code to identify the affiliate that referred the customer'
    },
    'channel_id': {
      'type': 'integer',
      'minimum': 10000,
      'maximum': 4294967295,
      'description': 'Channel unique identificator'
    },
    'channel_type': {
      'type': 'string',
      'maxLength': 20,
      'enum': [ 'ecommerce', 'mobile', 'pdv', 'button', 'facebook', 'chatbot' ],
      'default': 'ecommerce',
      'description': 'Channel type or source'
    },
    'domain': {
      'type': 'string',
      'minLength': 4,
      'maxLength': 100,
      'pattern': '^[0-9a-z-.]+$',
      'description': 'Store domain name (numbers and lowercase letters, eg.: www.myshop.sample)'
    },
    'notes': {
      'type': 'string',
      'maxLength': 255,
      'description': 'Optional notes with additional info about this order'
    },
    'customer': {
      'type': 'object',
      'additionalProperties': false,
      'required': [ 'main_email', 'name' ],
      'properties': {
        '_id': {
          'type': [ 'null', 'string' ],
          'pattern': '^[a-f0-9]{24}$',
          'description': 'Customer ID'
        },
        'locale': {
          'type': 'string',
          'pattern': '^[a-z]{2}(_[a-z]{2})?$',
          'description': 'Customer language two letter code, sometimes with region, eg.: pt_br, fr, en_us'
        },
        'main_email': {
          'type': 'string',
          'maxLength': 200,
          'format': 'email',
          'description': 'Customer main email address'
        },
        'emails': {
          'type': 'array',
          'maxItems': 20,
          'items': {
            'type': 'object',
            'additionalProperties': false,
            'required': [ 'address' ],
            'properties': {
              'address': {
                'type': 'string',
                'maxLength': 200,
                'format': 'email',
                'description': 'The actual email address'
              },
              'type': {
                'type': 'string',
                'enum': [ 'work', 'home', 'other' ],
                'description': 'The type of email'
              },
              'verified': {
                'type': 'boolean',
                'default': false,
                'description': 'States whether or not the email address has been verified'
              }
            },
            'description': 'Email object'
          },
          'description': 'List of customer email addresses'
        },
        'display_name': {
          'type': 'string',
          'maxLength': 50,
          'description': 'The name of this Customer, suitable for display'
        },
        'name': {
          'type': 'object',
          'additionalProperties': false,
          'properties': {
            'family_name': {
              'type': 'string',
              'maxLength': 70,
              'description': 'The family name of this user, or "last name"'
            },
            'given_name': {
              'type': 'string',
              'maxLength': 70,
              'description': 'The "first name" of this user'
            },
            'middle_name': {
              'type': 'string',
              'maxLength': 255,
              'description': 'The middle name(s) of this user'
            }
          },
          'description': 'Customer name object'
        },
        'gender': {
          'type': 'string',
          'enum': [ 'f', 'm', 'x' ],
          'description': 'Customer gender, female, male or third gender (X)'
        },
        'photos': {
          'type': 'array',
          'uniqueItems': true,
          'maxItems': 20,
          'items': {
            'type': 'string',
            'maxLength': 255,
            'description': 'Image URL'
          },
          'description': 'User profile pictures'
        },
        'phones': {
          'type': 'array',
          'maxItems': 20,
          'items': {
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
              },
              'type': {
                'type': 'string',
                'enum': [ 'home', 'personal', 'work', 'other' ],
                'description': 'The type of phone'
              }
            },
            'description': 'Phone object'
          },
          'description': 'List of customer phone numbers'
        },
        'registry_type': {
          'type': 'string',
          'enum': [ 'p', 'j' ],
          'description': 'Physical or juridical (company) person'
        },
        'doc_country': {
          'type': 'string',
          'minLength': 2,
          'maxLength': 2,
          'pattern': '^[A-Z]+$',
          'description': 'Country of document origin, an ISO 3166-2 code'
        },
        'doc_number': {
          'type': 'string',
          'maxLength': 19,
          'pattern': '^[0-9]+$',
          'description': 'Responsible person or organization document number (only numbers)'
        },
        'inscription_type': {
          'type': 'string',
          'enum': [ 'State', 'Municipal' ],
          'description': 'Municipal or state registration if exists'
        },
        'inscription_number': {
          'type': 'string',
          'maxLength': 50,
          'description': 'Municipal or state registration number (with characters) if exists'
        },
        'corporate_name': {
          'type': 'string',
          'maxLength': 255,
          'description': 'Registered company name or responsible fullname'
        }
      },
      'description': 'Customer object'
    }
  }
};
