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
        .then(async (response) => {
          try {
            const data = await response.json();
            if (data.id) {
              resolve(data.id);
            }
            throw new Error(`Error Token ${await response.text()}`);
          } catch (err) {
            // console.error(err);
            reject(err);
          }
        })
        .catch(reject);
    });
  };
}());
