;(function () {
  window._newPaypalPaymentObj = function () {
    if (window.storefrontApp) {
      var amount = window.storefrontApp.amount
      if (amount && amount.total) {
        // parse E-Com Plus checkout data to resumed PayPal payment object
        return {
          intent: 'sale',
          transactions: [{
            amount: {
              total: amount.total.toFixed(2),
              currency: (window.$ecomConfig && window.$ecomConfig.get('currency')) || 'BRL'
            }
          }]
        }
      }
    }
    return window._paypalPaymentObj
  }

  window._paypalApprove = new Promise(function (resolve, reject) {
    // https://developer.paypal.com/docs/archive/checkout/integrate/#how-a-client-integration-works
    window.paypal.Button.render({
      env: window._paypalEnv !== 'sandbox' ? 'production' : window._paypalEnv,
      locale: window._paypalLocale || 'pt_BR',
      style: {
        size: 'responsive',
        color: 'gold',
        shape: 'pill'
      },

      payment: function (data, actions) {
        if (window._paypalPaymentId) {
          return window._paypalPaymentId
        }
        return actions.payment.create(window._newPaypalPaymentObj())
      },

      onAuthorize: function (data, actions) {
        return resolve({
          intermediator_buyer_id: data.payerID,
          open_payment_id: window._paypalPaymentId +
            '/' + data.paymentID +
            '/' + window._paypalInvoiceNumber
        })
      }
    }, '#paypal-button-container')
  })
}())
