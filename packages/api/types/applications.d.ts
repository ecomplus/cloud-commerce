/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface Applications {
  _id: string & { length: 24 };
  created_at: string;
  updated_at: string;
  store_id: number;
  /**
   * ID of application on marketplace
   */
  app_id: number;
  /**
   * The working state of this app in the shop
   */
  state?: 'inactive' | 'active' | 'test';
  /**
   * App title
   */
  title: string;
  /**
   * App unique slug on marketplace, only lowercase letters, numbers and hyphen
   */
  slug?: string;
  /**
   * Whether this app is paid
   */
  paid?: boolean;
  /**
   * Installed application version, semver e.g. 1.0.0
   */
  version: string;
  /**
   * When app installation was updated, date and time in ISO 8601 standard representation
   */
  version_date?: string;
  /**
   * Type of app
   */
  type: 'dashboard' | 'storefront' | 'external';
  /**
   * Modules handled by this app
   */
  modules?: {
    calculate_shipping?: Module;
    list_payments?: Module1;
    apply_discount?: Module2;
    create_transaction?: Module3;
    checkout_done?: Module4;
  };
  /**
   * Configuration options for staff on admin dashboard, saved on app data
   */
  admin_settings?: {
    /**
     * Configuration field object, property name same as saved on data object
     *
     * This interface was referenced by `undefined`'s JSON-Schema definition
     * via the `patternProperty` "^[a-z0-9_]{2,30}$".
     */
    [k: string]: {
      /**
       * JSON Schema (https://json-schema.org/specification.html) for field model
       */
      schema: {
        [k: string]: unknown;
      };
      /**
       * Whether the field value is private, saved in `hidden_data`
       */
      hide?: boolean;
    };
  };
  /**
   * Application object data, schema free
   */
  data?: {
    [k: string]: any;
  };
  /**
   * Application private data, available only with authentication
   */
  hidden_data?: {
    [k: string]: any;
  };
  /**
   * Flags to associate additional info
   *
   * @maxItems 10
   */
  flags?: string[];
  /**
   * Optional notes with additional info about this user
   */
  notes?: string;
}
/**
 * Triggered to calculate shipping options, must return calculated values and times
 */
export interface Module {
  /**
   * Whether current app is enabled to handle the module requests
   */
  enabled: boolean;
  /**
   * URL to receive POST request of respective module
   */
  endpoint: string;
}
/**
 * Triggered when listing payments, must return available methods
 */
export interface Module1 {
  /**
   * Whether current app is enabled to handle the module requests
   */
  enabled: boolean;
  /**
   * URL to receive POST request of respective module
   */
  endpoint: string;
}
/**
 * Triggered to validate and apply discout value, must return discount and conditions
 */
export interface Module2 {
  /**
   * Whether current app is enabled to handle the module requests
   */
  enabled: boolean;
  /**
   * URL to receive POST request of respective module
   */
  endpoint: string;
}
/**
 * Triggered when order is being closed, must create payment transaction and return info
 */
export interface Module3 {
  /**
   * Whether current app is enabled to handle the module requests
   */
  enabled: boolean;
  /**
   * URL to receive POST request of respective module
   */
  endpoint: string;
}
/**
 * Triggered after each order created from storefront, could return custom fields
 */
export interface Module4 {
  /**
   * Whether current app is enabled to handle the module requests
   */
  enabled: boolean;
  /**
   * URL to receive POST request of respective module
   */
  endpoint: string;
}