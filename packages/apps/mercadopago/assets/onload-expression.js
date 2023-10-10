/* eslint-disable */
(function () {
  window.Mercadopago.getIdentificationTypes();

  window._mpHash = function (data) {
    return new Promise((resolve, reject) => {
      window
        ._mpBrand(data.number)
        .then(() => {
          return setMPForm(data);
        })
        .then((res) => {
          window
            .Mercadopago
            .getIssuers(window.mpPaymentMethodId, (status, issuer) => {
              console.log(issuer);
              const token = `${res.id} // ${JSON.stringify({ 
                payment_method_id: window.mpPaymentMethodId, 
                issuer,
                deviceId: window.MP_DEVICE_SESSION_ID || 0 
              })}`;
              return resolve(token);
            });
        })
        .catch(reject);
    });
  };

  window._mpInstallments = function (data) {
    return new Promise((resolve, reject) => {
      window
        ._mpBrand(data.number)
        .then((paymentMethodId) => {
          const options = {
            payment_method_id: paymentMethodId,
            amount: data.amount,
          };

          return window
            .Mercadopago
            .getInstallments(options, (status, data) => {
              if (status === 200) {
                const installmentList = [];
                for (let i = 0; i < data[0].payer_costs.length; i++) {
                  const opt = data[0].payer_costs[i];
                  installmentList.push({
                    number: opt.installments,
                    tax: (opt.installment_rate > 0),
                    value: opt.installment_amount,
                  });
                }

                resolve(installmentList);
              } else {
                console.log('installments method info error:', response);
                reject(response);
              }
            });
        })
        .catch(reject);
    });
  };

  window._mpBrand = function (number) {
    return new Promise((resolve, reject) => {
      let bin = String(number);
      bin = bin.substring(0, 6);
      if (bin.length >= 6) {
        return window
          .Mercadopago
          .getPaymentMethod({
            bin,
          }, (status, resp) => {
            if (status === 200) {
              window.mpPaymentMethodId = resp[0].id;
              resolve(resp[0].id);
            } else {
              console.log('payment method info error:', resp);
              reject(resp);
            }
          });
      }
      reject(new Error('Failed trying installments with card number yet imcomplete'));
    });
  };

  function setMPForm(data) {
    return new Promise((resolve, reject) => {
      const { customer } = window.storefrontApp;
      const mpParams = {};
      mpParams.cardNumber = data.number;
      mpParams.cardholderName = data.name;
      mpParams.cardExpirationMonth = data.month;
      mpParams.cardExpirationYear = data.year;
      mpParams.securityCode = data.cvc;

      if (data.doc) {
        mpParams.docNumber = data.doc;
      } else {
        mpParams.docNumber = customer.doc_number;
      }

      mpParams.email = customer.main_email;
      mpParams.payment_method_id = window.mpPaymentMethodId;

      const $form = document.createElement('form');

      for (const key in mpParams) {
        if (mpParams[key]) {
          const value = mpParams[key];
          const $input = document.createElement('input');
          $input.setAttribute('type', 'text');
          $input.setAttribute('id', key);
          $input.setAttribute('data-checkout', key);
          $input.setAttribute('value', value);
          $form.appendChild($input);
        }
      }

      // todo
      // - select typeDoc
      const $typeDoc = document.createElement('select');
      $typeDoc.setAttribute('data-checkout', 'docType');
      const $typeDocOption = document.createElement('option');
      $typeDocOption.text = customer.registry_type === 'j' ? 'CNPJ' : 'CPF';
      $typeDocOption.value = customer.registry_type === 'j' ? 'CNPJ' : 'CPF';
      $typeDocOption.setAttribute('selected', true);
      $typeDoc.add($typeDocOption);

      $form.appendChild($typeDoc);
      // - select installments

      window.Mercadopago.createToken($form, (status, resp) => {
        if (status === 200) {
          resolve(resp);
        } else {
          reject(resp);
        }
      });
    });
  }
}());
