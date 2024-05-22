import type { Ref } from 'vue';
import type {
  Products,
  Carts,
  CalculateShippingParams,
  CalculateShippingResponse,
  ModuleApiResult,
} from '@cloudcommerce/types';
import {
  ref,
  computed,
  shallowReactive,
  watch,
  toRef,
} from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { price as getPrice, formatMoney } from '@ecomplus/utils';
import config from '@cloudcommerce/config';
import {
  i19days,
  i19free,
  i19freeShipping,
  i19pickUpToday,
  i19receiveToday,
  i19untilTomorrow,
  i19upTo,
  i19workingDays,
} from '@@i18n';
import { fetchModule } from '@@sf/state/modules-info';

export type ShippedItem = Exclude<CalculateShippingParams['items'], undefined>[0];

export type ShippingService = CalculateShippingResponse['shipping_services'][0];

type CartOrProductItem = Carts['items'][0]
  | (Partial<Products>
    & { price: number, quantity: number }
    & ({ product_id: string & { length: 24 } } | { _id: string & { length: 24 } })
  );

export interface Props {
  zipCode?: Ref<string>;
  canAutoSubmit?: boolean;
  // canSelectService?: boolean;
  countryCode?: string;
  shippedItems?: (ShippedItem | CartOrProductItem)[];
  shippingResult?: ModuleApiResult<'calculate_shipping'>['result'];
  baseParams?: Partial<CalculateShippingParams>;
  skippedAppIds?: number[];
  appIdsOrder?: number[];
}

const localStorage = typeof window === 'object' && window.localStorage;

export const ZIP_STORAGE_KEY = 'shipping-to-zip';

const sortApps = (results: any, order: number[]) => {
  return results.sort((a: any, b: any) => {
    if (a.app_id === b.app_id) {
      return 0;
    }
    const indexA = order.indexOf(a.app_id);
    const indexB = order.indexOf(b.app_id);
    if (indexA > -1) {
      if (indexB > -1) {
        return indexA < indexB ? -1 : 1;
      }
      return -1;
    }
    if (indexB > -1) return 1;
    return 0;
  });
};
const reduceItemBody = (itemOrProduct: Record<string, any>) => {
  if (!itemOrProduct.product_id) {
    itemOrProduct.product_id = itemOrProduct._id;
  }
  const shippedItem = {};
  const fields: (keyof ShippedItem)[] = [
    'product_id',
    'variation_id',
    'sku',
    'name',
    'quantity',
    'inventory',
    'currency_id',
    'currency_symbol',
    'price',
    'final_price',
    'dimensions',
    'weight',
  ];
  fields.forEach((field) => {
    if (itemOrProduct[field] !== undefined) {
      shippedItem[field] = itemOrProduct[field];
    }
  });
  return shippedItem as ShippedItem;
};

