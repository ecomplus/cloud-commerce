// Read more: https://github.com/vuejs/core/pull/3399
import '@vue/runtime-core';
import type { FormatPercentage } from '@@sf/pages/_vue';
import type { $Storefront } from '@@sf/$storefront';

type Dictionary = Omit<typeof import('@@i18n'),
  'i19StoreApiResources' | 'i19ApiActions' | 'i19TransactionsType' | 'i19StateRegister' |
  'i19ShippingLinesStatus' | 'i19RegistryType' | 'i19PhoneType' | 'i19PaymentsHistoryStatus' |
  'i19PaymentMethodCodes' | 'i19OrderStatus' | 'i19InscriptionType' | 'i19Gender' |
  'i19FulfillmentStatusMsg' | 'i19FulfillmentStatus' | 'i19FinancialStatusMsg' | 'i19FinancialStatus' |
  'i19DiscountType' | 'i19DiscountApplyAt' | 'i19ProductCondition' | 'i19CommodityType' |
  'i19ChannelType' | 'i19CancelReason'>

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $t: Dictionary & {
      (dict: string | Record<string, string>, lang?: string): string;
    };
    $money: typeof import('@ecomplus/utils')['formatMoney'];
    $percentage: FormatPercentage;
    $settings: $Storefront['settings'];
    $apiContext: $Storefront['apiContext'];
  }

  export interface GlobalComponents {
    Fade: typeof import('@@sf/components/globals/Fade.vue')['default'];
    ALink: typeof import('@@sf/components/globals/ALink.vue')['default'];
    AImg: typeof import('@@sf/components/globals/AImg.vue')['default'];
  }
}

export {};
