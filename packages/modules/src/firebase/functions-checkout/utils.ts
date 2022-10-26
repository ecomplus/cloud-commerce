import type { Response } from 'firebase-functions';
import type {
  CheckoutBodyWithItems,
  BodyOrder,
  Payment,
  PaymentGateways,
  PaymentMethod,
  Amount,
  Item,
  ShippingSerive,
  ShippingLine,
} from '../../types/index';
import logger from 'firebase-functions/logger';

type BodyResouce = {[key:string]:any}

const sendError = (
  res:Response,
  status: number,
  errorCode: string | number,
  message: string,
  userMessage?: {[key:string]:string},
  moreInfo?:string,
) => {
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
  body: CheckoutBodyWithItems,
  orderBody: BodyOrder,
) => {
  Object.keys(amount).forEach((field) => {
    if (amount[field] > 0 && field !== 'total') {
      amount[field] = Math.round(amount[field] * 100) / 100;
    }
  });

  amount.total = Math.round(
    ((amount.subtotal || 0) + (amount.freight || 0) - (amount.discount || 0)) * 100,
  ) / 100;
  if (amount.total < 0) {
    amount.total = 0;
  }
  // also save amount to checkout and order body objects
  body.amount = amount;
  orderBody.amount = amount;
};

const getValidResults = (
  results: {[key:string]:any} [],
  checkProp?:string,
) => {
  // results array returned from module
  // see ./#applications.js
  const validResults: {[key:string]:any}[] = [];
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
        // use it
        validResults.push(result);
      } else {
        // help identify likely app response errors
        logger.error(result.response_errors);
      }
    }
  }
  return validResults;
};

const handleListPayments = (
  body: CheckoutBodyWithItems,
  listPayment: {[key:string]:any},
  paymentsBody: Payment,
  amount:Amount,
  orderBody: BodyOrder,
) => {
  for (let i = 0; i < listPayment.length; i++) {
    const result = listPayment[i];
    // treat list payments response
    const { response } = result;
    if (response && response.payment_gateways) {
    // check chosen payment method code and name
      const paymentMethod: PaymentMethod = paymentsBody.transaction.payment_method;
      let paymentMethodCode: PaymentMethod['code'];
      let paymentMethodName:PaymentMethod['name'];
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
        if (applyDiscountIn && discount.value && amount[applyDiscountIn]) {
          const maxDiscount: number = amount[applyDiscountIn] || 0;
          // update amount discount and total
          let discountValue: number;
          if (discount.type === 'percentage') {
            discountValue = (maxDiscount * discount.value) / 100;
          } else {
            discountValue = discount.value;
            if (discountValue > maxDiscount) {
              discountValue = maxDiscount;
            }
          }
          amount.discount = amount.discount ? amount.discount : 0;
          amount.discount += discountValue;
          fixAmount(amount, body, orderBody);
        }
        // add to order body
        orderBody.payment_method_label = paymentGateway.label || '';

      // finally start creating new order
      }
    }
  }
};

// simulate requets to calculate shipping endpoint
const handleShippingServices = (
  body: CheckoutBodyWithItems,
  listShipping: BodyResouce,
  amount:Amount,
  orderBody: BodyOrder,
) => {
  for (let i = 0; i < listShipping.length; i++) {
    const result = listShipping[i];
    // treat calculate shipping response
    const { response } = result;
    if (response && response.shipping_services) {
      // check chosen shipping code
      const shippingCode = body.shipping.service_code;

      for (let index = 0; index < response.shipping_services.length; index++) {
        const shippingService: ShippingSerive = response.shipping_services[index];
        const shippingLine: ShippingLine = shippingService.shipping_line;
        if (shippingLine && (!shippingCode || shippingCode === shippingService.service_code)) {
          // update amount freight and total
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

          // app info
          const shippingApp = {
            app: { _id: result._id, ...shippingService },
          };
          // remove shipping line property
          delete shippingApp.app.shipping_line;

          // sum production time to posting deadline
          let maxProductionDays = 0;
          if (orderBody.items) {
            orderBody.items.forEach(
              (item:Item) => {
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

          // add to order body
          orderBody.shipping_lines = [
            // generate new object id and compose shipping line object
            { ...shippingApp, ...shippingLine },
          ];
          orderBody.shipping_method_label = shippingService.label || '';

          // continue to discount step
        }
      }
    }
  }
};

const handleApplyDiscount = (
  body: CheckoutBodyWithItems,
  listDiscount: BodyResouce,
  amount:Amount,
  orderBody: BodyOrder,
) => {
  // simulate request to apply discount endpoint to get extra discount value
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
        orderBody.extra_discount = {
          ...body.discount,
          ...extraDiscount,
          // app info
          app: {
            ...discountRule,
            _id: result._id,
          },
        };

        if (response.freebie_product_ids) {
          // mark items provided for free
          orderBody.items.forEach((item) => {
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
  // proceed to list payments
};

export {
  sendError,
  fixAmount,
  getValidResults,
  handleShippingServices,
  handleApplyDiscount,
  handleListPayments,
};
