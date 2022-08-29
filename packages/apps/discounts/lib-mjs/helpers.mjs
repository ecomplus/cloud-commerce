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
    Array.isArray(rule.customer_ids)
    && rule.customer_ids.length
    && rule.customer_ids.indexOf(params.customer && params.customer._id) === -1
  ) {
    // unavailable for current customer
    return false;
  }
  return true;
};

const checkOpenPromotion = (rule) => {
  return !rule.discount_coupon && !rule.utm_campaign
    && (!Array.isArray(rule.customer_ids) || !rule.customer_ids.length);
};

const getValidDiscountRules = (discountRules, params, items) => {
  if (Array.isArray(discountRules) && discountRules.length) {
    // validate rules objects
    return discountRules.filter((rule) => {
      if (!rule || !validateCustomerId(rule, params)) {
        return false;
      }

      if (Array.isArray(rule.product_ids) && Array.isArray(items)) {
        const checkProductId = (item) => {
          return (!rule.product_ids.length || rule.product_ids.indexOf(item.product_id) > -1);
        };
        // set/add discount value from lowest item price
        let value;
        if (rule.discount_lowest_price) {
          items.forEach((item) => {
            const price = ecomUtils.price(item);
            if (price > 0 && checkProductId(item) && (!value || value > price)) {
              value = price;
            }
          });
        } else if (rule.discount_kit_subtotal) {
          value = 0;
          items.forEach((item) => {
            const price = ecomUtils.price(item);
            if (price > 0 && checkProductId(item)) {
              value += price * item.quantity;
            }
          });
        }
        if (value) {
          if (rule.discount && rule.discount.value) {
            if (rule.discount.type === 'percentage') {
              value *= rule.discount.value / 100;
            } else {
              value += rule.discount.value;
            }
          }
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

const matchDiscountRule = (discountRules, params) => {
  // try to match a promotion
  if (params.discount_coupon) {
    // match only by discount coupon
    return {
      discountRule: discountRules.find((rule) => {
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
    const discountRule = discountRules.find((rule) => {
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
    const discountRule = discountRules.find((rule) => Array.isArray(rule.customer_ids)
      && rule.customer_ids.indexOf(params.customer._id) > -1);
    if (discountRule) {
      return {
        discountRule,
        discountMatchEnum: 'CUSTOMER',
      };
    }
  }

  // last try to match by open promotions
  return {
    discountRule: discountRules.find(checkOpenPromotion),
    discountMatchEnum: 'OPEN',
  };
};

const checkCampaignProducts = (campaignProducts, params) => {
  if (Array.isArray(campaignProducts) && campaignProducts.length) {
    // must check at least one campaign product on cart
    let hasProductMatch;
    if (params.items && params.items.length) {
      for (let i = 0; i < campaignProducts.length; i++) {
        if (params.items.find((item) => item.quantity && item.product_id === campaignProducts[i])) {
          hasProductMatch = true;
          break;
        }
      }
    }
    if (!hasProductMatch) {
      return false;
    }
  }
  return true;
};

export {
  validateDateRange,
  validateCustomerId,
  checkOpenPromotion,
  getValidDiscountRules,
  matchDiscountRule,
  checkCampaignProducts,
};
