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
import { useDebounceFn, watchOnce } from '@vueuse/core';
import { price as getPrice } from '@ecomplus/utils';
import config from '@cloudcommerce/config';
import { fetchModule } from '@@sf/state/modules-info';

export type ShippedItem = Exclude<CalculateShippingParams['items'], undefined>[0];

export type ShippingService = CalculateShippingResponse['shipping_services'][0];

type CartOrProductItem = Carts['items'][0] | (Partial<Products> & {
  product_id: string & { length: 24 },
  price: number,
  quantity: number,
});

export interface Props {
  zipInput?: Ref<HTMLInputElement | null>;
  zipCode?: string;
  canSelectService?: boolean;
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
  const localZipCode = ref(props.zipCode);
  const zipCode = ref<string | null>(null);
  if (!localZipCode.value && localStorage) {
    const storedZip = localStorage.getItem(ZIP_STORAGE_KEY);
    if (storedZip) {
      localZipCode.value = storedZip;
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
      watchOnce((isFetching), (_isFetching) => {
        if (!_isFetching) fetchShippingServices();
      });
      return;
    }
    const body: CalculateShippingParams = {
      ...props.baseParams,
      to: {
        ...props.baseParams?.to,
        zip: localZipCode.value!,
      },
    };
    if (shippedItems.value.length) {
      body.items = shippedItems.value;
      body.subtotal = amountSubtotal.value;
    }
    isFetching.value = true;
    fetchModule('calculate_shipping', {
      method: 'POST',
      params: {
        skip_ids: props.skippedAppIds,
      },
      body,
    })
      .then(async (response) => {
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
  const parseShippingResult = (
    shippingResult: ModuleApiResult<'calculate_shipping'>['result'] = [],
    isRetry = false,
  ) => {
    freeFromValue.value = null;
    shippingServices.splice(0);
    if (shippingResult.length) {
      let hasSomeFailedApp = false;
      shippingResult.forEach((appResult) => {
        const { validated, error, response } = appResult;
        if (!validated || error) {
          hasSomeFailedApp = true;
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
        if (hasSomeFailedApp) {
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
    const _zipCode = localZipCode.value;
    if (countryCode === 'BR') {
      if (_zipCode?.replace(/\D/g, '').length !== 8) return;
    } else if (!_zipCode) {
      return;
    }
    zipCode.value = _zipCode;
    if (localStorage) {
      localStorage.setItem(ZIP_STORAGE_KEY, zipCode.value);
    }
    fetchShippingServices();
  };
  watch(localZipCode, submitZipCode, {
    immediate: !props.shippingResult,
  });
  watch(toRef(props, 'shippingResult'), (shippingResult) => {
    if (!shippingResult?.length) return;
    if (localZipCode.value) zipCode.value = localZipCode.value;
    parseShippingResult(shippingResult);
  }, {
    immediate: true,
  });
  const zipInput = props.zipInput?.value;
  if (zipInput) {
    zipInput.addEventListener('input', (ev) => {
      const value = (ev.target as HTMLInputElement).value;
      if (value.length) {
        if (countryCode === 'BR') {
          const fmt = value.replace(/\D/g, '').padEnd(8, '_');
          zipInput.innerHTML = fmt.substring(0, 5) + '-' + fmt.substring(5, 8);
        } else {
          zipInput.innerHTML = value.substring(0, 30);
        }
      }
      localZipCode.value = value;
    });
  }

  return {
    zipCode,
    shippedItems,
    amountSubtotal,
    submitZipCode,
    fetchShippingServices,
    freeFromValue,
    shippingServices,
    parseShippingResult,
  };
};

export default useShippingCalculator;
