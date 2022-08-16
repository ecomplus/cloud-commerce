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

    /**
     * Uncomment only the resources/methods your app may need to consume through Store API.
     */
    auth_scope: {
      'stores/me': [
        'GET'            // Read store info
      ],
      procedures: [
        'POST'           // Create procedures to receive webhooks
      ],
      products: [
        // 'GET',           // Read products with public and private fields
        // 'POST',          // Create products
        // 'PATCH',         // Edit products
        // 'PUT',           // Overwrite products
        // 'DELETE',        // Delete products
      ],
      brands: [
        // 'GET',           // List/read brands with public and private fields
        // 'POST',          // Create brands
        // 'PATCH',         // Edit brands
        // 'PUT',           // Overwrite brands
        // 'DELETE',        // Delete brands
      ],
      categories: [
        // 'GET',           // List/read categories with public and private fields
        // 'POST',          // Create categories
        // 'PATCH',         // Edit categories
        // 'PUT',           // Overwrite categories
        // 'DELETE',        // Delete categories
      ],
      customers: [
        // 'GET',           // List/read customers
        // 'POST',          // Create customers
        // 'PATCH',         // Edit customers
        // 'PUT',           // Overwrite customers
        // 'DELETE',        // Delete customers
      ],
      orders: [
        // 'GET',           // List/read orders with public and private fields
        // 'POST',          // Create orders
        // 'PATCH',         // Edit orders
        // 'PUT',           // Overwrite orders
        // 'DELETE',        // Delete orders
      ],
      carts: [
        // 'GET',           // List all carts (no auth needed to read specific cart only)
        // 'POST',          // Create carts
        // 'PATCH',         // Edit carts
        // 'PUT',           // Overwrite carts
        // 'DELETE',        // Delete carts
      ],

      /**
       * Prefer using 'fulfillments' and 'payment_history' subresources to manipulate update order status.
       */
      'orders/fulfillments': [
        // 'GET',           // List/read order fulfillment and tracking events
        // 'POST',          // Create fulfillment event with new status
        // 'DELETE',        // Delete fulfillment event
      ],
      'orders/payments_history': [
        // 'GET',           // List/read order payments history events
        // 'POST',          // Create payments history entry with new status
        // 'DELETE',        // Delete payments history entry
      ],

      /**
       * Set above 'quantity' and 'price' subresources if you don't need access for full product document.
       * Stock and price management only.
       */
      'products/quantity': [
        // 'GET',           // Read product available quantity
        // 'PUT',           // Set product stock quantity
      ],
      'products/variations/quantity': [
        // 'GET',           // Read variaton available quantity
        // 'PUT',           // Set variation stock quantity
      ],
      'products/price': [
        // 'GET',           // Read product current sale price
        // 'PUT',           // Set product sale price
      ],
      'products/variations/price': [
        // 'GET',           // Read variation current sale price
        // 'PUT',           // Set variation sale price
      ],

      /**
       * You can also set any other valid resource/subresource combination.
       * Ref.: https://developers.e-com.plus/docs/api/#/store/
       */
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
