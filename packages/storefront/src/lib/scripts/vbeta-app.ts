import type { Orders, Customers } from '@cloudcommerce/api/types';
import { watch } from 'vue';
import { phone as getPhone } from '@ecomplus/utils';
import {
  session,
  isAuthenticated,
  customer,
  customerName,
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
          value: fixMoneyValue(shoppingCart.value.subtotal),
          items: shoppingCart.value.items.map(getGtagItem),
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
          const params: Gtag.EventParams = {
            transaction_id: orderId,
            value: fixMoneyValue(amount?.total || shoppingCart.value.subtotal),
            items: shoppingCart.value.items.map(getGtagItem),
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
          let purchaseTimeout = 1;
          const { dataLayer, __sendGTMExtraPurchaseData } = (window as any);
          if (dataLayer && __sendGTMExtraPurchaseData) {
            const extraPurchaseData: Record<string, any> = {};
            let shippingAddr: Exclude<Customers['addresses'], undefined>[0] | undefined;
            if (customer) {
              extraPurchaseData.customerDisplayName = customerName.value;
              let customerFullName = customer.value.name;
              if (!customerFullName?.given_name) {
                try {
                  const storedCustomer = sessionStorage.getItem('ecomCustomerAccount');
                  if (storedCustomer) {
                    const sessionCustomer = JSON.parse(storedCustomer);
                    if (typeof sessionCustomer === 'object' && sessionCustomer) {
                      customerFullName = sessionCustomer.name;
                    }
                  }
                } catch {
                  //
                }
              }
              if (customerFullName) {
                extraPurchaseData.customerGivenName = customerFullName.given_name;
                extraPurchaseData.customerFamilyName = customerFullName.family_name;
              }
              extraPurchaseData.customerEmail = customer.value.main_email;
              extraPurchaseData.customerPhone = getPhone(customer.value);
              shippingAddr = customer.value.addresses?.[0];
            }
            try {
              const storedAddr = sessionStorage.getItem('ecomCustomerAddress');
              if (storedAddr) {
                const sessionShippingAddr = JSON.parse(storedAddr);
                if (typeof shippingAddr === 'object' && shippingAddr) {
                  Object.assign(shippingAddr, sessionShippingAddr);
                } else {
                  shippingAddr = sessionShippingAddr;
                }
              }
            } catch {
              //
            }
            if (shippingAddr && shippingAddr.zip) {
              extraPurchaseData.shippingAddrZip = shippingAddr.zip;
              extraPurchaseData.shippingAddrStreet = shippingAddr.street;
              extraPurchaseData.shippingAddrNumber = shippingAddr.number;
              if (shippingAddr.street && shippingAddr.number) {
                extraPurchaseData.shippingAddrStreet += `, ${shippingAddr.number}`;
              }
              extraPurchaseData.shippingAddrCity = shippingAddr.city;
              extraPurchaseData.shippingAddrProvinceCode = shippingAddr.province_code;
            }
            dataLayer.push({
              event: 'purchaseExtraData',
              ...extraPurchaseData,
            });
            purchaseTimeout = 100;
          }
          setTimeout(() => emitGtagEvent('purchase', params), purchaseTimeout);
          localStorage.setItem('gtag.orderIdSent', orderId);
        }
        isPurchaseSent = true;
      }
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
  if (Object.keys(utm).length) {
    sessionStorage.setItem('ecomUtm', JSON.stringify(utm));
  }
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
    setTimeout(watchAppRoutes, 400);
  };

  const appScript = document.createElement('script');
  appScript.src = 'https://cdn.jsdelivr.net/npm/@ecomplus/storefront-app@2.0.0-beta.188/dist/lib/js/app.js';
  appScript.onload = onLoad;
  document.body.appendChild(appScript);
}
