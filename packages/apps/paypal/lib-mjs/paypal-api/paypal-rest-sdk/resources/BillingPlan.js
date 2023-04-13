/* Copyright 2015-2016 PayPal, Inc. */
/* eslint-disable quotes, semi, indent, no-var, camelcase, quote-props, no-trailing-spaces, space-before-function-paren, comma-dangle, spaced-comment */
"use strict";

var generate = require('../generate');
var api = require('../api');

/**
 * Create planned sets of future recurring payments at periodic intervals (sometimes known as “subscriptions”).
 * @return {Object} billing plan functions
 */
function billingPlan(defaultOptions) {
    var baseURL = '/v1/payments/billing-plans/';
    var operations = ['create', 'get', 'list', 'update'];

    var ret = {
        defaultOptions: defaultOptions,
        baseURL: baseURL,
        /**
         * Activate a billing plan so that it can be used to form
         * billing agreements with users
         * @param  {String}   id     Billing plan identifier
         * @param  {Object|Function}   config     Configuration parameters e.g. client_id, client_secret override or callback
         * @param  {Function} cb     
         * @return {}          Returns the HTTP status of 200 if the call is successful
         */
        activate: function activate(id, config, cb) {
            var activate_attributes = [
                {
                    "op": "replace",
                    "path": "/",
                    "value": {
                        "state": "ACTIVE"
                    }
                }
            ];
            api.executeHttp(defaultOptions, 'PATCH', this.baseURL + id, activate_attributes, config, cb);
        }
    };
    ret = generate.mixin(ret, operations);
    return ret;
}

module.exports = billingPlan;
