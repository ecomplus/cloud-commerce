/* eslint-disable default-param-last, no-use-before-define */
import ecomUtils from '@ecomplus/utils';

const validateDateRange = (rule) => {
  // filter campaings by date
  const timestamp = Date.now();
  if (rule.date_range) {
    if (rule.date_range.start && new Date(rule.date_range.start).getTime() > timestamp) {
      return false;
    }
    if (rule.date_range.end && new Date(rule.date_range.end).getTime() < timestamp) {
      return false;
    }
  }
  return true;
};

const validateCustomerId = (rule, params) => {
  if (
    typeof rule.customer_ids === 'object'
    && rule.customer_ids
    && !Array.isArray(rule.customer_ids)
  ) {
    const customerIds = [];
    Object.keys(rule.customer_ids).forEach((key) => {
      if (rule.customer_ids[key]) {
        customerIds.push(rule.customer_ids[key]);
      }
    });
    rule.customer_ids = customerIds;
  }
  if (
    Array.isArray(rule.customer_ids)
    && rule.customer_ids.length
    && rule.customer_ids.indexOf(params.customer && params.customer._id) === -1
  ) {
    // unavailable for current customer
    return false;
  }
  return true;
};

const matchFreebieRule = (rule, params = {}) => {
  const coupon = params.discount_coupon;
  const utm = params.utm && params.utm.campaign;
  if (rule.domain && rule.domain !== params.domain) {
    if (params.domain !== `${rule.domain}.skip-open`) {
      return false;
    }
  }
  if (rule.freebie_coupon && rule.freebie_utm) {
    return coupon?.toUpperCase() === rule.freebie_coupon?.toUpperCase()
      || (utm?.toUpperCase() === rule.freebie_utm?.toUpperCase());
  }
  if (rule.freebie_coupon) {
    return coupon?.toUpperCase() === rule.freebie_coupon?.toUpperCase();
  }
  if (rule.freebie_utm) {
    return (utm?.toUpperCase() === rule.freebie_utm?.toUpperCase());
  }
  return true;
};

const checkOpenPromotion = (rule) => {
  return !rule.discount_coupon && !rule.utm_campaign
    && (!Array.isArray(rule.customer_ids) || !rule.customer_ids.length);
};

const getValidDiscountRules = (discountRules, params, itemsForKit) => {
  if (Array.isArray(discountRules) && discountRules.length) {
    // validate rules objects
    return discountRules.filter((rule) => {
      if (!rule || !validateCustomerId(rule, params)) {
        return false;
      }
      const isKitDiscount = Array.isArray(itemsForKit)
        && (Array.isArray(rule.product_ids) || Array.isArray(rule.category_ids));
      if (rule.domain && rule.domain !== params.domain) {
        if (params.domain === `${rule.domain}.skip-open`) {
          if (!isKitDiscount && checkOpenPromotion(rule)) return false;
        } else {
          return false;
        }
      }
      if (isKitDiscount) {
        const checkProductId = (item) => {
          if (
            !(rule.product_ids && rule.product_ids.length)
            && Array.isArray(rule.category_ids)
            && rule.category_ids.length
          ) {
            if (Array.isArray(item.categories)) {
              for (let i = 0; i < item.categories.length; i++) {
                const category = item.categories[i];
                if (rule.category_ids.indexOf(category._id) > -1) {
                  return true;
                }
              }
            }
            return false;
          }
          return (
            !(rule.product_ids && rule.product_ids.length)
            || rule.product_ids.indexOf(item.product_id) > -1
          );
        };
        // set/add discount value from lowest item price
        let value;
        if (rule.discount_lowest_price) {
          itemsForKit.forEach((item) => {
            const price = ecomUtils.price(item);
            if (price > 0 && checkProductId(item) && (!value || value > price)) {
              value = price;
            }
          });
        } else if (rule.discount_kit_subtotal) {
          value = 0;
          itemsForKit.forEach((item) => {
            const price = ecomUtils.price(item);
            if (price > 0 && checkProductId(item)) {
              value += price * item.quantity;
            }
          });
          if (rule.min_quantity > 1) {
            const totalQuantity = itemsForKit.reduce((acc, item) => {
              return item.quantity + acc;
            }, 0);
            if (totalQuantity > rule.min_quantity) {
              value *= (rule.min_quantity / totalQuantity);
            }
          }
        }
        if (value) {
          if (rule.discount && rule.discount.value) {
            if (rule.discount.type === 'percentage') {
              value *= rule.discount.value / 100;
            } else if (rule.discount_kit_subtotal) {
              value = rule.discount.value;
            } else {
              value = Math.min(value, rule.discount.value);
            }
          }
          rule.originalDiscount = rule.discount;
          rule.discount = {
            ...rule.discount,
            type: 'fixed',
            value,
          };
        }
      }
      if (!rule.discount || !rule.discount.value) {
        return false;
      }
      return validateDateRange(rule);
    });
  }
  // returns array anyway
  return [];
};

