import type { Orders } from '@cloudcommerce/api/types';
import type {
  PurchaseExtraParams,
  PurchaseParamsToHash,
} from '@@sf/state/use-analytics';
import { watch } from 'vue';
import { useThrottleFn } from '@vueuse/core';
import mitt from 'mitt';
import { phone as getPhone } from '@ecomplus/utils';
import {
  getAuth,
  sendSignInLinkToEmail,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from 'firebase/auth';
import { modulesInfo, modulesInfoEvents } from '@@sf/state/modules-info';
import {
  session,
  isAuthenticated,
  customer,
  customerName,
  logout,
  initializeFirebaseAuth,
  isAuthReady,
} from '@@sf/state/customer-session';
import { shoppingCart } from '@@sf/state/shopping-cart';
import { emitGtagEvent, getGtagItem } from '@@sf/state/use-analytics';
import utm from '@@sf/scripts/session-utm';

const watchAppRoutes = () => {
  const router = (window as any).storefrontApp?.router;
  if (router) {
    const getCouponApplied = () => {
      return sessionStorage.getItem('st_discount_coupon') || undefined;
    };
    const fixMoneyValue = (value: number) => {
      return Math.round(value * 100) / 100;
    };

    const emittedCheckoutSteps: Array<
      'view_cart' | 'begin_checkout' |
      'add_payment_info' | 'add_shipping_info'
    > = [];
    const emitCheckout = (
      evName: typeof emittedCheckoutSteps[0],
      params?: Gtag.EventParams,
    ) => {
      if (emittedCheckoutSteps.includes(evName)) return;
      emittedCheckoutSteps.push(evName);
      if (!params) {
        params = {
          value: fixMoneyValue(shoppingCart.subtotal || 0),
          items: shoppingCart.items.map(getGtagItem),
        };
      }
      if (evName !== 'view_cart') {
        params.coupon = getCouponApplied();
        if (!emittedCheckoutSteps.includes('begin_checkout')) {
          emitCheckout('begin_checkout');
        }
      }
      emitGtagEvent(evName, params);
    };

    let isPurchaseSent = false;
    const emitPurchase = (orderId: string, orderJson?: string) => {
      if (!isPurchaseSent) {
        if (localStorage.getItem('gtag.orderIdSent') !== orderId) {
          let order: Orders | undefined;
          if (orderJson) {
            try {
              order = JSON.parse(orderJson);
            } catch {
              //
            }
          }
          const { amount } = (order || (window as any).storefrontApp) as {
            amount?: Orders['amount'],
          };
          const params: Gtag.EventParams & PurchaseExtraParams = {
            transaction_id: orderId,
            value: fixMoneyValue(amount?.total || shoppingCart.subtotal || 0),
            items: shoppingCart.items.map(getGtagItem),
            coupon: order
              ? order.extra_discount?.discount_coupon
              : getCouponApplied(),
          };
          if (amount) {
            if (amount.freight !== undefined) {
              params.shipping = fixMoneyValue(amount.freight);
            }
            if (amount.tax !== undefined) {
              params.tax = fixMoneyValue(amount.tax);
            }
          }
          const paramsToHash: PurchaseParamsToHash = {};
          let buyer = order?.buyers?.[0] || customer.value;
          if (!buyer?.main_email) {
            try {
              let _customer = (window as any).ecomPassport?.getCustomer();
              if (!_customer?.main_email) {
                _customer = (window as any).storefrontApp?.customer;
              }
              if (_customer?.main_email) {
                if (!buyer) buyer = {};
                Object.assign(buyer, _customer);
              }
            } catch (err) {
              console.error(err);
            }
          }
          if (buyer) {
            params.buyer_id = buyer._id;
            paramsToHash.buyer_display_name = buyer.display_name || customerName.value;
            paramsToHash.buyer_given_name = buyer.name?.given_name;
            paramsToHash.buyer_family_name = buyer.name?.family_name;
            paramsToHash.buyer_email = buyer.main_email;
            paramsToHash.buyer_phone = getPhone(buyer);
            if (
              paramsToHash.buyer_phone
              && paramsToHash.buyer_phone.charAt(0) !== '+'
            ) {
              paramsToHash.buyer_phone = `+55${paramsToHash.buyer_phone}`;
            }
          }
          const shippingLine = order?.shipping_lines?.[0];
          const shippingAddr = shippingLine?.to;
          if (shippingAddr) {
            params.shipping_addr_province_code = shippingAddr.province_code;
            params.shipping_addr_country_code = shippingAddr.country_code;
            paramsToHash.shipping_addr_zip = shippingAddr.zip;
            paramsToHash.shipping_addr_city = shippingAddr.city;
          }
          if (shippingLine && shippingLine.delivery_time) {
            let { days } = shippingLine.delivery_time;
            if (shippingLine.posting_deadline) days += shippingLine.delivery_time.days;
            if (shippingLine.delivery_time.working_days) days *= 1.25;
            params.shipping_delivery_days = days;
          }
          emitGtagEvent('purchase', params, paramsToHash);
          localStorage.setItem('gtag.orderIdSent', orderId);
        }
        isPurchaseSent = true;
      }
      shoppingCart.items.splice(0);
    };

    let emitPurchaseTimer: NodeJS.Timeout | undefined;
    const parseRouteToGtag = ({ name, params }) => {
      switch (name) {
        case 'cart':
          emitCheckout('view_cart');
          break;
        case 'checkout':
          if (!params.step) {
            emitCheckout('begin_checkout');
          } else if (Number(params.step) === 1) {
            emitCheckout('add_shipping_info');
          } else if (Number(params.step) === 2) {
            emitCheckout('add_payment_info');
          }
          break;
        case 'confirmation':
          clearTimeout(emitPurchaseTimer);
          if (params.json) {
            emitPurchase(params.id, decodeURIComponent(params.json));
          } else {
            emitPurchaseTimer = setTimeout(() => {
              emitPurchase(params.id);
            }, 1500);
          }
          break;
        default:
      }
    };
    if (router.currentRoute) {
      parseRouteToGtag(router.currentRoute);
    }
    router.afterEach(parseRouteToGtag);
  }
};

// https://github.com/ecomplus/storefront/tree/master/%40ecomplus/storefront-app compat
if (!import.meta.env.SSR) {
  const { location, ECOM_STORE_ID } = window;
  if (Object.keys(utm).length) {
    sessionStorage.setItem('ecomUtm', JSON.stringify(utm));
  }
  let querystring = location.search;
  if (!querystring && location.hash) {
    querystring = '?' + location.hash.split('?')[1];
  }
  const searchParams = new URLSearchParams(querystring);
  if (searchParams.get('product_id') && searchParams.get('quantity') === '1') {
    localStorage.setItem('ecomShoppingCart__tmp', JSON.stringify({
      items: [{
        product_id: searchParams.get('product_id'),
        variation_id: searchParams.get('variation_id') || undefined,
        quantity: 1,
      }],
    }));
    (window as any).ECOM_CART_STORAGE_KEY = 'ecomShoppingCart__tmp';
  }
  const { domain } = globalThis.$storefront.settings;
  const isLocalhost = ['localhost', '127.0.0.1'].includes(location.hostname);
  const hostApiBaseUri = isLocalhost
    && Number(location.port) !== 5000 // Hosting on Firebase Emulators
    ? `https://${domain}/_api/` : '/_api/';
  const apiBaseUri = 'https://ecomplus.io/v2/';
  (window as any).ECOMCLIENT_API_STORE = apiBaseUri;
  (window as any).ECOMCLIENT_API_STORE_CACHE = `${apiBaseUri}:${ECOM_STORE_ID}/`;
  (window as any).ECOMCLIENT_API_PASSPORT = `${apiBaseUri}:`;
  (window as any).ECOMCLIENT_API_PASSPORT_IDENTITY = `${hostApiBaseUri}passport/`;
  (window as any).ECOMCLIENT_API_SEARCH = `${apiBaseUri}search/_els/`;
  (window as any).ECOMCLIENT_API_MODULES = `${hostApiBaseUri}modules/`;

  const onAppLoad = () => {
    const { ecomPassport } = window as Record<string, any>;
    watch(isAuthenticated, async () => {
      if (isAuthenticated.value) {
        ecomPassport.setSession({
          auth: {
            token: session.auth,
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
    setTimeout(() => {
      watchAppRoutes();
      ecomPassport.on('logout', () => {
        if (isAuthenticated.value) {
          logout();
          watch(isAuthenticated, () => {
            window.location.href = '/';
          }, { once: true });
        }
      });
    }, 400);
  };
  const loadAppScript = () => {
    const appScript = document.createElement('script');
    appScript.src = (window as any)._appScriptSrc
      || 'https://cdn.jsdelivr.net/npm/@ecomplus/storefront-app@2.0.0-beta.212/dist/lib/js/app.js';
    appScript.onload = onAppLoad;
    document.body.appendChild(appScript);
  };

  // Handle @ecomplus/storefront-components/src/js/helpers/wait-storefront-info.js
  const storefrontEmitter = mitt();
  modulesInfoEvents.on('*', (modName) => {
    if (!modulesInfo[modName]) return;
    (window as any).storefront.info[modName] = modulesInfo[modName];
    storefrontEmitter.emit(`info:${(modName as string)}`);
  });
  (window as any).storefront = {
    info: {},
    on: storefrontEmitter.on,
    off: storefrontEmitter.off,
  };

  const initializingAuth = new Promise<ReturnType<typeof getAuth>>((resolve) => {
    initializeFirebaseAuth();
    const unwatch = watch(isAuthReady, (_isAuthReady) => {
      if (!_isAuthReady) return;
      unwatch();
      resolve(getAuth());
    });
  });
  if (window.location.hash.includes('account')) {
    initializingAuth.finally(loadAppScript);
  } else {
    loadAppScript();
  }
  if (window.OAUTH_PROVIDERS?.includes('google')) {
    (window as any).signInWithGoogle = () => {
      initializingAuth.then((firebaseAuth) => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(firebaseAuth, provider).catch(console.error);
      });
    };
  }
  if (window.OAUTH_PROVIDERS?.includes('facebook')) {
    (window as any).signInWithFacebook = () => {
      initializingAuth.then((firebaseAuth) => {
        const provider = new FacebookAuthProvider();
        signInWithPopup(firebaseAuth, provider).catch(console.error);
      });
    };
  }
  (window as any).signInWithEmailLink = useThrottleFn((email: string) => {
    initializingAuth.then((firebaseAuth) => {
      const url = new URL(`${window.location.origin}/app/account#/checkout`);
      url.searchParams.append('email', email);
      sendSignInLinkToEmail(firebaseAuth, email, {
        url: url.toString(),
        handleCodeInApp: true,
      })
        .catch(console.error);
    });
  }, 2000);
}
