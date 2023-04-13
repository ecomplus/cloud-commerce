;(function () {
  window._newPaypalOrderObj = function () {
    if (window.storefrontApp) {
      var amount = window.storefrontApp.amount
      var customer = window.storefrontApp.customer
      var items = window.storefrontApp.items

      if (amount && amount.total) {
        // parse E-Com Plus checkout data to PayPal order object
        // https://github.com/ecomclub/storefront-app/commit/f55a5ef1170d50beb68a314ef6c096d37fbe9643
        var paypalOrder = {
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              value: amount.total.toString(),
              currency_code: (window.$ecomConfig && window.$ecomConfig.get('currency')) || 'BRL'
            }
          }]
        }
        if (Array.isArray(items) && items.length) {
          if (items[0].currency_id) {
            paypalOrder.purchase_units[0].currency_code = items[0].currency_id
          }
        }

        if (customer) {
          paypalOrder.payer = {
            email_address: customer.main_email
          }
          if (customer.name && customer.name.given_name) {
            paypalOrder.payer.name = {
              given_name: customer.name.given_name
            }
            if (customer.name.middle_name && customer.name.family_name) {
              paypalOrder.payer.name.surname = customer.name.middle_name + ' ' + customer.name.family_name
            } else if (customer.name.middle_name || customer.name.family_name) {
              paypalOrder.payer.name.surname = customer.name.middle_name || customer.name.family_name
            }
          }

          if (Array.isArray(customer.phones) && customer.phones[0]) {
            paypalOrder.payer.phone = {
              phone_type: 'MOBILE',
              phone_number: {
                national_number: customer.phones[0].number.toString()
              }
            }
          }

          if (Array.isArray(customer.addresses)) {
            var paypalAddress
            for (var i = 0; i < customer.addresses.length; i++) {
              var address = customer.addresses[i]
              if (address.default) {
                paypalAddress = {
                  postal_code: address.zip,
                  admin_area_1: address.province_code || address.province || '',
                  admin_area_2: address.city,
                  address_line_1: address.line_address ||
                    (address.street ? address.street + ' ' + (address.number || 'S/N') : ''),
                  address_line_2: address.complement || '',
                  country_code: address.country_code || 'BR'
                }
                break
              }
            }
            if (paypalAddress) {
              paypalOrder.purchase_units[0].shipping = paypalOrder.payer.address = paypalAddress
            }
          }
        }
        return paypalOrder
      }
    }
    return window._paypalOrderObj
  }

  window._paypalApprove = new Promise(function (resolve, reject) {
    // https://developer.paypal.com/docs/checkout/integrate/#3-render-the-smart-payment-buttons
    window.paypal.Buttons({
      enableStandardCardFields: Boolean(window._paypalStCardFields),

      createOrder: function (data, actions) {
        return actions.order.create(window._newPaypalOrderObj())
      },

      onApprove: function (data, actions) {
        // capture the funds from the transaction
        return actions.order.capture().then(function (details) {
          resolve({
            open_payment_id: details.id
          })
        })
      },

      onError: function (err) {
        reject(err)
      }
    }).render('#paypal-button-container')
  })
}())
