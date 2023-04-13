/* Copyright 2015-2016 PayPal, Inc. */
/* eslint-disable quotes, semi, indent, no-var, camelcase, quote-props, no-trailing-spaces, space-before-function-paren, comma-dangle, spaced-comment */
"use strict";

var generate = require('../generate');

/**
 * Refunds on direct and captured payments
 * @return {Object} refund functions
 */
function refund(defaultOptions) {
    var baseURL = '/v1/payments/refund/';
    var operations = ['get'];

    var ret = {
        defaultOptions: defaultOptions,
        baseURL: baseURL
    };
    ret = generate.mixin(ret, operations);
    return ret;
}

module.exports = refund;
