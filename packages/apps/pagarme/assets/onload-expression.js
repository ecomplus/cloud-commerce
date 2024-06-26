/* eslint-disable no-console */
(function pagarmeOnload() {
  window._pagarmeHash = function pagarmeHash(card) {
    return new Promise((resolve, reject) => {
      // https://github.com/pagarme/pagarme-js#using-encryption-key
      const usedCard = {
        card: {
          card_number: card.number,
          card_holder_name: card.name,
          card_expiration_date: card.month.toString() + card.year.toString(),
          card_cvv: card.cvc,
        },
      };
      let userMsg = '';
      try {
        const validateObject = window.pagarme.validate(usedCard);
        const objectCardValidated = validateObject && validateObject.card;
        // eslint-disable-next-line
        for (const key in objectCardValidated) {
          if (Object.hasOwnProperty.call(objectCardValidated, key)) {
            if (!objectCardValidated[key]) {
              userMsg = `Campo "${key}" não pôde ser validado.`;
              break;
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
      window.pagarme.client.connect({ encryption_key: window._pagarmeKey })
        .then((client) => {
          return client.security.encrypt(usedCard.card);
        })
        .then(resolve)
        .catch((err) => {
          err.userMsg = userMsg;
          reject(err);
        });
    });
  };
}());
