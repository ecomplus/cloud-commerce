/* eslint-disable no-console */
(function pagarmeOnload() {
  const apiKey = window._pagarmeKey;
  window._pagarmeHash = function pagarmeHash(cardClient) {
    return new Promise((resolve, reject) => {
      const card = {
        number: cardClient.number,
        holder_name: cardClient.name,
        exp_month: cardClient.month,
        exp_year: cardClient.year,
        cvv: cardClient.cvc,
      };
      fetch(
        `https://api.pagar.me/core/v5/tokens?appId=${apiKey}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            type: 'card',
            card,
          }),
        },
      )
        .then((resp) => {
          return resp.json().catch(() => {
            return resp.text();
          });
        })
        .then((data) => {
          if (data && data.id) {
            resolve(data.id);
            return null;
          }
          console.log(data);
          throw new Error('Credencial inválida');
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  };
}());
