import type { GalaxpayApp } from '../../../types/config-app';
import type { ListPaymentsParams } from '@cloudcommerce/types';

type Plan = Exclude<GalaxpayApp['plans'], undefined>[number]
type Amount = Exclude<ListPaymentsParams['amount'], undefined>

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
  planName: string,
  plan: Plan,
  amount: Omit<Amount, 'total'> & { total?: number },
) => {
  let planDiscount: Plan['discount'];
  if (plan.discount_first_installment && !plan.discount_first_installment?.disable) {
    planDiscount = plan.discount_first_installment;
  } else {
    planDiscount = plan.discount;
  }

  if (planDiscount && planDiscount.value > 0) {
    // default discount option
    const type = planDiscount.type;

    const applyAt: string = planDiscount.apply_at === 'frete' ? 'freight' : planDiscount.apply_at;

    const discountOption = {
      label: planName,
      value: planDiscount.value as number | undefined,
      type,
    };

    if (amount.total) {
      // check amount value to apply discount
      if (planDiscount.min_amount && amount.total < planDiscount.min_amount) {
        planDiscount.value = 0;
      } else {
        delete planDiscount.min_amount;

        const maxDiscount = amount[applyAt || 'subtotal'];
        let discountValue: number | undefined;

        if (maxDiscount && discountOption.type === 'percentage') {
          discountValue = (maxDiscount * planDiscount.value) / 100;
        } else {
          discountValue = planDiscount.value;
          if (maxDiscount) {
            discountValue = (discountValue && discountValue > maxDiscount)
              ? maxDiscount : discountValue;
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
    const discount = planDiscount as Omit<Plan['discount'], 'apply_at'>
      & { apply_at: 'total' | 'subtotal' | 'freight' };

    return { amount, discountOption, discount };
  }
  return null;
};

export {
  handleGateway,
  findPlanToCreateTransction,
  discountPlan,
};
