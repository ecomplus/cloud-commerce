/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Triggered to validate and apply discount value, must return discount and conditions
 */
export interface ApplyDiscountParams {
  /**
   * Text of discount coupon applied by customer
   */
  discount_coupon?: string;
  /**
   * Products composing the cart
   *
   * @maxItems 3000
   */
  items?: {
    /**
     * Product ID
     */
    product_id: string;
    /**
     * ID to specify the variation added to cart, if product has variations
     */
    variation_id?: string;
    /**
     * Product or variation unique reference code
     */
    sku?: string;
    /**
     * Product or variation full name, or other label for this cart item
     */
    name?: string;
    /**
     * Item quantity in cart
     */
    quantity: number;
    /**
     * Designator of currency according to ISO 4217 (3 uppercase letters)
     */
    currency_id?: string;
    /**
     * Graphic symbol used as a shorthand for currency's name
     */
    currency_symbol?: string;
    /**
     * Product sale price specifically for this cart
     */
    price: number;
    /**
     * Final item price including additions due to customizations and gift wrap
     */
    final_price?: number;
    /**
     * List of product categories
     *
     * @maxItems 50
     */
    categories?: {
      /**
       * Category ID
       */
      _id: string;
      /**
       * Category name
       */
      name?: string;
    }[];
    /**
     * List of product brands
     *
     * @maxItems 50
     */
    brands?: {
      /**
       * Brand ID
       */
      _id: string;
      /**
       * Brand name
       */
      name?: string;
    }[];
  }[];
  /**
   * Designator of currency according to ISO 4217 (3 uppercase letters)
   */
  currency_id?: string;
  /**
   * Graphic symbol used as a shorthand for currency's name
   */
  currency_symbol?: string;
  /**
   * Object with sums of values
   */
  amount?: {
    /**
     * Order total amount
     */
    total: number;
    /**
     * The sum of all items prices
     */
    subtotal?: number;
    /**
     * Order freight cost
     */
    freight?: number;
    /**
     * Applied discount value
     */
    discount?: number;
    /**
     * The sum of all the taxes applied to the order
     */
    tax?: number;
    /**
     * Sum of optional extra costs applied
     */
    extra?: number;
  };
  /**
   * UTM campaign HTTP parameters
   */
  utm?: {
    /**
     * Parameter "utm_source", the referrer: (e.g. google, newsletter)
     */
    source?: string;
    /**
     * Parameter "utm_medium", the marketing medium: (e.g. cpc, banner, email)
     */
    medium?: string;
    /**
     * Parameter "utm_campaign", the product, promo code, or slogan (e.g. spring_sale)
     */
    campaign?: string;
    /**
     * Parameter "utm_term", identifies the paid keywords
     */
    term?: string;
    /**
     * Parameter "utm_content", used to differentiate ads
     */
    content?: string;
  };
  /**
   * Code to identify the affiliate that referred the customer
   */
  affiliate_code?: string;
  /**
   * Channel unique identificator
   */
  channel_id?: number;
  /**
   * Channel type or source
   */
  channel_type?: 'ecommerce' | 'mobile' | 'pdv' | 'button' | 'facebook' | 'chatbot';
  /**
   * Store domain name (numbers and lowercase letters, eg.: www.myshop.sample)
   */
  domain?: string;
  /**
   * Language two letters code, sometimes with region, eg.: pt_br, fr, en_us
   */
  lang?: string;
  /**
   * Customer object summary
   */
  customer?: {
    /**
     * Customer ID
     */
    _id?: null | string;
    /**
     * The name of this Customer, suitable for display
     */
    display_name?: string;
    /**
     * Responsible person or organization document number (only numbers)
     */
    doc_number?: string;
  };
}