export const useShippingCalculator = (props: Props) => {
  const zipCode = props.zipCode || ref('');
  if (!zipCode.value && localStorage) {
    const storedZip = localStorage.getItem(ZIP_STORAGE_KEY);
    if (storedZip) {
      zipCode.value = storedZip;
    }
  }
  const countryCode = props.countryCode || config.get().countryCode;
  const _shippedItems = toRef(props, 'shippedItems');
  const shippedItems = computed(() => {
    return _shippedItems.value?.map(reduceItemBody) || [];
  });
  const amountSubtotal = computed(() => {
    return shippedItems.value.reduce((subtotal, item) => {
      return subtotal + getPrice(item) * item.quantity;
    }, 0);
  });

  const isFetching = ref(false);
  const fetchShippingServices = useDebounceFn((isRetry?: boolean) => {
    if (isFetching.value) {
      const unwatch = watch((isFetching), (_isFetching) => {
        if (!_isFetching) {
          fetchShippingServices();
          unwatch();
        }
      });
      return;
    }
    const body: CalculateShippingParams = {
      ...props.baseParams,
      to: {
        ...props.baseParams?.to,
        zip: zipCode.value,
      },
    };
    if (shippedItems.value.length) {
      body.items = shippedItems.value;
      body.subtotal = amountSubtotal.value;
    }
    isFetching.value = true;
    if (import.meta.env.DEV) {
      // eslint-disable-next-line
      return import('../../__fixtures__/calculate_shipping.json')
        .then(({ default: data }) => {
          setTimeout(() => {
            isFetching.value = false;
            // eslint-disable-next-line no-use-before-define
            parseShippingResult(data.result as any, isRetry);
          }, 1500);
        });
    }
    fetchModule('calculate_shipping', {
      method: 'POST',
      params: {
        skip_ids: props.skippedAppIds,
      },
      body,
    })
      .then(async (response) => {
        if (response.status === 501) return;
        const data = await response.json();
        // eslint-disable-next-line no-use-before-define
        parseShippingResult(data.result, isRetry);
      })
      .catch((err) => {
        if (!isRetry) {
          // eslint-disable-next-line no-use-before-define
          scheduleRetry(4000);
        }
        console.error(err);
      })
      .finally(() => {
        isFetching.value = false;
      });
  }, 100);
  let retryTimer: NodeJS.Timeout | null = null;
  const scheduleRetry = (timeout = 10000) => {
    if (retryTimer) clearTimeout(retryTimer);
    retryTimer = setTimeout(() => {
      fetchShippingServices(true);
    }, timeout);
  };

  const shippingServices = shallowReactive<(ShippingService & { app_id: number })[]>([]);
  const freeFromValue = ref<number | null>(null);
  const hasPaidOption = ref<boolean | undefined>();
  const responseErrorCodes = shallowReactive<string[]>([]);
  const isZipCodeRefused = computed(() => {
    return responseErrorCodes.includes('CALCULATE_INVALID_ZIP');
  });

  const parseShippingResult = (
    shippingResult: ModuleApiResult<'calculate_shipping'>['result'] = [],
    isRetry = false,
  ) => {
    freeFromValue.value = null;
    shippingServices.splice(0);
    if (shippingResult.length) {
      responseErrorCodes.splice(0);
      shippingResult.forEach((appResult) => {
        const { validated, error, response } = appResult;
        if (!validated || error) {
          responseErrorCodes.push(`${(response as any).error}`);
          return;
        }
        if (props.skippedAppIds?.includes(appResult.app_id)) {
          return;
        }
        response.shipping_services.forEach((service) => {
          shippingServices.push({
            app_id: appResult.app_id,
            ...service,
          });
        });
        const freeShippingFromValue = response.free_shipping_from_value;
        if (
          freeShippingFromValue
          && (!freeFromValue.value || freeFromValue.value > freeShippingFromValue)
        ) {
          freeFromValue.value = freeShippingFromValue;
        }
      });
      if (!shippingServices.length) {
        if (responseErrorCodes.length && !isZipCodeRefused.value) {
          if (!isRetry) {
            fetchShippingServices(true);
          } else {
            scheduleRetry();
          }
        }
        return;
      }
      shippingServices.sort((a, b) => {
        const lineA = a.shipping_line;
        const lineB = b.shipping_line;
        const priceDiff = lineA.total_price! - lineB.total_price!;
        if (priceDiff < 0) return -1;
        if (priceDiff > 0) return 1;
        return lineA.delivery_time?.days! < lineB.delivery_time?.days!
          ? -1 : 1;
      });
      hasPaidOption.value = Boolean(shippingServices.find((service) => {
        return service.shipping_line.total_price || service.shipping_line.price;
      }));
      const appIdsOrder = props.appIdsOrder || globalThis.ecomShippingApps || [];
      if (Array.isArray(appIdsOrder) && appIdsOrder.length) {
        sortApps(shippingServices, appIdsOrder);
      }
    }
  };

  const submitZipCode = () => {
    const _zipCode = zipCode.value;
    if (countryCode === 'BR') {
      if (_zipCode?.replace(/\D/g, '').length !== 8) return;
    } else if (!_zipCode) {
      return;
    }
    if (localStorage) {
      localStorage.setItem(ZIP_STORAGE_KEY, _zipCode);
    }
    fetchShippingServices();
  };
  watch(zipCode, (value) => {
    if (value.length) {
      if (countryCode === 'BR') {
        const fmt = value.replace(/\D/g, '');
        if (fmt.length > 5) {
          zipCode.value = fmt.substring(0, 5) + '-' + fmt.substring(5, 8);
          if (props.canAutoSubmit) submitZipCode();
        }
      } else {
        zipCode.value = value.substring(0, 30);
      }
    }
  }, {
    immediate: !props.shippingResult,
  });
  watch(toRef(props, 'shippingResult'), (shippingResult) => {
    if (!shippingResult?.length) return;
    parseShippingResult(shippingResult);
  }, {
    immediate: true,
  });

  const productionDeadline = computed(() => {
    let maxDeadline = 0;
    _shippedItems.value?.forEach((item: Partial<Products>) => {
      if (item.quantity && item.production_time) {
        const { days, cumulative } = item.production_time;
        const itemDeadline = cumulative ? days * item.quantity : days;
        if (itemDeadline > maxDeadline) {
          maxDeadline = itemDeadline;
        }
      }
    });
    return maxDeadline;
  });
  const getShippingDeadline = (shipping: ShippingService['shipping_line']) => {
    const isWorkingDays = Boolean(shipping.posting_deadline?.working_days
      || shipping.delivery_time?.working_days);
    let days = shipping.posting_deadline?.days || 0;
    if (shipping.delivery_time) {
      days += shipping.delivery_time.days;
    }
    days += productionDeadline.value;
    if (days > 1) {
      return `${i19upTo} ${days} `
        + (isWorkingDays ? i19workingDays : i19days).toLowerCase();
    }
    if (days === 1) return i19untilTomorrow;
    return shipping.pick_up ? i19pickUpToday : i19receiveToday;
  };
  const getShippingPrice = (shipping: ShippingService['shipping_line']) => {
    const freight = typeof shipping.total_price === 'number'
      ? shipping.total_price
      : shipping.price;
    if (freight) return formatMoney(freight);
    return shipping.pick_up ? i19free : i19freeShipping;
  };

  return {
    zipCode,
    shippedItems,
    amountSubtotal,
    submitZipCode,
    fetchShippingServices,
    isFetching,
    freeFromValue,
    shippingServices,
    isZipCodeRefused,
    parseShippingResult,
    productionDeadline,
    getShippingDeadline,
    getShippingPrice,
  };
};

export default useShippingCalculator;
