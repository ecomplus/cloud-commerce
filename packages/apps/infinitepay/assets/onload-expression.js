/* eslint-disable */
(function () {
  window._infiniteHashCard = function (cardClient) {
    return new Promise((resolve, reject) => {
      const elementsForm = `
      <input type="text" data-ip="method" value="credit_card" style="display: none;>
      <input type="text" data-ip="card-cvv" value="${cardClient.cvc}" style="display: none;">
      <input type="text" data-ip="card-number" value="${cardClient.number}" style="display: none;">
      <input type="text" data-ip="card-expiration-month" value="${cardClient.month.toString()}" style="display: none;">
      <input type="text" data-ip="card-expiration-year" value="${cardClient.year.toString()}" style="display: none;">
      <input type="text" data-ip="card-holder-name" value="${cardClient.name}" style="display: none;">
      <input type="text" data-ip="card-holder-document" value="${cardClient.doc}" style="display: none;">`

      const newForm = document.createElement('form')
      newForm.setAttribute('id', 'formIP')
      newForm.innerHTML = elementsForm

      document.body.appendChild(newForm)

      const access_token = window._infiniteJwtTokenCard
      // const sandbox = window._infiniteCardSandbox
      const form = document.querySelector('#formIP')
      const ipay = new IPay({ access_token })
      // console.log('ipay ', ipay)
      ipay.listeners = {
        'result:success': function () {
          // form.submit() // sucesso, continue o pagamento
          console.log('Tokenize OK')
          const token = document.querySelector("[name='ip[token]']").value
          const sessionId = document.querySelector("[name='ip[session_id]']").value
          const card = {
            token,
            cvv: cardClient.cvc,
            card_holder_name: cardClient.name
          }
          const metadata = {
            origin: 'ecomplus',
            store_url: window.location.hostname,
            risk: {
              session_id: sessionId
            }
          }
          const json = JSON.stringify({ card, metadata })
          const data = window.btoa(json)
          resolve(data)
        },
        'result:error': function (errors) {
          console.log('error: ')
          console.log(errors) // erro da tokenização, mostra no console
          reject(errors)
        }
      }

      ipay.generate(form)
    })
  }
}())
