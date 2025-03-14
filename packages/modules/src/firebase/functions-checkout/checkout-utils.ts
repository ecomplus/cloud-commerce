import type { Response } from 'firebase-functions/v1';
import type {
  Applications,
  OrderSet,
  CalculateShippingResponse,
} from '@cloudcommerce/types';
import type {
  CheckoutBodyWithItems,
  Payment,
  PaymentGateways,
  PaymentMethod,
  Amount,
  Item,
} from '../../types/index';
import { logger } from '@cloudcommerce/firebase/lib/config';

type ModuleResult<R> = Array<{
  _id: Applications['_id'],
  app_id: Applications['app_id'],
  version: Applications['version'],
  took: number,
  validated: boolean,
  response_errors: null | Record<string, any>,
  error: boolean,
  error_message: null | string,
  response: R,
}>;

const sendError = (
  res: Response,
  status: number,
  errorCode: string | number,
  message: string,
  userMessage?: { [key: string]: string },
  moreInfo?: string,
) => {
  logger.warn(`Checkout interrupted with code ${errorCode}`, { resMsg: message });
  return res.status(status)
    .send({
      status,
      error_code: errorCode,
      message,
      user_message: userMessage,
      more_info: moreInfo,
    });
};

const fixAmount = (
  amount: Amount,
  checkoutBody: CheckoutBodyWithItems,
  orderBody: OrderSet,
) => {
  Object.keys(amount).forEach((field) => {
    if (amount[field] > 0 && field !== 'total') {
      amount[field] = Math.round(amount[field] * 100) / 100;
    }
  });
  const {
    subtotal = 0,
    freight = 0,
    extra = 0,
    discount = 0,
  } = amount;
  amount.total = Math.round((subtotal + freight + extra - discount) * 100) / 100;
  if (amount.total < 0) {
    amount.total = 0;
  }
  checkoutBody.amount = amount;
  orderBody.amount = amount;
};

const getValidResults = (
  results: { [key: string]: any }[],
  checkProp?: string,
) => {
  // results array returned from module
  // see ./#applications.js
  const validResults: { [key: string]: any }[] = [];
  if (Array.isArray(results)) {
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.validated) {
        if (checkProp) {
          // validate one property from response object
          const responseProp = result.response[checkProp];
          if (!responseProp || (Array.isArray(responseProp) && !responseProp.length)) {
            // try next module result
            continue;
          }
        }
        validResults.push(result);
      } else {
        logger.error(result.response_errors);
      }
    }
  }
  return validResults;
};

const handleListPayments = (
  body: CheckoutBodyWithItems,
  listPayment: any[],
  paymentsBody: Payment,
  amount: Amount,
  orderBody: OrderSet,
) => {
  for (let i = 0; i < listPayment.length; i++) {
    const result = listPayment[i];
    // treat list payments response
    const { response } = result;
    if (response && response.payment_gateways) {
      // check chosen payment method code and name
      const paymentMethod: PaymentMethod = paymentsBody.transaction.payment_method;
      let paymentMethodCode: PaymentMethod['code'];
      let paymentMethodName: PaymentMethod['name'];
      if (paymentMethod) {
        paymentMethodCode = paymentMethod.code;
        paymentMethodName = paymentMethod.name;
      }

      // filter gateways by method code
      const possibleGateways: PaymentGateways = response.payment_gateways.filter(
        (paymentGatewayFound: PaymentGateways[number]) => {
          const paymentMethodFound = paymentGatewayFound.payment_method;
          return !paymentMethodCode
            || (paymentMethodFound && paymentMethodFound.code === paymentMethodCode);
        },
      );
      let paymentGateway: PaymentGateways[number] | undefined;
      if (possibleGateways.length > 1 && paymentMethodName) {
        // prefer respective method name
        paymentGateway = possibleGateways.find(
          (paymentGatewayFound: PaymentGateways[number]) => {
            return paymentGatewayFound.payment_method.name === paymentMethodName;
          },
        );
      }
      if (!paymentGateway) {
        [paymentGateway] = possibleGateways;
      }

      if (paymentGateway) {
        const { discount } = paymentGateway;
        // handle discount by payment method
        const applyDiscountIn = discount && discount.apply_at;
        let paymentDiscountValue = 0;
        if (applyDiscountIn && discount.value && amount[applyDiscountIn]) {
          const maxDiscount: number = amount[applyDiscountIn] || 0;
          // update amount discount and total
          if (discount.type === 'percentage') {
            paymentDiscountValue = (maxDiscount * discount.value) / 100;
          } else {
            paymentDiscountValue = discount.value;
            if (paymentDiscountValue > maxDiscount) {
              paymentDiscountValue = maxDiscount;
            }
          }
          amount.discount = amount.discount || 0;
          amount.discount += paymentDiscountValue;
          fixAmount(amount, body, orderBody);
        }
        // add to order body
        orderBody.payment_method_label = paymentGateway.label || '';
        return {
          paymentGateway,
          paymentDiscountValue,
        };
      }
    }
  }
  return {};
};

