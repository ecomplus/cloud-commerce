/**
 * Runs `request` once more after `delayMs` when Braspag answers 429.
 * The token requests had the retry scheduled next to an immediate reject, so
 * it never saved the promise: with a SOP token per `list_payments`, a 429
 * would unlist the credit card on that quote.
 * Other errors are not retried: `list_payments` awaits these tokens, and Pix
 * and boleto would wait along with the card while Braspag is down.
 */
export const TOKEN_TIMEOUT = 4000;

const requestWithRetry = async (request, delayMs = 2000) => {
  try {
    return await request();
  } catch (err) {
    if (err.response?.status !== 429) throw err;
    await new Promise((resolve) => { setTimeout(resolve, delayMs); });
    return request();
  }
};

export default requestWithRetry;
