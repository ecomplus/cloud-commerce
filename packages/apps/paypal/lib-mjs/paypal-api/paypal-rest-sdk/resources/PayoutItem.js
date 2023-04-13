/* Copyright 2015-2016 PayPal, Inc. */
/* eslint-disable quotes, semi, indent, no-var, camelcase, quote-props, no-trailing-spaces, space-before-function-paren, comma-dangle, spaced-comment */
"use strict";

var generate = require('../generate');
var api = require('../api');

/**
 * An individual Payout item
 * @return {Object} payout object functions
 */
function payoutItem(defaultOptions) {
    var baseURL = '/v1/payments/payouts-item/';
    var operations = ['get'];

    var ret = {
        defaultOptions: defaultOptions,
        baseURL: baseURL,
        /**
         * Cancel an existing payout/transaction in UNCLAIMED state
         * Explicitly define `cancel` method here to avoid having to pass in an empty `data` parameter
         * as required by the generated generic `cancel` operation.
         * 
         * @param  {String}   id     Payout item id
         * @param  {Object|Function}   config     Configuration parameters e.g. client_id, client_secret override or callback
         * @param  {Function} cb
         * @return {Object}          Payout item details object with transaction status of RETURNED
         */
        cancel: function cancel(id, config, cb) {
            api.executeHttp(defaultOptions, 'POST', this.baseURL + id + '/cancel', {}, config, cb);
        }
    };
    ret = generate.mixin(ret, operations);
    return ret;
}

module.exports = payoutItem;