const handleShippingServices = (
  body: CheckoutBodyWithItems,
  shippingOptions: ModuleResult<CalculateShippingResponse>,
  amount: Amount,
  orderBody: OrderSet,
) => {
  const serviceCode = body.shipping.service_code;
  for (let i = 0; i < shippingOptions.length; i++) {
    const result = shippingOptions[i];
    const { response } = result;
    if (response && response.shipping_services) {
      for (let index = 0; index < response.shipping_services.length; index++) {
        const shippingService = response.shipping_services[index];
        const {
          shipping_line: shippingLine,
          ...shippingApp
        } = shippingService;
        if (shippingLine && (!serviceCode || serviceCode === shippingService.service_code)) {
          const priceFreight = (typeof shippingLine.price === 'number'
            ? shippingLine.price
            : 0);
          let freight = typeof shippingLine.total_price === 'number'
            ? shippingLine.total_price
            : priceFreight;
          if (freight < 0) {
            freight = 0;
          }
          amount.freight = freight;
          fixAmount(amount, body, orderBody);
          let maxProductionDays = 0;
          if (orderBody.items) {
            orderBody.items.forEach(
              (item: Item) => {
                const productionTime = item.production_time;
                if (productionTime) {
                  let productionDays = productionTime.days;
                  if (productionDays && productionTime.cumulative) {
                    productionDays *= item.quantity;
                  }
                  if (productionTime.max_time) {
                    if (productionDays > productionTime.max_time) {
                      productionDays = productionTime.max_time;
                    }
                  }
                  if (maxProductionDays < productionDays) {
                    maxProductionDays = productionDays;
                  }
                }
              },
            );
          }
          if (maxProductionDays) {
            if (!shippingLine.posting_deadline) {
              shippingLine.posting_deadline = {
                days: 0,
              };
            }
            shippingLine.posting_deadline.days += maxProductionDays;
          }
          orderBody.shipping_lines = [{
            ...shippingLine,
            app: {
              _id: result._id,
              ...shippingApp,
            },
          }];
          orderBody.shipping_method_label = shippingService.label || '';
          return;
        }
      }
    }
  }
  logger.warn('Checkout shipping service not found', { serviceCode, shippingOptions });
};

const handleApplyDiscount = (
  body: CheckoutBodyWithItems,
  listDiscount: Record<string, any>,
  amount: Amount,
  orderBody: OrderSet,
) => {
  for (let i = 0; i < listDiscount.length; i++) {
    const result = listDiscount[i];
    // treat apply discount response
    const { response } = result;
    if (response && response.discount_rule) {
      // check discount value
      const discountRule = response.discount_rule;
      const extraDiscount = discountRule.extra_discount;

      if (extraDiscount && extraDiscount.value) {
        // update amount and save extra discount to order body
        amount.discount += extraDiscount.value;
        fixAmount(amount, body, orderBody);
        if (
          !orderBody.extra_discount
          || (extraDiscount.flags && !orderBody.extra_discount.flags)
        ) {
          orderBody.extra_discount = {
            ...body.discount,
            ...extraDiscount,
            // app info
            app: {
              ...discountRule,
              _id: result._id,
            },
          };
        } else {
          const flags = orderBody.extra_discount.flags || [];
          flags.push(`app-${result.app_id}`.substring(0, 20));
          if (extraDiscount.flags) {
            extraDiscount.flags.forEach((flag) => {
              flags.push(flag);
            });
          }
          orderBody.extra_discount.flags = flags.slice(0, 10);
        }

        if (response.freebie_product_ids) {
          // mark items provided for free
          orderBody.items?.forEach((item) => {
            if (!item.flags) {
              item.flags = [];
            }
            if (response.freebie_product_ids.includes(item.product_id)) {
              item.flags.push('discount-set-free');
            }
          });
        }
        break;
      }
    }
  }
};

export {
  sendError,
  fixAmount,
  getValidResults,
  handleShippingServices,
  handleApplyDiscount,
  handleListPayments,
};
