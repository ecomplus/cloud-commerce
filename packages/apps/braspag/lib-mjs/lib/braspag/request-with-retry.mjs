/**
 * Runs `request` once more after `delayMs` when Braspag answers 429 or 5xx.
 * The token requests had the retry scheduled next to an immediate reject, so
 * it never saved the promise: with a SOP token per `list_payments`, a 429
 * would unlist the credit card on that quote.
 */
const requestWithRetry = async (request, delayMs = 7000) => {
  try {
    return await request();
  } catch (err) {
    if (!(err.response?.status >= 429)) throw err;
    await new Promise((resolve) => { setTimeout(resolve, delayMs); });
    return request();
  }
};

export default requestWithRetry;
