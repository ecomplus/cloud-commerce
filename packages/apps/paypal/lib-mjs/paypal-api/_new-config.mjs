const { DEFAULT_PAYPAL_ENV, PAYPAL_PARTNER_ID } = process.env;

export default (env, clientId, clientSecret, paypalPlus = false) => {
  // configuration for PayPal REST API client v1
  const paypalConfig = {
    mode: env || DEFAULT_PAYPAL_ENV,
    client_id: clientId,
    client_secret: clientSecret,
  };
  if (PAYPAL_PARTNER_ID) {
    paypalConfig.headers = {
      'PayPal-Partner-Attribution-Id': paypalPlus
        ? PAYPAL_PARTNER_ID.replace('_EC', '_PPPlus')
        : PAYPAL_PARTNER_ID,
    };
  }
  return paypalConfig;
};
