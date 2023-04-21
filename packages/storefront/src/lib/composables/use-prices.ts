import type { Products, ListPaymentsResponse } from '@cloudcommerce/types';
import { computed } from 'vue';
import { price as getPrice, onPromotion as checkOnPromotion } from '@ecomplus/utils';
import modulesInfo from '@@sf/state/modules-info';

export interface Props {
  product?: Partial<Products> & { price: number, final_price?: number };
  price?: number;
  basePrice?: number;
  isAmountTotal?: boolean;
  installmentsOption?: ListPaymentsResponse['installments_option'];
  discountOption?: ListPaymentsResponse['discount_option'];
  loyaltyPointsProgram?: Exclude<ListPaymentsResponse['loyalty_points_programs'], undefined>['k'];
}

const getPriceWithDiscount = (
  price: number,
  discount: Exclude<Props['discountOption'], undefined>,
) => {
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

const usePrices = (props: Props) => {
  const _product = computed(() => {
    return props.product || {
      price: props.price || 0,
      base_price: props.basePrice,
    };
  });
  const hasVariedPrices = computed(() => {
    const { variations } = _product.value;
    if (variations) {
      const productPrice = getPrice(_product.value);
      for (let i = 0; i < variations.length; i++) {
        const price = getPrice({
          ..._product.value,
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
    const price = getPrice(_product.value);
    const discount = extraDiscount.value;
    if (discount && (!discount.min_amount || price > discount.min_amount)) {
      return getPriceWithDiscount(price, discount);
    }
    return price;
  });
  const comparePrice = computed(() => {
    if (checkOnPromotion(_product.value)) {
      return _product.value.base_price as number;
    }
    const price = getPrice(_product.value);
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
      if (!monthlyInterest.value) {
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
  const discountLabel = computed(() => {
    const { label } = discountObject.value;
    if (label) {
      if (label.includes(' ')) {
        return label;
      }
      return `via ${label}`;
    }
    return '';
  });
  const priceWithDiscount = computed(() => {
    return getPriceWithDiscount(salePrice.value, discountObject.value);
  });

  const pointsProgramObject = computed(() => {
    if (props.loyaltyPointsProgram) {
      return props.loyaltyPointsProgram;
    }
    const pointsPrograms = modulesInfo.list_payments.loyalty_points_programs;
    if (pointsPrograms) {
      const programIds = Object.keys(pointsPrograms);
      for (let i = 0; i < programIds.length; i++) {
        const program = pointsPrograms[programIds[i]];
        if (program?.earn_percentage && program.earn_percentage > 0) {
          return program;
        }
      }
    }
    return { ratio: 0 };
  });
  const pointsMinPrice = computed(() => {
    return pointsProgramObject.value.min_subtotal_to_earn || 0;
  });
  const pointsProgramName = computed(() => {
    return pointsProgramObject.value.name || '';
  });
  const earnPointsPercentage = computed(() => {
    return pointsProgramObject.value.earn_percentage || 0;
  });
  const cashbackPercentage = computed(() => {
    return earnPointsPercentage.value * pointsProgramObject.value.ratio;
  });
  const cashbackValue = computed(() => {
    return cashbackPercentage.value >= 1
      ? salePrice.value * (cashbackPercentage.value / 100) : 0;
  });

  return {
    hasVariedPrices,
    salePrice,
    comparePrice,
    installmentsObject,
    installmentsNumber,
    monthlyInterest,
    installmentValue,
    discountObject,
    discountLabel,
    priceWithDiscount,
    pointsProgramObject,
    pointsMinPrice,
    pointsProgramName,
    earnPointsPercentage,
    cashbackPercentage,
    cashbackValue,
  };
};

export default usePrices;
