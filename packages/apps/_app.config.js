/* eslint-disable comma-dangle, no-multi-spaces, key-spacing, max-len */

/**
 * Edit base E-Com Plus Application object here.
 * Ref.: https://developers.e-com.plus/docs/api/#/store/applications/
 */

export default () => {
  return {
    app_id: 9000,
    title: 'My Awesome E-Com Plus App',
    slug: 'my-awesome-app',
    type: 'external',
    state: 'active',

    /**
     * Uncomment modules above to work with E-Com Plus Mods API on Storefront.
     * Ref.: https://developers.e-com.plus/modules-api/
     */
    modules: {
      /**
       * Triggered to calculate shipping options, must return values and deadlines.
       * Start editing `routes/ecom/modules/calculate-shipping.js`
       */
      // calculate_shipping:   { enabled: true },

      /**
       * Triggered to validate and apply discount value, must return discount and conditions.
       * Start editing `routes/ecom/modules/apply-discount.js`
       */
      // apply_discount:       { enabled: true },

      /**
       * Triggered when listing payments, must return available payment methods.
       * Start editing `routes/ecom/modules/list-payments.js`
       */
      // list_payments:        { enabled: true },

      /**
       * Triggered when order is being closed, must create payment transaction and return info.
       * Start editing `routes/ecom/modules/create-transaction.js`
       */
      // create_transaction:   { enabled: true },
    },

    admin_settings: {
      /**
       * JSON schema based fields to be configured by merchant and saved to app `data` / `hidden_data`, such as:

       webhook_uri: {
         schema: {
           type: 'string',
           maxLength: 255,
           format: 'uri',
           title: 'Notifications URI',
           description: 'Unique notifications URI available on your Custom App dashboard'
         },
         hide: true
       },
       token: {
         schema: {
           type: 'string',
           maxLength: 50,
           title: 'App token'
         },
         hide: true
       },
       opt_in: {
         schema: {
           type: 'boolean',
           default: false,
           title: 'Some config option'
         },
         hide: false
       },

       */
    },
  };
};
