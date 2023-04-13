/* Copyright 2015-2016 PayPal, Inc. */
/* eslint-disable quotes, semi, indent, no-var, camelcase, quote-props, no-trailing-spaces, space-before-function-paren, comma-dangle, spaced-comment */
"use strict";

var generate = require('../generate');

/**
 * Store credit cards information securely in vault
 * @return {Object} Credit Card functions
 */
function creditCard(defaultOptions) {
    var baseURL = '/v1/vault/credit-cards/';
    var operations = ['create', 'get', 'update', 'del', 'delete', 'list'];

    var ret = {
        defaultOptions: defaultOptions,
        baseURL: baseURL
    };
    ret = generate.mixin(ret, operations);
    return ret;
}

module.exports = creditCard;
