import type { GalaxpayApp } from '../../../types/config-app';
// import type { ListPaymentsResponse } from '@cloudcommerce/types/modules/list_payments:response';
import type { ListPaymentsParams } from '@cloudcommerce/types/modules/list_payments:params';

// type Gateway = ListPaymentsResponse['payment_gateways'][number]

const handleGateway = (appData: GalaxpayApp) => {
  const plans: Exclude<GalaxpayApp['plans'], undefined> = [];
  if (appData.plans) {
    // Newer versions of the app will have a list of plans
    appData.plans.forEach((plan) => {
      plans.push(plan);
    });
  }

  return plans;
};

// for create-transaction
const findPlanToCreateTransction = (label: string | undefined, appData: GalaxpayApp) => {
  let sendPlan: Exclude<GalaxpayApp['plans'], undefined>[number] | undefined;
  if (appData.plans) {
    /*
    More recent versions of the application will have a list of plans,
    where it will be necessary to find the plan by name,
    and return it since it will be necessary to use the periodicity and quantity property
    */

    // find plan by name (label)
    appData.plans.forEach((plan) => {
      // if the name of the plan is blank, on the list-payments side it is set to 'Plano'
      let planLabel = plan.label || 'Plano';
      planLabel = `${planLabel} ${plan.periodicity}`;
      label = label?.trim();
      if (label === planLabel) {
        sendPlan = plan;
      }
    });
  }
  return sendPlan;
};

const discountPlan = (
  planDiscount: Exclude<GalaxpayApp['plans'], undefined>[number]['discount'],
  amount: Exclude<ListPaymentsParams['amount'], undefined>,
) => {
  if (planDiscount && planDiscount.value > 0) {
    // default discount option
    const discountOption = {
      value: planDiscount.value,
      apply_at: (planDiscount.apply_at === 'frete' ? 'freight' : planDiscount) as 'total' | 'subtotal' | 'freight',
      type: planDiscount.percentage ? 'percentage' : 'fixed' as 'percentage' | 'fixed' | undefined,
    };

    if (amount.total) {
      // check amount value to apply discount
      if (planDiscount.min_amount && amount.total < planDiscount.min_amount) {
        planDiscount.value = 0;
      } else {
        delete planDiscount.min_amount;

        const maxDiscount = amount[discountOption.apply_at || 'subtotal'];
        let discountValue: number | undefined;

        if (maxDiscount && discountOption.type === 'percentage') {
          discountValue = (maxDiscount * planDiscount.value) / 100;
        } else {
          discountValue = planDiscount.value;
          if (maxDiscount && discountValue > maxDiscount) {
            discountValue = maxDiscount;
          }
        }

        if (discountValue && discountValue > 0) {
          amount.discount = (amount.discount || 0) + discountValue;
          amount.total -= discountValue;
          if (amount.total < 0) {
            amount.total = 0;
          }
        }
      }
    }
    return discountOption;
  }
  return null;
};

export {
  handleGateway,
  findPlanToCreateTransction,
  discountPlan,
};
