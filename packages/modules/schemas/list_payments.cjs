/* eslint-disable quote-props, comma-dangle, array-bracket-spacing */

const schema = {
  'description': 'Triggered when listing payments, must return available methods',
  'type': 'object',
  'additionalProperties': false,
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
          }
        },
        'description': 'One of the cart items'
      },
      'description': 'Products composing the cart'
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
    'amount': {
      'type': 'object',
      'additionalProperties': false,
      'required': [ 'total' ],
      'properties': {
        'total': {
          'type': 'number',
          // 'multipleOf': 0.00001,
          'minimum': 0,
          'maximum': 9999999999,
          'description': 'Order total amount'
        },
        'subtotal': {
          'type': 'number',
          // 'multipleOf': 0.00001,
          'minimum': 0,
          'maximum': 9999999999,
          'description': 'The sum of all items prices'
        },
        'freight': {
          'type': 'number',
          // 'multipleOf': 0.00001,
          'minimum': 0,
          'maximum': 9999999999,
          'description': 'Order freight cost'
        },
        'discount': {
          'type': 'number',
          // 'multipleOf': 0.00001,
          'minimum': 0,
          'maximum': 9999999999,
          'description': 'Applied discount value'
        },
        'tax': {
          'type': 'number',
          // 'multipleOf': 0.00001,
          'minimum': 0,
          'maximum': 9999999999,
          'description': 'The sum of all the taxes applied to the order'
        },
        'extra': {
          'type': 'number',
          // 'multipleOf': 0.00001,
          'minimum': 0,
          'maximum': 9999999999,
          'description': 'Sum of optional extra costs applied'
        }
      },
      'description': 'Object with sums of values'
    },
    'lang': {
      'type': 'string',
      'pattern': '^[a-z]{2}(_[a-z]{2})?$',
      'description': 'Language two letters code, sometimes with region, eg.: pt_br, fr, en_us'
    },
    'domain': {
      'type': 'string',
      'minLength': 4,
      'maxLength': 100,
      'pattern': '^[0-9a-z-.]+$',
      'description': 'Store domain name (numbers and lowercase letters, eg.: www.myshop.sample)'
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
        },
        'addresses': {
          'type': 'array',
          'maxItems': 40,
          'items': {
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
              },
              'default': {
                'type': 'boolean',
                'default': false,
                'description': 'Indicates whether this address is the default address for the customer'
              }
            },
            'description': 'Address object'
          },
          'description': 'List of customer addresses'
        }
      },
      'description': 'Customer object'
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
      'description': 'Optional payment method selected by customer (if already selected)'
    },
    'installments_number': {
      'type': 'integer',
      'minimum': 1,
      'maximum': 199,
      'description': 'Number of installments chosen (if payment selected)'
    },
    'can_fetch_when_selected': {
      'type': 'boolean',
      'default': false,
      'description': 'Whether list payments can be refetched on client when payment selected'
    },
    'is_checkout_confirmation': {
      'type': 'boolean',
      'default': false,
      'description': 'Whether payment were already chosen and is just being confirmed to complete checkout'
    }
  }
};

exports.params = schema;

