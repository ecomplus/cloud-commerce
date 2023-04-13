/* Copyright 2015-2016 PayPal, Inc. */
/* eslint-disable quotes, semi, indent, no-var, camelcase, quote-props, no-trailing-spaces, space-before-function-paren, comma-dangle, spaced-comment */
"use strict";

var generate = require('../generate');

/**
 * Look up and refund captured payments
 * @return {Object} capture functions
 */
function capture(defaultOptions) {
    var baseURL = '/v1/payments/capture/';
    var operations = ['get', 'refund'];

    var ret = {
        defaultOptions: defaultOptions,
        baseURL: baseURL
    };
    ret = generate.mixin(ret, operations);
    return ret;
}

module.exports = capture;
