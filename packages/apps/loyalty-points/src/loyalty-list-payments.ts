import type {
  AppModuleBody,
  ListPaymentsResponse,
  ListPaymentsParams,
} from '@cloudcommerce/types';
import getProgramId from './functions-lib/get-program-id';

export default (data: AppModuleBody) => {
  const { application } = data;
  const params = data.params as ListPaymentsParams;

  const appData = {
    ...application.data,
    ...application.hidden_data,
  };

  // const { storeId } = req
  // setup basic required response object
  const response: ListPaymentsResponse = {
    payment_gateways: [],
  };

  const label = params.lang === 'pt_br' || !params.lang
    ? 'Pontos de fidelidade'
    : 'Loyalty points';

  response.payment_gateways.push({
    type: 'payment',
    payment_method: {
      code: 'loyalty_points',
      name: label,
    },
    label,
  });

  if (Array.isArray(appData.programs_rules)) {
    const pointsPrograms = {};
    appData.programs_rules.forEach((programRule, index) => {
      let maxPoints = programRule.max_points;
      const ratio = programRule.ratio || 1;
      if (!maxPoints && programRule.max_amount_percentage && params.amount) {
        maxPoints = Math.round(
          ((programRule.max_amount_percentage * params.amount.total) / 100) / ratio,
        );
      }
      const programId = getProgramId(programRule, index);
      pointsPrograms[programId] = {
        name: programRule.name,
        ratio,
        max_points: maxPoints,
        min_subtotal_to_earn: programRule.min_subtotal_to_earn,
        earn_percentage: programRule.earn_percentage,
      };
    });

    if (Object.keys(pointsPrograms).length) {
      response.loyalty_points_programs = pointsPrograms;
    }
  }

  return response;
};
