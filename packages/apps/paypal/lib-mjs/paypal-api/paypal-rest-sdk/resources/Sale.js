/* Copyright 2015-2016 PayPal, Inc. */
/* eslint-disable quotes, semi, indent, no-var, camelcase, quote-props, no-trailing-spaces, space-before-function-paren, comma-dangle, spaced-comment */
"use strict";

var generate = require('../generate');

/**
 * Completed payments are referred to as sale transactions
 * @return {Object} sale functions
 */
function sale(defaultOptions) {
    var baseURL = '/v1/payments/sale/';
    var operations = ['get', 'refund'];

    var ret = {
        defaultOptions: defaultOptions,
        baseURL: baseURL
    };
    ret = generate.mixin(ret, operations);
    return ret;
}

module.exports = sale;
