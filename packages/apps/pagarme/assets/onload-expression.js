(function () {
  window._pagarmeHash = function (card) {
    return new Promise((resolve, reject) => {
      // https://github.com/pagarme/pagarme-js#using-encryption-key
      window.pagarme.client.connect({ encryption_key: window._pagarmeKey })
        .then((client) => {
          return client.security.encrypt({
            card_number: card.number,
            card_holder_name: card.name,
            card_expiration_date: card.month.toString() + card.year.toString(),
            card_cvv: card.cvc,
          });
        })
        .then(resolve)
        .catch(reject);
    });
  };
}());
