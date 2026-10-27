/* eslint-disable no-console */
/*
 * Card client: ClearSale fingerprint, Silent Order Post and 3DS. Too big for
 * `onload_expression` (3000 characters), so `braspag-onload-expression.js`
 * loads it from this package on npm, pinned to the same version, and defines
 * `_braspagHashCard` calling `_braspagCardClient` below. Same split as the
 * legacy app (hosting/card-client.js).
 *
 * Tokens are read from `window` when the card is sent: list payments may run
 * again on checkout with fresh ones.
 *
 * BROWSER/SERVER CONTRACT: the loader pins this file to the package MAJOR
 * version on the CDN, so a store on an old patch runs the newest script of
 * the same major. Within a major, keep backward compatible:
 * - the `window` variables read here (`_braspagAccessToken`,
 *   `_braspagIsSandbox`, `_braspagFingerprintApp`, `_braspag3dsToken`,
 *   `_braspag3dsIsSandbox`, `_braspag3dsRequired`, `_braspag3dsTimeout`);
 * - the base64 hash sent to the server: `token`, `fingerPrintId`,
 *   `status3ds`, `out3ds`.
 */
(function braspagCardClient() {
  const fingerprintApp = window._braspagFingerprintApp || 'seu_app';

  let sessionInput = document.getElementById('mySessionId');
  if (!sessionInput) {
    const form = document.createElement('form');
    form.id = 'fingerprintForm';
    document.body.appendChild(form);
    sessionInput = document.createElement('input');
    sessionInput.id = 'mySessionId';
    sessionInput.type = 'hidden';
    form.appendChild(sessionInput);
  }

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

  // Buyer IP for the 3DS device data, fetched once on load: fetching it on
  // the pay click would delay every attempt, and an ipify outage would mean
  // refusal by timeout with required 3DS
  let ip64Promise;
  const getIp64 = () => {
    if (!ip64Promise) {
      const signal = typeof AbortSignal !== 'undefined' && AbortSignal.timeout
        ? AbortSignal.timeout(4000)
        : undefined;
      ip64Promise = fetch('https://api64.ipify.org/', { signal })
        .then((response) => (response.ok ? response.text() : undefined))
        .catch(() => undefined);
    }
    return ip64Promise;
  };
  if (window._braspag3dsToken) getIp64();

  /*
   * 3DS authentication with the Cielo MPI script (V2), ported from the legacy
   * app (hosting/card-client.js). Resolves `{ status, data }` and never
   * rejects: the required 3DS policy is decided on `_braspagCardClient`.
   */
  // Keep in sync with `REFUSAL_MESSAGE` on `lib-mjs/lib/braspag/3ds/policy.mjs`
  const refusal3dsMessage = 'O banco não autenticou esta compra no cartão (3DS). '
    + 'Recarregue a página para tentar de novo, ou pague com Pix ou boleto.';

  const onlyDigits = (value) => (value == null ? '' : String(value).replace(/\D/g, ''));

  // Keep in sync with `parse3dsResult` on `lib-mjs/lib/braspag/3ds/policy.mjs`:
  // ECI with liability shift (Visa/Elo/Amex 05/06, Mastercard 02/01), CAVV
  // and ReferenceId required
  const authenticatedEci = ['01', '02', '05', '06'];
  const is3dsAuthenticated = (out3ds) => {
    if (!out3ds || typeof out3ds !== 'object') return false;
    const eci = out3ds.Eci === undefined || out3ds.Eci === null
      ? ''
      : String(out3ds.Eci).padStart(2, '0');
    return Boolean(out3ds.Cavv && out3ds.ReferenceId && authenticatedEci.indexOf(eci) > -1);
  };
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
      const address = customer.addresses?.find((addr) => addr.default)
        || customer.addresses?.[0]
        || {};
      const formatDate = (date) => {
        if (!date) return undefined;
        const d = typeof date === 'string' ? new Date(date) : date;
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-`
          + `${String(d.getDate()).padStart(2, '0')}`;
      };
      const ip64 = await getIp64();
      const name = (customer.fullname || cardClient.name || '').slice(0, 120);
      const docNumber = onlyDigits(customer.doc_number);
      const phone = customer.phones?.[0];
      let phoneNumber = onlyDigits(phone?.number);
      if (phoneNumber.length === 10 || phoneNumber.length === 11) {
        phoneNumber = `${phone.country_code || 55}${phoneNumber}`;
      }
      const zip = onlyDigits(address.zip);
      /*
       * https://docs.cielo.com.br/gateway/docs/2-mapeando-as-classes
       * In production the MPI refuses the whole authentication with 102
       * "Invalid field value" when a field is out of format, and an empty
       * field counts: values that don't fit are left out (`undefined`)
       */
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
        bpmpi_billto_customerid: docNumber.length >= 11 && docNumber.length <= 14
          ? docNumber
          : undefined,
        bpmpi_merchant_newcustomer: customer.orders?.length > 1,
        bpmpi_billto_contactname: name,
        bpmpi_billto_name: name,
        // Country code, area code and number, e.g. 5511999999999
        bpmpi_billto_phonenumber: /^\d{12,15}$/.test(phoneNumber) ? phoneNumber : undefined,
        bpmpi_billto_email: customer.main_email,
        // Street and number, then complement and borough
        bpmpi_billto_street1: [address.street || address.line_address, address.number]
          .filter(Boolean).join(', ').slice(0, 60),
        bpmpi_billto_street2: [address.complement, address.borough]
          .filter(Boolean).join(' - ').slice(0, 60),
        bpmpi_billto_city: address.city,
        bpmpi_billto_state: address.province_code,
        bpmpi_billto_country: address.country_code || 'BR',
        bpmpi_billto_zipcode: zip.length === 8 ? zip : undefined,
        bpmpi_shipto_sameasbillto: true,
        bpmpi_device_ipaddress: ip64,
        // No `bpmpi_device_1_*`: the ClearSale session ID is for the antifraud,
        // and the 3DS device providers are only cardinal, inauth and threatmetrix
        bpmpi_device_channel: 'Browser',
        bpmpi_transaction_mode: 'S',
        // `storefront.settings` is empty on the v3 checkout (/app/)
        bpmpi_merchant_url: settings.domain
          ? `https://${settings.domain}`
          : window.location.origin,
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
        const value = fields[className];
        if (value === undefined || value === null || value === '') return;
        const input = document.createElement('input');
        input.type = 'hidden';
        input.className = className;
        input.value = value;
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

  // ClearSale fills the session ID asynchronously: wait for it when the card
  // is sent right after this script loads (e.g. browser autofill)
  const waitSessionId = () => new Promise((resolve) => {
    const startedAt = Date.now();
    const check = () => {
      const { value } = document.getElementById('mySessionId');
      if (value || Date.now() - startedAt > 5000) {
        resolve(value);
        return;
      }
      setTimeout(check, 100);
    };
    check();
  });

  /*
   * The SOP script posts the card to Braspag unless `provider` is `cielo`,
   * and Braspag answers 500 to Cielo merchants. The server loads the Cielo
   * SOP script only for Cielo in production (`is_cielo`), so that script is
   * the signal: no new `window` variable, which also fixes stores still on
   * the onload expression of previous releases.
   */
  const getSopProvider = () => (document.querySelector(
    'script[src^="https://transaction.cieloecommerce.cielo.com.br/"]',
  ) ? 'cielo' : 'braspag');

  // A SOP access token tokenizes a single card: reused, the SOP API answers 500
  // without CORS headers. A new one only comes with a new `list_payments`,
  // which the checkout requests on reload
  const usedAccessTokens = [];
  const reloadMessage = 'Recarregue a página para tentar de novo, ou pague com Pix ou boleto.';

  const hashCard = (cardClient, fingerPrintId) => {
    const isSandbox = window._braspagIsSandbox;
    const accessToken = window._braspagAccessToken;
    if (usedAccessTokens.indexOf(accessToken) > -1) {
      const error = new Error('Braspag SOP access token already used');
      error.userMsg = ` ${reloadMessage}`;
      return Promise.reject(error);
    }
    console.log('Session ID captured:', fingerPrintId);
    injectClearSaleScript(fingerprintApp, fingerPrintId);

    // The SOP script reads the first matching input it finds: a leftover form
    // from a previous attempt would tokenize the old card while the 3DS
    // authenticates the new one
    const previousSopForm = document.getElementById('formBraspag');
    if (previousSopForm) previousSopForm.remove();

    const newForm = document.createElement('form');
    newForm.setAttribute('id', 'formBraspag');
    const sopFields = {
      'bp-sop-cardtype': 'creditCard',
      'bp-sop-cardnumber': cardClient.number,
      'bp-sop-cardexpirationdate': `${cardClient.month.toString()}/20${cardClient.year.toString()}`,
      'bp-sop-cardholdername': cardClient.name,
      'bp-sop-cardcvv': cardClient.cvc,
    };
    Object.keys(sopFields).forEach((className) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.className = className;
      input.value = sopFields[className] == null ? '' : sopFields[className];
      newForm.appendChild(input);
    });
    document.body.appendChild(newForm);

    return new Promise((resolve, reject) => {
      const options = {
        accessToken,
        onSuccess(response) {
          usedAccessTokens.push(accessToken);
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
              // Without a 3DS token the server either unlisted the card (3DS
              // required) or listed it without 3DS: just send the hash
              sendHash();
              return;
            }
            const card3ds = { ...cardClient };
            delete card3ds.cvc;
            load3ds(card3ds).then(({ status, data: out3ds }) => {
              data.status3ds = status;
              if (out3ds && typeof out3ds === 'object') {
                data.out3ds = out3ds;
              }
              // Same criteria as the server (`parse3dsResult`): refusing here
              // shows the `userMsg` toast, while a 409 on create transaction
              // is a generic payment error for the buyer
              if (is3dsRequired
                && !(status === 'authenticated' && is3dsAuthenticated(out3ds))) {
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
          // The request reached the API (`onInvalid` doesn't): token spent
          usedAccessTokens.push(accessToken);
          const error = new Error(`Braspag SOP error ${response?.Code}`);
          error.response = response;
          error.userMsg = ` ${reloadMessage}`;
          reject(error);
        },
        onInvalid(validationResults) {
          reject(validationResults);
        },
        environment: isSandbox ? 'sandbox' : 'production',
        provider: getSopProvider(),
        language: 'PT',
        enableBinQuery: false,
        enableVerifyCard: true,
        enableTokenize: false,
        cvvrequired: false,
      };
      window.bpSop_silentOrderPost(options);
    });
  };

  window._braspagCardClient = (cardClient) => waitSessionId().then((fingerPrintId) => {
    if (!fingerPrintId) {
      throw new Error('Session ID (mySessionId) not captured.');
    }
    return hashCard(cardClient, fingerPrintId);
  });
}());
