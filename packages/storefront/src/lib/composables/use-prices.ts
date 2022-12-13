import type { Products, Carts, ListPaymentsResponse } from '@cloudcommerce/types';
import { computed } from 'vue';
import { price as getPrice, onPromotion as checkOnPromotion } from '@ecomplus/utils';
import modulesInfo from '@@sf/state/modules-info';

export interface Props {
  product?: Partial<Carts['items'][0]> & Partial<Products> & { price: Products['price'] };
  price?: number;
  basePrice?: number;
  isAmountTotal?: boolean,
  installmentsOption?: ListPaymentsResponse['installments_option'];
  discountOption?: ListPaymentsResponse['discount_option'];
}

const getPriceWithDiscount = (price: number, discount: Props['discountOption']) => {
  const { type, value } = discount;
  let priceWithDiscount: number;
  if (value) {
    if (type === 'percentage') {
      priceWithDiscount = price * ((100 - value) / 100);
    } else {
      priceWithDiscount = price - value;
    }
    return priceWithDiscount > 0 ? priceWithDiscount : 0;
  }
  return price;
};

export default (props: Props) => {
  const hasVariedPrices = computed(() => {
    const { variations } = props.product;
    if (variations) {
      const productPrice = getPrice(props.product);
      for (let i = 0; i < variations.length; i++) {
        const price = getPrice({
          ...props.product,
          ...variations[i],
        });
        if (price > productPrice) {
          return true;
        }
      }
    }
    return false;
  });
  const extraDiscount = computed(() => {
    return modulesInfo.apply_discount.available_extra_discount;
  });
  const salePrice = computed(() => {
    const price = props.price || getPrice(props.product);
    const discount = extraDiscount.value;
    if (discount && (!discount.min_amount || price > discount.min_amount)) {
      return getPriceWithDiscount(price, discount);
    }
    return price;
  });
  const comparePrice = computed(() => {
    if (props.basePrice) {
      return props.basePrice;
    }
    if (checkOnPromotion(props.product)) {
      return props.product.base_price as number;
    }
    const price = props.price || getPrice(props.product);
    if (price > salePrice.value) {
      return price;
    }
    return 0;
  });

  const installmentsObject = computed(() => {
    return props.installmentsOption
      || modulesInfo.list_payments.installments_option
      || { max_number: 1 };
  });
  const installmentsNumber = computed(() => {
    if (installmentsObject.value.max_number <= 1) {
      return 1;
    }
    const minInstallment = installmentsObject.value.min_installment || 5;
    const maxInstallmentsNumber = Math.round(salePrice.value / minInstallment);
    return Math.min(maxInstallmentsNumber, installmentsObject.value.max_number);
  });
  const monthlyInterest = computed(() => {
    return installmentsObject.value.monthly_interest || 0;
  });
  const installmentValue = computed(() => {
    if (installmentsNumber.value >= 2) {
      if (monthlyInterest.value) {
        return salePrice.value / installmentsNumber.value;
      }
      const interest = monthlyInterest.value / 100;
      return (salePrice.value * interest)
        / (1 - ((1 + interest) ** -installmentsNumber.value));
    }
    return 0;
  });

  const discountObject = computed(() => {
    const discount = props.discountOption || modulesInfo.list_payments.discount_option;
    if (
      discount
      && (!discount.min_amount || discount.min_amount <= salePrice.value)
      && (!props.isAmountTotal || discount.apply_at === 'total')
    ) {
      return discount;
    }
    return {};
  });
  const priceWithDiscount = computed(() => {
    return getPriceWithDiscount(salePrice.value, discountObject.value);
  });

  return {
    hasVariedPrices,
    salePrice,
    comparePrice,
    installmentsObject,
    installmentsNumber,
    installmentValue,
    discountObject,
    priceWithDiscount,
  };
};
