;(function () {
  window._pppContinue = new Promise(function (resolve, reject) {
    // https://developer.paypal.com
    // /docs/integration/paypal-plus/mexico-brazil/integrate-a-payment-selection-page/
    var pppParams = {
      approvalUrl: window._paypalApprovalUrl,
      disallowRememberedCards: Boolean(window._paypalDisallowRemembered),
      placeholder: 'ppplus',
      mode: window._paypalEnv,
      disableContinue: 'pppContinue',
      enableContinue: 'pppContinue',
      onContinue: function (rememberedCards, payerId, paymentId) {
        resolve({
          credit_card: {
            token: rememberedCards || ''
          },
          intermediator_buyer_id: payerId,
          open_payment_id: window._paypalPaymentId +
            '/' + paymentId +
            '/' + window._paypalInvoiceNumber
        })
      },
      onError: function (err) {
        reject(err)
      },
      onLoad: function () {
        var $loading = document.getElementById('pppLoading')
        if ($loading) {
          $loading.remove()
        }
      }
    }

    if (window.storefrontApp) {
      var customer = window.storefrontApp.customer
      if (customer) {
        pppParams.payerEmail = customer.main_email
        pppParams.payerTaxId = customer.doc_number
        pppParams.payerTaxIdType = customer.registry_type === 'j' ? 'BR_CNPJ' : 'BR_CPF'
        pppParams.country = customer.doc_country || 'BR'
        if (pppParams.country === 'BR') {
          pppParams.language = 'pt_BR'
        }
        if (customer.name && customer.name.given_name) {
          pppParams.payerFirstName = customer.name.given_name
          if (customer.name.middle_name && customer.name.family_name) {
            pppParams.payerLastName = customer.name.middle_name + ' ' + customer.name.family_name
          } else if (customer.name.middle_name || customer.name.family_name) {
            pppParams.payerLastName = customer.name.middle_name || customer.name.family_name
          }
        }
        if (Array.isArray(customer.phones) && customer.phones[0]) {
          pppParams.payerPhone = customer.phones[0].number.toString()
        }
      }
    }

    window._pppApp = window.PAYPAL.apps.PPP(pppParams)
  })
}())
