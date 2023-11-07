import type {
  ListPaymentsResponse,
  CalculateShippingResponse,
  ApplyDiscountResponse,
} from '@cloudcommerce/types';
import { reactive, computed } from 'vue';
import { formatMoney } from '@ecomplus/utils';
import loadingGlobalInfoPreset from '@@sf/scripts/modules-info-preset';
import utm from '@@sf/scripts/session-utm';
import { requestIdleCallback } from '@@sf/sf-lib';
import afetch from '../../helpers/afetch';

const emptyInfo = {
  list_payments: {},
  calculate_shipping: {},
  apply_discount: {},
};
const modulesInfo = reactive<{
  list_payments: {
    installments_option?: ListPaymentsResponse['installments_option'],
    discount_option?: ListPaymentsResponse['discount_option'],
    loyalty_points_programs?: ListPaymentsResponse['loyalty_points_programs'],
  },
  calculate_shipping: {
    free_shipping_from_value?: CalculateShippingResponse['free_shipping_from_value'],
  },
  apply_discount: {
    available_extra_discount?: ApplyDiscountResponse['available_extra_discount'],
  },
}>(emptyInfo);
loadingGlobalInfoPreset.then((modulesInfoPreset) => {
  Object.assign(modulesInfo, modulesInfoPreset);
});

if (!import.meta.env.SSR) {
  const storageKey = 'MODULES_INFO';
  const sessionJson = sessionStorage.getItem(storageKey);
  if (sessionJson) {
    try {
      const persistedValue = JSON.parse(sessionJson);
      if (persistedValue.__timestamp >= Date.now() - 1000 * 60 * 5) {
        delete persistedValue.__timestamp;
        Object.assign(modulesInfo, persistedValue);
      } else {
        sessionStorage.removeItem(storageKey);
      }
    } catch (e) {
      sessionStorage.removeItem(storageKey);
    }
  }

  const fetchInfo = () => {
    const modulesToFetch: { modName: string, reqOptions?: Record<string, any> }[] = [];
    ['list_payments', 'calculate_shipping'].forEach((modName) => {
      if (!Object.keys(modulesInfo[modName]).length) {
        modulesToFetch.push({ modName });
      }
    });
    if (Object.keys(utm).length) {
      modulesToFetch.push({
        modName: 'apply_discount',
        reqOptions: {
          method: 'post',
          body: { utm },
        },
      });
    }

    modulesToFetch.forEach(({ modName, reqOptions }) => {
      const { domain } = globalThis.$storefront.settings;
      afetch(`https://${domain}/_api/modules/${modName}`, reqOptions)
        .then(async (response) => {
          if (response.ok) {
            const modInfo = {};
            modulesInfo[modName] = modInfo;
            const { result } = await response.json();
            if (Array.isArray(result)) {
              result.forEach(({ error, response: data }) => {
                if (!error) {
                  let field: string;
                  let val: any;
                  switch (modName) {
                    case 'calculate_shipping':
                      field = 'free_shipping_from_value';
                      val = data[field];
                      if (
                        typeof val === 'number'
                        && (modInfo[field] === undefined || val < modInfo[field])
                      ) {
                        modInfo[field] = val;
                      }
                      break;

                    case 'list_payments':
                      field = 'installments_option';
                      val = data[field];
                      if (
                        val && (!modInfo[field]
                          || val.monthly_interest < modInfo[field].monthly_interest
                          || val.max_number > modInfo[field].max_number)
                      ) {
                        modInfo[field] = val;
                      }
                      field = 'discount_option';
                      val = data[field];
                      if (val && (!modInfo[field] || val.value > modInfo[field].value)) {
                        data.payment_gateways.forEach(({ discount }) => {
                          if (
                            discount && discount.apply_at !== 'freight'
                            && discount.value === val.value
                          ) {
                            modInfo[field] = {
                              apply_at: discount.apply_at,
                              ...val,
                            };
                          }
                        });
                      }
                      field = 'loyalty_points_programs';
                      val = data[field];
                      if (val) {
                        modInfo[field] = { ...modInfo[field], ...val };
                      }
                      break;

                    default:
                      field = 'available_extra_discount';
                      val = data[field];
                      if (val && (!modInfo[field] || val.value > modInfo[field].value)) {
                        modInfo[field] = val;
                      }
                  }
                }
              });
            }
            sessionStorage.setItem(storageKey, JSON.stringify({
              ...modulesInfo,
              __timestamp: Date.now(),
            }));
          }
        })
        .catch(console.error);
    });
  };
  requestIdleCallback(fetchInfo);
}

export default modulesInfo;

const freeShippingFromValue = computed(() => {
  return modulesInfo.calculate_shipping.free_shipping_from_value;
});
const installmentsOption = computed(() => {
  return modulesInfo.list_payments.installments_option;
});
const discountOption = computed(() => {
  return modulesInfo.list_payments.discount_option;
});
const loyaltyPointsPrograms = computed(() => {
  return modulesInfo.list_payments.loyalty_points_programs;
});
const availableExtraDiscount = computed(() => {
  return modulesInfo.apply_discount.available_extra_discount;
});

export {
  modulesInfo,
  freeShippingFromValue,
  installmentsOption,
  discountOption,
  loyaltyPointsPrograms,
  availableExtraDiscount,
};

const parsePhrase = <T extends keyof typeof modulesInfo>(
  phrase: string,
  modName: T,
  varName: string & keyof typeof modulesInfo[T],
  formatValue: (x: any) => string = formatMoney,
) => {
  return computed(() => {
    const searchString = `{${varName}}`;
    const index = phrase.indexOf(searchString);
    if (index > -1) {
      const fieldValue = modulesInfo[modName][varName];
      if (fieldValue) {
        const replacement = formatValue(fieldValue);
        return phrase.substring(0, index) + replacement
          + phrase.substring(index + searchString.length);
      }
      return '';
    }
    return phrase;
  });
};

export const parseShippingPhrase = (phrase: string) => {
  return parsePhrase(phrase, 'calculate_shipping', 'free_shipping_from_value');
};
