/* eslint-disable quote-props, comma-dangle, array-bracket-spacing */

const schema = {
  'description': 'Triggered when order is being closed, must create payment transaction and return info',
  'type': 'object',
  'required': [ 'items', 'amount', 'buyer', 'payment_method', 'order_number' ],
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
    'buyer': {
      'type': 'object',
      'additionalProperties': false,
      'required': [ 'customer_id', 'email', 'fullname', 'birth_date', 'phone', 'registry_type', 'doc_number' ],
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
      'description': 'Customer\'s loyalty points applied, program ID as property'
    },
    'order_id': {
      'type': 'string',
      'pattern': '^[a-f0-9]{24}$',
      'description': 'ID of created order'
    },
    'order_number': {
      'type': 'integer',
      'minimum': 1,
      'maximum': 999999999,
      'description': 'Number of created order'
    },
    'open_payment_id': {
      'type': 'string',
      'maxLength': 255,
      'description': 'Payment or order ID if pre committed on gateway (authorization/capture)'
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
    'browser_ip': {
      'type': 'string',
      'maxLength': 50,
      'description': 'IP address of the browser used by the customer when placing the order'
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
    'lang': {
      'type': 'string',
      'pattern': '^[a-z]{2}(_[a-z]{2})?$',
      'description': 'Language two letters code, sometimes with region, eg.: pt_br, fr, en_us'
    }
  }
};

exports.params = schema;

exports.response = {
  'description': schema.description,
  'type': 'object',
  'required': [ 'transaction' ],
  'additionalProperties': false,
  'properties': {
    'transaction': {
      'type': 'object',
      'additionalProperties': false,
      'required': [ 'amount' ],
      'properties': {
        'payment_link': {
          'type': 'string',
          'maxLength': 1000,
          'format': 'uri',
          'description': 'Direct link to pay current transaction'
        },
        'payment_instructions': {
          'type': 'string',
          'maxLength': 1000,
          'description': 'Additional text instructions for manual payments'
        },
        'intermediator': {
          'type': 'object',
          'additionalProperties': false,
          'properties': {
            'transaction_id': {
              'type': 'string',
              'maxLength': 255,
              'description': 'Transaction ID in the intermediator'
            },
            'transaction_code': {
              'type': 'string',
              'maxLength': 255,
              'description': 'Transaction code in the intermediator'
            },
            'transaction_reference': {
              'type': 'string',
              'maxLength': 255,
              'description': 'Transaction reference code'
            },
            'payment_method': {
              'type': 'object',
              'required': [ 'code' ],
              'additionalProperties': false,
              'properties': {
                'code': {
                  'type': 'string',
                  'maxLength': 100,
                  'description': 'Payment method code'
                },
                'name': {
                  'type': 'string',
                  'maxLength': 200,
                  'description': 'Short description for payment method'
                }
              },
              'description': 'Payment method as defined by intermediator'
            },
            'buyer_id': {
              'type': 'string',
              'maxLength': 255,
              'description': 'ID of customer account in the intermediator'
            }
          },
          'description': 'Transaction properties in the intermediator'
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
            'avs_result_code': {
              'type': [ 'string', 'null' ],
              'maxLength': 1,
              'pattern': '^[A-Z]$',
              'description': 'Response code from AVS: http://www.emsecommerce.net/avs_cvv2_response_codes.htm'
            },
            'cvv_result_code': {
              'type': [ 'string', 'null' ],
              'maxLength': 1,
              'pattern': '^[A-Z]$',
              'description': 'Response code from credit card company, such as AVS result code'
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
            'error_code': {
              'type': 'string',
              'enum': [
                'incorrect_number',
                'invalid_number',
                'invalid_expiry_date',
                'invalid_cvc',
                'expired_card',
                'incorrect_cvc',
                'incorrect_zip',
                'incorrect_address',
                'card_declined',
                'processing_error',
                'call_issuer',
                'pick_up_card'
              ],
              'description': 'Credit card processing standardized error code'
            }
          },
          'description': 'Credit card data, if payment was done with credit card'
        },
        'banking_billet': {
          'type': 'object',
          'additionalProperties': false,
          'properties': {
            'code': {
              'type': 'string',
              'maxLength': 200,
              'description': 'Ticket code, generally a barcode number'
            },
            'valid_thru': {
              'type': 'string',
              'format': 'date-time',
              'description': 'Date and time of expiration, in ISO 8601 standard representation'
            },
            'text_lines': {
              'type': 'array',
              'maxItems': 5,
              'items': {
                'type': 'string',
                'maxLength': 255,
                'description': 'Phrase or paragraph'
              },
              'description': 'Text lines on ticket'
            },
            'link': {
              'type': 'string',
              'maxLength': 255,
              'format': 'uri',
              'description': 'Direct link (URI) to banking billet'
            }
          },
          'description': 'Banking billet data, if payment was done with banking billet'
        },
        'loyalty_points': {
          'type': 'object',
          'required': [ 'program_id', 'points_value' ],
          'additionalProperties': false,
          'properties': {
            'name': {
              'type': 'string',
              'maxLength': 50,
              'description': 'The name of the loyalty points program'
            },
            'program_id': {
              'type': 'string',
              'pattern': '^[a-z0-9_]{2,30}$',
              'description': 'Unique identifier, program name using only lowercase, numbers and underscore'
            },
            'points_value': {
              'type': 'number',
              // 'multipleOf': 0.00001,
              'minimum': 0,
              'maximum': 999999999,
              'description': 'Number of loyalty points applied from customer account'
            },
            'ratio': {
              'type': 'number',
              // 'multipleOf': 0.001,
              'minimum': 0,
              'maximum': 9999,
              'description': 'The ratio of a point when converted to currency'
            }
          },
          'description': 'If paid with loyalty points, specify how many points and what program was consumed'
        },
        'currency_id': {
          'type': 'string',
          'pattern': '^[A-Z]{3}$',
          'description': 'Currency ID specific for this transaction, if different of order currency ID'
        },
        'currency_symbol': {
          'type': 'string',
          'maxLength': 20,
          'description': 'Currency symbol specific for this transaction'
        },
        'discount': {
          'type': 'number',
          // 'multipleOf': 0.0001,
          'minimum': -999999999,
          'maximum': 999999999,
          'description': 'Discount by payment method, negative if value was additionated (not discounted)'
        },
        'amount': {
          'type': 'number',
          // 'multipleOf': 0.00001,
          'minimum': 0,
          'maximum': 9999999999,
          'description': 'Transaction amount, disregarding installment rates'
        },
        'installments': {
          'type': 'object',
          'required': [ 'number' ],
          'additionalProperties': false,
          'properties': {
            'number': {
              'type': 'integer',
              'minimum': 1,
              'maximum': 199,
              'description': 'Number of installments'
            },
            'value': {
              'type': 'number',
              // 'multipleOf': 0.00001,
              'minimum': 0,
              'maximum': 9999999999,
              'description': 'Installment value'
            },
            'tax': {
              'type': 'boolean',
              'default': false,
              'description': 'Tax applied'
            },
            'total': {
              'type': 'number',
              // 'multipleOf': 0.00001,
              'minimum': 0,
              'maximum': 9999999999,
              'description': 'Total value, sum of all plots'
            }
          },
          'description': 'Installments option'
        },
        'creditor_fees': {
          'type': 'object',
          'additionalProperties': false,
          'properties': {
            'installment': {
              'type': 'number',
              // 'multipleOf': 0.00001,
              'minimum': 0,
              'maximum': 99999999,
              'description': 'Installment fee'
            },
            'operational': {
              'type': 'number',
              // 'multipleOf': 0.00001,
              'minimum': 0,
              'maximum': 99999999,
              'description': 'Operation fee'
            },
            'intermediation': {
              'type': 'number',
              // 'multipleOf': 0.00001,
              'minimum': 0,
              'maximum': 99999999,
              'description': 'Intermediation fee, if transaction have an intermediary'
            },
            'other': {
              'type': 'number',
              // 'multipleOf': 0.00001,
              'minimum': 0,
              'maximum': 99999999,
              'description': 'Sum of other transaction rates'
            }
          },
          'description': 'Cost data collected'
        },
        'status': {
          'type': 'object',
          'additionalProperties': false,
          'required': [ 'current' ],
          'properties': {
            'updated_at': {
              'type': 'string',
              'format': 'date-time',
              'description': 'Last status change, date and time in ISO 8601 standard representation'
            },
            'current': {
              'type': 'string',
              'enum': [
                'pending',
                'under_analysis',
                'authorized',
                'unauthorized',
                'paid',
                'in_dispute',
                'refunded',
                'voided',
                'unknown'
              ],
              'default': 'pending',
              'description': 'Payment status'
            }
          },
          'description': 'Financial status and date of change'
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
          'maxLength': 8000,
          'description': 'Optional notes with additional info about this transaction'
        }
      },
      'description': 'Created payment transaction object'
    },
    'redirect_to_payment': {
      'type': 'boolean',
      'default': false,
      'description': 'Whether the buyer should be redirected to payment link right after checkout'
    }
  }
};
