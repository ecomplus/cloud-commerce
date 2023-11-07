import { watch } from 'vue';
import {
  session,
  isAuthenticated,
  customer,
} from '@@sf/state/customer-session';

// https://github.com/ecomplus/storefront/tree/master/%40ecomplus/storefront-app compat
if (!import.meta.env.SSR) {
  const { domain } = globalThis.$storefront.settings;
  const apiBaseUri = `https://ecomplus.io/v2/:${window.ECOM_STORE_ID}/`;
  // @ts-ignore
  window.ECOMCLIENT_API_STORE = apiBaseUri;
  // @ts-ignore
  window.ECOMCLIENT_API_STORE_CACHE = apiBaseUri;
  // @ts-ignore
  window.ECOMCLIENT_API_PASSPORT = apiBaseUri;
  // @ts-ignore
  window.ECOMCLIENT_API_SEARCH = `${apiBaseUri}/search/_els/`;
  // @ts-ignore
  window.ECOMCLIENT_API_MODULES = `https://${domain}/_api/modules/`;

  const onLoad = () => {
    const { ecomPassport } = window as Record<string, any>;
    watch(isAuthenticated, async () => {
      if (isAuthenticated.value) {
        ecomPassport.setSession({
          auth: {
            ...session.auth,
            id: session.auth?.customer_id,
            level: 3,
          },
          customer: customer.value,
        });
      } else if (ecomPassport.checkLogin()) {
        ecomPassport.logout();
      }
    }, {
      immediate: true,
    });
    watch(customer, (_customer) => {
      if (_customer.display_name || _customer.main_email) {
        ecomPassport.setCustomer(_customer);
      }
    }, {
      immediate: true,
    });
  };

  const appScript = document.createElement('script');
  appScript.src = 'https://cdn.jsdelivr.net/npm/@ecomplus/storefront-app@2.0.0-beta.187/dist/lib/js/app.js';
  appScript.onload = onLoad;
  document.body.appendChild(appScript);
}
