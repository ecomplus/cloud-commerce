import ecomUtils from '@ecomplus/utils';
import api from '@cloudcommerce/api';
import {
  validateDateRange,
  validateCustomerId,
  checkOpenPromotion,
  getValidDiscountRules,
  matchDiscountRule,
  checkCampaignProducts,
} from './helpers.mjs';

export default async ({ params, application }) => {
  // app configured options
  const config = {
    ...application.data,
    ...application.hidden_data,
  };

  // setup response object
  // https://apx-mods.e-com.plus/api/v1/apply_discount/response_schema.json?store_id=100
  const response = {};
  const respondSuccess = () => {
    if (response.available_extra_discount && !response.available_extra_discount.value) {
      delete response.available_extra_discount;
    }
    if (
      response.discount_rule
      && (!response.discount_rule.extra_discount || !response.discount_rule.extra_discount.value)
    ) {
      delete response.discount_rule;
    }
    return response;
  };

  const addDiscount = (discount, flag, label, maxDiscount) => {
    let value;
    if (typeof maxDiscount !== 'number') {
      maxDiscount = params.amount[discount.apply_at || 'total'];
    }
    if (maxDiscount) {
      // update amount discount and total
      if (discount.type === 'percentage') {
        value = maxDiscount * (discount.value / 100);
      } else {
        value = discount.value;
      }
      if (value > maxDiscount) {
        value = maxDiscount;
      }
    }

    if (value) {
      if (response.discount_rule) {
        // accumulate discount
        const extraDiscount = response.discount_rule.extra_discount;
        extraDiscount.value += value;
        if (extraDiscount.flags.length < 20) {
          extraDiscount.flags.push(flag);
        }
      } else {
        response.discount_rule = {
          label: label || flag,
          extra_discount: {
            value,
            flags: [flag],
          },
        };
      }
      return true;
    }
    return false;
  };

  if (params.items && params.items.length) {
    // try product kit discounts first
    if (Array.isArray(config.product_kit_discounts)) {
      config.product_kit_discounts = config.product_kit_discounts.map((kitDiscount) => {
        if (!kitDiscount.product_ids) {
          // kit with any items
          kitDiscount.product_ids = [];
        }
        return kitDiscount;
      });
    }
    const kitDiscounts = getValidDiscountRules(config.product_kit_discounts, params, params.items)
      .sort((a, b) => {
        if (!Array.isArray(a.product_ids) || !a.product_ids.length) {
          if (Array.isArray(b.product_ids) && b.product_ids.length) {
            return 1;
          }
        }
        if (a.min_quantity > b.min_quantity) {
          return -1;
        }
        if (b.min_quantity > a.min_quantity) {
          return 1;
        }
        if (a.discount.min_amount > b.discount.min_amount) {
          return -1;
        }
        if (b.discount.min_amount > a.discount.min_amount) {
          return 1;
        }
        return 0;
      });
    // prevent applying duplicated kit discount for same items
    let discountedItemIds = [];
    // check buy together recommendations
    const buyTogether = [];

    kitDiscounts.forEach((kitDiscount, index) => {
      if (kitDiscount) {
        const productIds = Array.isArray(kitDiscount.product_ids)
          ? kitDiscount.product_ids
          : [];
        let kitItems = productIds.length
          ? params.items.filter((item) => item.quantity && productIds.indexOf(item.product_id) > -1)
          : params.items.filter((item) => item.quantity);
        kitItems = kitItems.filter((item) => discountedItemIds.indexOf(item.product_id) === -1);
        if (!kitItems.length) {
          return;
        }

        const recommendBuyTogether = () => {
          if (
            params.items.length === 1
            && productIds.length <= 4
            && buyTogether.length < 300
          ) {
            const baseProductId = params.items[0].product_id;
            if (productIds.indexOf(baseProductId) === -1) {
              return;
            }
            const baseItemQuantity = params.items[0].quantity || 1;
            const perItemQuantity = kitDiscount.min_quantity > 2
              ? Math.max(kitDiscount.min_quantity / (productIds.length - 1) - baseItemQuantity, 1)
              : 1;
            const buyTogetherProducts = {};
            productIds.forEach((productId) => {
              if (productId !== baseProductId) {
                buyTogetherProducts[productId] = perItemQuantity;
              }
            });
            if (Object.keys(buyTogetherProducts).length) {
              buyTogether.push({
                products: buyTogetherProducts,
                discount: {
                  type: kitDiscount.discount.type,
                  value: kitDiscount.discount.value,
                },
              });
            }
          }
        };

        const discount = { ...kitDiscount.discount };
        if (kitDiscount.min_quantity > 0) {
          // check total items quantity
          if (kitDiscount.same_product_quantity) {
            kitItems = kitItems.filter((item) => item.quantity >= kitDiscount.min_quantity);
          } else {
            let totalQuantity = 0;
            kitItems.forEach(({ quantity }) => {
              totalQuantity += quantity;
            });
            if (totalQuantity < kitDiscount.min_quantity) {
              if (productIds.length > 1 && kitDiscount.check_all_items !== false) {
                recommendBuyTogether();
                return;
              }
              return;
            }
            if (discount.type === 'fixed' && kitDiscount.cumulative_discount !== false) {
              discount.value *= Math.floor(totalQuantity / kitDiscount.min_quantity);
            }
          }
        }

        if (!params.amount || !(discount.min_amount > params.amount.total)) {
          if (kitDiscount.check_all_items !== false) {
            for (let i = 0; i < productIds.length; i++) {
              const productId = productIds[i];
              if (
                productId
                && !kitItems.find((item) => item.quantity && item.product_id === productId)
              ) {
                // product not on current cart
                recommendBuyTogether();
                return;
              }
            }
          }
          // apply cumulative discount \o/
          if (kitDiscount.same_product_quantity) {
            kitItems.forEach((item, i) => {
              addDiscount(
                discount,
                `KIT-${(index + 1)}-${i}`,
                kitDiscount.label,
                ecomUtils.price(item) * (item.quantity || 1),
              );
            });
          } else {
            addDiscount(discount, `KIT-${(index + 1)}`, kitDiscount.label);
          }
          discountedItemIds = discountedItemIds.concat(kitItems.map((item) => item.product_id));
        }
      }
    });
    if (buyTogether.length) {
      response.buy_together = buyTogether;
    }

    // gift products (freebies) campaings
    if (Array.isArray(config.freebies_rules)) {
      const validFreebiesRules = config.freebies_rules.filter((rule) => {
        return validateDateRange(rule)
          && validateCustomerId(rule, params)
          && checkCampaignProducts(rule.check_product_ids, params)
          && Array.isArray(rule.product_ids)
          && rule.product_ids.length;
      });
      if (validFreebiesRules) {
        let subtotal = 0;
        params.items.forEach((item) => {
          subtotal += (item.quantity * ecomUtils.price(item));
        });

        let bestRule;
        let discountValue = 0;
        for (let i = 0; i < validFreebiesRules.length; i++) {
          const rule = validFreebiesRules[i];
          // start calculating discount
          let value = 0;
          rule.product_ids.forEach((productId) => {
            const item = params.items.find((_item) => productId === _item.product_id);
            if (item) {
              value += ecomUtils.price(item);
            }
          });
          const fixedSubtotal = subtotal - value;
          if (!bestRule || value > discountValue || bestRule.min_subtotal < rule.min_subtotal) {
            if (!(rule.min_subtotal > fixedSubtotal)) {
              bestRule = rule;
              discountValue = value;
            } else if (!discountValue && subtotal >= rule.min_subtotal) {
              // discount not applicable yet but additional freebies are available
              bestRule = rule;
            }
          }
        }

        if (bestRule) {
          // provide freebie products \o/
          response.freebie_product_ids = bestRule.product_ids;
          if (discountValue) {
            addDiscount(
              {
                type: 'fixed',
                value: discountValue,
              },
              'FREEBIES',
              bestRule.label,
            );
          }
        }
      }
    }
  }

  const discountRules = getValidDiscountRules(config.discount_rules, params);
  if (discountRules.length) {
    const { discountRule, discountMatchEnum } = matchDiscountRule(discountRules, params);
    if (discountRule) {
      if (!checkCampaignProducts(discountRule.product_ids, params)) {
        return {
          available_extra_discount: response.available_extra_discount,
          invalid_coupon_message: params.lang === 'pt_br'
            ? 'Nenhum produto da promoção está incluído no carrinho'
            : 'No promotion products are included in the cart',
        };
      }

      const excludedProducts = discountRule.excluded_product_ids;
      if (Array.isArray(excludedProducts) && excludedProducts.length && params.items) {
        // must check any excluded product is on cart
        for (let i = 0; i < params.items.length; i++) {
          const item = params.items[i];
          if (item.quantity && excludedProducts.includes(item.product_id)) {
            return {
              available_extra_discount: response.available_extra_discount,
              invalid_coupon_message: params.lang === 'pt_br'
                ? `Promoção é inválida para o produto ${item.name}`
                : `Invalid promotion for product ${item.name}`,
            };
          }
        }
      }

      let { label } = discountRule;
      const { discount } = discountRule;
      if (typeof label !== 'string' || !label) {
        label = params.discount_coupon || `DISCOUNT ${discountMatchEnum}`;
      }
      if (
        discount.apply_at !== 'freight'
        && (!response.available_extra_discount || !response.available_extra_discount.value
          || discountRule.default_discount === true || checkOpenPromotion(discountRule))
      ) {
        // show current discount rule as available discount to apply
        response.available_extra_discount = {
          label: label.substring(0, 50),
        };
        ['min_amount', 'type', 'value'].forEach((field) => {
          if (discount[field]) {
            response.available_extra_discount[field] = discount[field];
          }
        });
      }

      // params object follows list payments request schema:
      // https://apx-mods.e-com.plus/api/v1/apply_discount/schema.json?store_id=100
      if (
        params.amount && params.amount.total > 0
        && !(discountRule.discount.min_amount > params.amount[discountRule.discount.amount_field || 'total'])
      ) {
        if (
          discountRule.cumulative_discount === false
          && (response.discount_rule || params.amount.discount)
        ) {
          // explain discount can't be applied :(
          // https://apx-mods.e-com.plus/api/v1/apply_discount/response_schema.json?store_id=100
          return {
            invalid_coupon_message: params.lang === 'pt_br'
              ? 'A promoção não pôde ser aplicada porque este desconto não é cumulativo'
              : 'This discount is not cumulative',
          };
        }

        // we have a discount to apply \o/
        if (addDiscount(discountRule.discount, discountMatchEnum)) {
          // add discount label and description if any
          response.discount_rule.label = label;
          if (discountRule.description) {
            response.discount_rule.description = discountRule.description;
          }

          const { customer } = params;
          if (
            customer && customer._id
            && (discountRule.usage_limit > 0 || discountRule.total_usage_limit > 0)
          ) {
            // list orders to check discount usage limits
            // eslint-disable-next-line prefer-template
            const endpoint = 'orders?fields=_id'
              + `&extra_discount.app.label${(discountRule.case_insensitive ? '%=' : '=')}`
              + encodeURIComponent(label);
            const usageLimits = [{
              // limit by customer
              query: `&buyers._id=${customer._id}`,
              max: discountRule.usage_limit,
            }, {
              // total limit
              query: '',
              max: discountRule.total_usage_limit,
            }];
            for (let i = 0; i < usageLimits.length; i++) {
              const { query, max } = usageLimits[i];
              if (max) {
                let countOrders;
                try {
                  // send Store API request to list orders with filters
                  // eslint-disable-next-line no-await-in-loop
                  const { data } = await api.get(`${endpoint}${query}`);
                  countOrders = data.result.length;
                } catch (err) {
                  return {
                    error: 'CANT_CHECK_USAGE_LIMITS',
                    message: err.message,
                  };
                }

                if (countOrders >= max) {
                  // limit reached
                  return {
                    invalid_coupon_message: params.lang === 'pt_br'
                      ? 'A promoção não pôde ser aplicada porque já atingiu o limite de usos'
                      : 'The promotion could not be applied because it has already reached the usage limit',
                  };
                }
              }
            }
          }
          return respondSuccess();
        }
      }
    }
  }

  // response with no error nor discount applied
  return respondSuccess();
};