const matchDiscountRule = (_discountRules, params = {}, skipApplyAt) => {
  const validItemsDiscountRules = _discountRules.filter((rule) => {
    return mapCampaignProducts(rule, params).valid;
  });
  const discountRules = validItemsDiscountRules.length
    ? validItemsDiscountRules
    : _discountRules;
  const filteredRules = skipApplyAt
    ? discountRules.filter((rule) => {
      const applyAt = (rule.discount && rule.discount.apply_at) || 'total';
      return applyAt !== skipApplyAt;
    })
    : discountRules;
  // try to match a promotion
  if (params.discount_coupon) {
    // match only by discount coupon
    return {
      discountRule: filteredRules.find((rule) => {
        return rule.case_insensitive
          ? typeof rule.discount_coupon === 'string'
            && rule.discount_coupon.toUpperCase() === params.discount_coupon.toUpperCase()
          : rule.discount_coupon === params.discount_coupon;
      }),
      discountMatchEnum: 'COUPON',
    };
  }
  // try to match by UTM campaign first
  if (params.utm && params.utm.campaign) {
    const discountRule = filteredRules.find((rule) => {
      return rule.case_insensitive
        ? typeof rule.utm_campaign === 'string'
          && rule.utm_campaign.toUpperCase() === params.utm.campaign.toUpperCase()
        : rule.utm_campaign === params.utm.campaign;
    });
    if (discountRule) {
      return {
        discountRule,
        discountMatchEnum: 'UTM',
      };
    }
  }
  // then try to match by customer
  if (params.customer && params.customer._id) {
    const discountRule = filteredRules.find((rule) => {
      return Array.isArray(rule.customer_ids)
      && rule.customer_ids.indexOf(params.customer._id) > -1;
    });
    if (discountRule) {
      return {
        discountRule,
        discountMatchEnum: 'CUSTOMER',
      };
    }
  }
  // then try to match by domain
  if (params.domain) {
    const discountRule = filteredRules.find((rule) => {
      return rule.domain === params.domain || params.domain === `${rule.domain}.skip-open`;
    });
    if (discountRule) {
      return {
        discountRule,
        discountMatchEnum: 'DOMAIN',
      };
    }
  }
  // last try to match by open promotions
  return {
    discountRule: filteredRules.find(checkOpenPromotion),
    discountMatchEnum: 'OPEN',
  };
};

const mapCampaignProducts = (rule, params) => {
  if (Array.isArray(rule.product_ids) && rule.product_ids.length) {
    const items = params.items?.filter((item) => {
      return item.quantity && rule.product_ids.includes(item.product_id);
    }) || [];
    return { valid: items.length, items };
  }
  if (Array.isArray(rule.category_ids) && rule.category_ids.length) {
    let discountValue = 0;
    const items = params.items?.filter((item) => {
      const isValidItem = item.quantity && item.categories?.some((category) => {
        return rule.category_ids.includes(category._id);
      });
      if (isValidItem) {
        const price = ecomUtils.price(item);
        if (price > 0) {
          discountValue += (price * item.quantity);
        }
      }
      return isValidItem;
    }) || [];
    // direct "fix" rule discount value limiting by category items
    if (rule.discount?.value) {
      if (rule.discount.type === 'percentage') {
        discountValue *= rule.discount.value / 100;
      } else {
        discountValue = Math.min(discountValue, rule.discount.value);
      }
      rule.discount.type = 'fixed';
      rule.discount.value = discountValue;
    }
    return { valid: items.length, items };
  }
  return { valid: true, items: [] };
};

export {
  validateDateRange,
  validateCustomerId,
  checkOpenPromotion,
  getValidDiscountRules,
  matchDiscountRule,
  matchFreebieRule,
  mapCampaignProducts,
};
