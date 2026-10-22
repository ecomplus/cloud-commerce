/*
 * `js_client.onload_expression`, after the `window` variables set by list
 * payments. Modules API caps the expression at 3000 characters and the 3DS
 * token alone takes ~1200, so it only loads the card client
 * (`braspag-card-client.js`) from jsDelivr, pinned to this package MAJOR
 * version so card client fixes reach the stores without an app update, with
 * unpkg as fallback (same as the checkout app script).
 *
 * `_braspagHashCard` is defined right away: the checkout may ask for the card
 * hash before the card client finishes loading.
 */
(function braspagOnload() {
  if (!window._braspagCardClientLoading) {
    const loadScript = (src) => new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
    const uri = window._braspagCardClientUri;
    window._braspagCardClientLoading = loadScript(uri)
      .catch(() => loadScript(uri.replace('cdn.jsdelivr.net/npm/', 'unpkg.com/')));
    // Rejection is handled when the card is sent
    window._braspagCardClientLoading.catch(() => null);
  }
  window._braspagHashCard = (cardClient) => window._braspagCardClientLoading.then(
    () => window._braspagCardClient(cardClient),
    () => {
      const err = new Error('Braspag card client not loaded');
      err.userMsg = ' Não foi possível carregar o pagamento com cartão. '
        + 'Recarregue a página ou pague com Pix ou boleto.';
      throw err;
    },
  );
}());