exports.response = {
  'description': schema.description,
  'type': 'object',
  'required': [ 'payment_gateways' ],
  'additionalProperties': false,
  'properties': {
    'installments_option': {
      'type': 'object',
      'required': [ 'max_number' ],
      'additionalProperties': false,
      'properties': {
        'min_installment': {
          'type': 'number',
          // 'multipleOf': 0.0001,
          'minimum': -99999999,
          'maximum': 99999999,
          'description': 'Minimum installment value'
        },
        'max_number': {
          'type': 'integer',
          'minimum': 2,
          'maximum': 999,
          'description': 'Maximum number of installments'
        },
        'monthly_interest': {
          'type': 'number',
          // 'multipleOf': 0.0001,
          'minimum': 0,
          'maximum': 9999,
          'default': 0,
          'description': 'Monthly tax applied, 0 means interest free'
        }
      },
      'description': 'Optional default installments option'
    },
    'discount_option': {
      'type': 'object',
      'additionalProperties': false,
      'properties': {
        'min_amount': {
          'type': 'integer',
          'minimum': 1,
          'maximum': 999999999,
          'description': 'Minimum amount to apply the discount'
        },
        'label': {
          'type': 'string',
          'maxLength': 50,
          'description': 'Name of payment method that handle the discount'
        },
        'apply_at': {
          'type': 'string',
          'enum': [ 'total', 'subtotal' ],
          'default': 'subtotal',
          'description': 'In which value the discount will be applied at checkout'
        },
        'type': {
          'type': 'string',
          'enum': [ 'percentage', 'fixed' ],
          'default': 'percentage',
          'description': 'Discount type'
        },
        'value': {
          'type': 'number',
          // 'multipleOf': 0.0001,
          'default': 0,
          'minimum': -99999999,
          'maximum': 99999999,
          'description': 'Discount value, percentage or fixed'
        }
      },
      'description': 'Optional default discount option by payment method'
    },
    'loyalty_points_programs': {
      'type': 'object',
      'additionalProperties': false,
      'maxProperties': 30,
      'patternProperties': {
        '^[a-z0-9_]{2,30}$': {
          'type': 'object',
          'required': [ 'ratio' ],
          'additionalProperties': false,
          'properties': {
            'name': {
              'type': 'string',
              'maxLength': 50,
              'description': 'The name of the loyalty points program'
            },
            'ratio': {
              'type': 'number',
              // 'multipleOf': 0.001,
              'minimum': 0,
              'maximum': 9999,
              'description': 'The ratio of a point when converted to currency'
            },
            'max_points': {
              'type': 'number',
              // 'multipleOf': 0.00001,
              'minimum': 0,
              'maximum': 999999999,
              'description': 'Maximum number of points to apply'
            },
            'min_subtotal_to_earn': {
              'type': 'integer',
              'minimum': 1,
              'maximum': 999999999,
              'description': 'Minimum cart subtotal to earn new points'
            },
            'earn_percentage': {
              'type': 'integer',
              'minimum': 0,
              'maximum': 100,
              'description': 'Subtotal percentage that will be converted into new points on purchase'
            }
          },
          'description': 'Available loyalty points program object'
        }
      },
      'description': 'Available loyalty point programs, program ID as property'
    },
    'payment_gateways': {
      'type': 'array',
      'maxItems': 30,
      'items': {
        'type': 'object',
        'additionalProperties': false,
        'required': [ 'label', 'payment_method' ],
        'properties': {
          'label': {
            'type': 'string',
            'maxLength': 50,
            'description': 'Name of payment method shown to customers'
          },
          'text': {
            'type': 'string',
            'maxLength': 1000,
            'description': 'Auxiliary text about the payment method, can contain HTML tags'
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
            'description': 'Payment method object'
          },
          'discount': {
            'type': 'object',
            'additionalProperties': false,
            'properties': {
              'apply_at': {
                'type': 'string',
                'enum': [ 'total', 'subtotal', 'freight' ],
                'default': 'subtotal',
                'description': 'In which value the discount will be applied at checkout'
              },
              'type': {
                'type': 'string',
                'enum': [ 'percentage', 'fixed' ],
                'default': 'percentage',
                'description': 'Discount type'
              },
              'value': {
                'type': 'number',
                // 'multipleOf': 0.0001,
                'default': 0,
                'minimum': -99999999,
                'maximum': 99999999,
                'description': 'Discount value, percentage or fixed'
              }
            },
            'description': 'Discount to be applied by payment method'
          },
          'card_companies': {
            'type': 'array',
            'maxItems': 30,
            'items': {
              'type': 'string',
              'maxLength': 100,
              'description': 'Credit card issuer name, eg.: Visa, American Express, MasterCard'
            },
            'description': 'List of accepted card brands'
          },
          'installment_options': {
            'type': 'array',
            'maxItems': 30,
            'items': {
              'type': 'object',
              'required': [ 'number', 'value' ],
              'additionalProperties': false,
              'properties': {
                'number': {
                  'type': 'integer',
                  'minimum': 2,
                  'maximum': 999,
                  'description': 'Number of installments'
                },
                'value': {
                  'type': 'number',
                  // 'multipleOf': 0.00001,
                  'minimum': 0,
                  'maximum': 999999999,
                  'description': 'Installment value'
                },
                'tax': {
                  'type': 'boolean',
                  'default': false,
                  'description': 'Tax applied'
                }
              },
              'description': 'Installment option'
            },
            'description': 'List of options for installment'
          },
          'js_client': {
            'type': 'object',
            'required': [ 'script_uri' ],
            'additionalProperties': false,
            'properties': {
              'script_uri': {
                'type': 'string',
                'maxLength': 1000,
                'format': 'uri',
                'description': 'Script (JS) link'
              },
              'fallback_script_uri': {
                'type': 'string',
                'maxLength': 1000,
                'format': 'uri',
                'description': 'Optional script link to try if the first URI goes offline'
              },
              'onload_expression': {
                'type': 'string',
                'maxLength': 3000,
                'description': 'JS expression to run (with `eval`) after script load'
              },
              'container_html': {
                'type': 'string',
                'maxLength': 1000,
                'description': 'Append HTML to render payment iframe/components on checkout'
              },
              'transaction_promise': {
                'type': 'string',
                'maxLength': 50,
                'description': 'Checkout promise variable (on `window`) resolved with transaction-like object'
              },
              'cc_hash': {
                'type': 'object',
                'required': [ 'function' ],
                'additionalProperties': false,
                'properties': {
                  'function': {
                    'type': 'string',
                    'maxLength': 50,
                    'description': 'Func name, receives obj with `name`, `doc`, `number`, `cvc`, `month`, `year`'
                  },
                  'is_promise': {
                    'type': 'boolean',
                    'default': false,
                    'description': 'If it is a Promise, use for async process'
                  }
                },
                'description': 'Function to call for credit card hash generation, must return hash string'
              },
              'cc_installments': {
                'type': 'object',
                'required': [ 'function' ],
                'additionalProperties': false,
                'properties': {
                  'function': {
                    'type': 'string',
                    'maxLength': 50,
                    'description': 'Func name, receives obj with `number` and `amount` (total)'
                  },
                  'is_promise': {
                    'type': 'boolean',
                    'default': false,
                    'description': 'If it is a Promise, use for async process'
                  }
                },
                'description': 'Optional function to get `installment_options` array from card number'
              },
              'cc_brand': {
                'type': 'object',
                'required': [ 'function' ],
                'additionalProperties': false,
                'properties': {
                  'function': {
                    'type': 'string',
                    'maxLength': 50,
                    'description': 'Func name, receives obj with `number`'
                  },
                  'is_promise': {
                    'type': 'boolean',
                    'default': false,
                    'description': 'If it is a Promise, use for async process'
                  }
                },
                'description': 'Optional function to call for card validation, returns brand name or false'
              }
            },
            'description': 'Gateway web JS SDK, usually to handle credit cards with encryption'
          },
          'fetch_when_selected': {
            'type': 'boolean',
            'default': false,
            'description': 'Resend list payments request if this payment gateway is selected'
          }
        },
        'description': 'Payment option (gateway)'
      },
      'description': 'Payment gateway options list'
    },
    'interest_free_installments': {
      'type': 'integer',
      'minimum': 2,
      'maximum': 999,
      'description': '[DEPRECATED] => use `installments_option` instead'
    }
  }
};
