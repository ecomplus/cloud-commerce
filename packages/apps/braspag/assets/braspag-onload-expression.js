/* eslint-disable no-console */
(function braspagOnload() {
  const isSandbox = window._braspagIsSandbox;
  const accessToken = window._braspagAccessToken;
  const fingerprintApp = window._braspagFingerprintApp || 'seu_app';

  const form = document.createElement('form');
  form.id = 'fingerprintForm';
  document.body.appendChild(form);

  const sessionInput = document.createElement('input');
  sessionInput.id = 'mySessionId';
  sessionInput.type = 'hidden';
  form.appendChild(sessionInput);

  function injectClearSaleScript(app, sessionId) {
    const scriptContent = `
      (function (a, b, c, d, e, f, g) {
        a['CsdpObject'] = e; a[e] = a[e] || function () {
        (a[e].q = a[e].q || []).push(arguments)
        }, a[e].l = 1 * Date.now(); f = b.createElement(c),
        g = b.getElementsByTagName(c)[0]; f.defer = 1; f.src = d; g.parentNode.insertBefore(f, g)
      })(window, document, 'script', '//device.clearsale.com.br/p/fp.js', 'csdp');
      csdp('app', '${app}');
      ${sessionId ? `csdp('sessionid', '${sessionId}');` : "csdp('outputsessionid', 'mySessionId');"}
    `;
    const scriptElement = document.createElement('script');
    scriptElement.innerHTML = scriptContent;
    document.body.appendChild(scriptElement);
  }

  injectClearSaleScript(fingerprintApp);

  /*
   * 3DS authentication with the Cielo MPI script (V2), ported from the legacy
   * app (hosting/card-client.js). Resolves `{ status, data }` and never
   * rejects: the required 3DS policy is decided on `_braspagHashCard`.
   */
  const refusal3dsMessage = 'O banco não autenticou esta compra no cartão (3DS). '
    + 'Tente novamente ou pague com Pix ou boleto.';
  const load3ds = (cardClient) => new Promise((resolve) => {
    let isDone = false;
    const done = (status, data) => {
      if (isDone) return;
      isDone = true;
      console.log('3ds', status, data);
      resolve({ status, data });
    };
    setTimeout(() => done('timeout'), window._braspag3dsTimeout || 30000);
    const settings = window.storefront?.settings || {};
    const { amount, customer = {}, items } = window.storefrontApp || {};

    const setup3dsForm = async () => {
      const previousForm = document.getElementById('braspag3ds');
      if (previousForm) previousForm.remove();
      const form3ds = document.createElement('form');
      form3ds.id = 'braspag3ds';
      form3ds.style.display = 'none';
      const shippingAddress = customer.addresses?.[0] || {};
      const formatDate = (date) => {
        if (!date) return undefined;
        const d = typeof date === 'string' ? new Date(date) : date;
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-`
          + `${String(d.getDate()).padStart(2, '0')}`;
      };
      let ip64;
      try {
        const ipResponse = await fetch('https://api64.ipify.org/');
        if (ipResponse.ok) ip64 = await ipResponse.text();
      } catch {
        //
      }
      // https://docs.cielo.com.br/gateway/docs/2-mapeando-as-classes
      const fields = {
        bpmpi_auth: true,
        bpmpi_auth_notifyonly: false,
        bpmpi_accesstoken: window._braspag3dsToken,
        bpmpi_ordernumber: `R${Math.round(Math.random() * (999999 - 199999) + 199999)}`,
        bpmpi_currency: 'BRL',
        bpmpi_totalamount: Math.round((amount?.total || 0) * 100),
        bpmpi_installments: 1,
        bpmpi_paymentmethod: 'credit',
        bpmpi_cardnumber: cardClient.number,
        bpmpi_cardexpirationmonth: cardClient.month.toString(),
        bpmpi_cardexpirationyear: `20${cardClient.year.toString()}`,
        bpmpi_default_card: true,
        bpmpi_billto_customerid: customer.doc_number,
        bpmpi_merchant_newcustomer: customer.orders?.length > 1,
        bpmpi_billto_contactname: customer.fullname || cardClient.name,
        bpmpi_billto_name: customer.fullname || cardClient.name,
        bpmpi_billto_phonenumber: customer.phones?.[0]?.number,
        bpmpi_billto_email: customer.main_email,
        bpmpi_billto_street1: shippingAddress.street || shippingAddress.line_address,
        bpmpi_billto_street2: shippingAddress.number,
        bpmpi_billto_city: shippingAddress.city,
        bpmpi_billto_state: shippingAddress.province_code,
        bpmpi_billto_country: shippingAddress.country_code || 'BR',
        bpmpi_billto_zipcode: shippingAddress.zip,
        bpmpi_shipto_sameasbillto: true,
        bpmpi_device_ipaddress: ip64,
        bpmpi_device_1_fingerprint: cardClient.fingerPrintId,
        bpmpi_device_1_provider: 'clearsale',
        bpmpi_device_channel: 'Browser',
        bpmpi_transaction_mode: 'S',
        bpmpi_merchant_url: settings.domain && `https://${settings.domain}`,
        bpmpi_order_recurrence: false,
        bpmpi_order_productcode: 'PHY',
        bpmpi_order_marketingoptin: customer.accepts_marketing,
        bpmpi_useraccount_guest: false,
        bpmpi_useraccount_createddate: formatDate(customer.created_at),
        bpmpi_useraccount_changeddate: formatDate(customer.updated_at),
      };
      let nItems = 0;
      items?.forEach((item) => {
        const price = item.final_price || item.price;
        if (!item.quantity || !item.sku || !price) return;
        nItems += 1;
        fields[`bpmpi_cart_${nItems}_description`] = item.name || item.sku;
        fields[`bpmpi_cart_${nItems}_name`] = item.name || item.sku;
        fields[`bpmpi_cart_${nItems}_sku`] = item.sku;
        fields[`bpmpi_cart_${nItems}_quantity`] = item.quantity;
        fields[`bpmpi_cart_${nItems}_unitprice`] = Math.round(price * 100);
      });
      Object.keys(fields).forEach((className) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.className = className;
        input.value = fields[className] == null ? '' : fields[className];
        form3ds.appendChild(input);
      });
      document.body.appendChild(form3ds);
    };

    const isSandbox3ds = Boolean(window._braspag3dsIsSandbox);
    window.bpmpi_config = () => ({
      onReady() {
        window.bpmpi_authenticate();
      },
      // Card eligible and cardholder authenticated
      onSuccess(data) {
        done('authenticated', data);
      },
      // Card eligible, but the cardholder failed the challenge
      onFailure(data) {
        done('failure', data);
      },
      // Card not eligible for authentication
      onUnenrolled(data) {
        done('unenrolled', data);
      },
      // `bpmpi_auth` false
      onDisabled() {
        done('disabled');
      },
      onError(data) {
        done('error', data);
      },
      onUnsupportedBrand(data) {
        done('unsupported_brand', data);
      },
      Environment: isSandbox3ds ? 'SDB' : 'PRD',
      Debug: isSandbox3ds,
    });

    setup3dsForm().then(() => {
      const script = document.createElement('script');
      script.src = isSandbox3ds
        ? 'https://mpisandbox.braspag.com.br/Scripts/BP.Mpi.3ds20.min.js'
        : 'https://mpi.braspag.com.br/Scripts/BP.Mpi.3ds20.min.js';
      script.async = true;
      script.onerror = () => done('script_error');
      document.body.appendChild(script);
    }).catch(() => done('script_error'));
  });

  window._braspagHashCard = function hashCard(cardClient) {
    const fingerPrintId = document.getElementById('mySessionId').value;
    if (fingerPrintId && fingerPrintId !== '') {
      console.log('Session ID captured:', fingerPrintId);
      injectClearSaleScript(fingerprintApp, fingerPrintId);
    } else {
      return Promise.reject(new Error('Session ID (mySessionId) not captured.'));
    }

    const elementsForm = `
    <input type="text" class="bp-sop-cardtype" value="creditCard" style="display: none;>
    <input type="text" class="bp-sop-cardcvvc" value="${cardClient.cvc}" style="display: none;">
    <input type="text" class="bp-sop-cardnumber" value="${cardClient.number}" style="display: none;">
    <input type="text" class="bp-sop-cardexpirationdate" value="${cardClient.month.toString()}/20${cardClient.year.toString()}" style="display: none;">
    <input type="text" class="bp-sop-cardholdername" value="${cardClient.name}" style="display: none;">
    `;

    const newForm = document.createElement('form');
    newForm.setAttribute('id', 'formBraspag');
    newForm.innerHTML = elementsForm;
    document.body.appendChild(newForm);

    return new Promise((resolve, reject) => {
      const options = {
        accessToken,
        onSuccess(response) {
          if (response.PaymentToken) {
            const data = { token: response.PaymentToken, fingerPrintId };
            const sendHash = () => resolve(window.btoa(JSON.stringify(data)));
            const is3dsRequired = Boolean(window._braspag3dsRequired);
            const refuse = () => {
              const error = new Error(refusal3dsMessage);
              // CreditCardForm appends `userMsg` to the "invalid card" toast
              error.userMsg = ` ${refusal3dsMessage}`;
              reject(error);
            };
            if (!window._braspag3dsToken) {
              if (is3dsRequired) {
                refuse();
                return;
              }
              sendHash();
              return;
            }
            const card3ds = { ...cardClient, fingerPrintId };
            delete card3ds.cvc;
            load3ds(card3ds).then(({ status, data: out3ds }) => {
              data.status3ds = status;
              if (status === 'authenticated' && out3ds && typeof out3ds === 'object') {
                data.out3ds = out3ds;
              } else if (is3dsRequired) {
                refuse();
                return;
              }
              sendHash();
            });
          } else {
            const error = new Error('Payment Token not found. Please try again or refresh the page.');
            reject(error);
          }
        },
        onError(response) {
          reject(response);
        },
        onInvalid(validationResults) {
          reject(validationResults);
        },
        environment: isSandbox ? 'sandbox' : 'production',
        language: 'PT',
        enableBinQuery: false,
        enableVerifyCard: true,
        enableTokenize: false,
        cvvrequired: false,
      };
      window.bpSop_silentOrderPost(options);
    });
  };
}());
