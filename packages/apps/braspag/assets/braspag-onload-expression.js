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
            const data = JSON.stringify({ token: response.PaymentToken, fingerPrintId });
            resolve(window.btoa(data));
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
