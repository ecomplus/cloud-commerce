import type {
  AppModuleBody,
  ListPaymentsParams,
  ListPaymentsResponse,
} from '@cloudcommerce/types';

type Gateway = ListPaymentsResponse['payment_gateways'][number]

export default (data: AppModuleBody) => {
  const { application } = data;
  const params = data.params as ListPaymentsParams;
  // https://apx-mods.e-com.plus/api/v1/list_payments/schema.json?store_id=100
  const amount = params.amount || { total: undefined, discount: undefined };
  // const initialTotalAmount = amount.total;

  const config = {
    ...application.data,
    ...application.hidden_data,
  };

  // start mounting response body
  // https://apx-mods.e-com.plus/api/v1/list_payments/response_schema.json?store_id=100
  const response: ListPaymentsResponse = {
    payment_gateways: [],
  };

  if (config.payment_options && config.payment_options.length) {
    config.payment_options.forEach((paymentOption) => {
      if (paymentOption.zip_range) {
        // payment option for specific addresses only
        const { customer } = params;
        if (customer && customer.addresses) {
          const address = customer.addresses.find((addr) => addr.default) || customer.addresses[0];
          const zip = address && address.zip;
          if (zip && (paymentOption.zip_range.min > zip || paymentOption.zip_range.max < zip)) {
            // zip code condition not satisfied
            return;
          }
        }
      }

      const {
        label, icon, text, discount, enabled,
      } = paymentOption;
      if (enabled !== false) {
        const paymentMethod = paymentOption.payment_method;
        if (!paymentMethod || !paymentMethod.code) {
          return;
        }
        if (paymentOption.min_amount
          && (amount.total && amount.total < paymentOption.min_amount)) {
          return;
        }

        let paymentMethodName = paymentMethod.name || paymentMethod.code;
        if (response.payment_gateways.find((gateway) => {
          return gateway.payment_method && gateway.payment_method.name === paymentMethodName;
        })) {
          paymentMethodName += ` ::${Math.floor(Math.random() * 1000)}`;
        }

        const paymentGateway: Gateway = {
          label,
          icon,
          text,
          payment_method: {
            code: paymentMethod.code,
            name: paymentMethodName,
          },
          type: 'payment',
        };

        if (!amount.discount || paymentOption.cumulative_discount !== false) {
          paymentGateway.discount = discount;
          if (discount && discount.value > 0) {
            // calculate discount value
            if (
              discount.apply_at !== 'freight'
              && (!response.discount_option || (response.discount_option.value
                && response.discount_option.value <= discount.value))) {
              // default discount option
              response.discount_option = {
                label,
                ...discount,
              };
            }
          }
        }

        response.payment_gateways.push(paymentGateway);
      }
    });
  }

  return response;
};
