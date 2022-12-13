(function () {
  window._galaxyHashcard = function (card) {
    return new Promise((resolve, reject) => {
      // https://docs.galaxpay.com.br/tokenizacao-cartao-js
      const token = window._galaxPayPublicToken;

      // !window._galaxPaySandbox // false = sandbox, true = production
      const environment = window._galaxPaySandbox || false;
      const galaxPay = new GalaxPay(token, environment);
      const galaxpayCard = galaxPay.newCard({
        number: card.number,
        holder: card.name,
        expiresAt: `20${card.year.toString()}-${card.month.toString()}`,
        cvv: card.cvc,
      });
      galaxPay.hashCreditCard(galaxpayCard, (hash) => {
        resolve(hash);
      }, (error) => {
        reject(error);
      });
    });
  };
}());
