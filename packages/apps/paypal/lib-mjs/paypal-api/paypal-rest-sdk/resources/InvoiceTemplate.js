/* Copyright 2015-2016 PayPal, Inc. */
/* eslint-disable quotes, semi, indent, no-var, camelcase, quote-props, no-trailing-spaces, space-before-function-paren, comma-dangle, spaced-comment */
"use strict";

var generate = require('../generate');
var api = require('../api');

function invoiceTemplate(defaultOptions) {
    var baseURL = '/v1/invoicing/templates/';
    var operations = ['create', 'get', 'list', 'delete'];

    var ret = {
        defaultOptions: defaultOptions,
        baseURL: baseURL,
        update: function update(id, data, config, cb) {
            api.executeHttp(defaultOptions, 'PUT', this.baseURL + id, data, config, cb);
        }
    };

    ret = generate.mixin(ret, operations);
    return ret;
}

module.exports = invoiceTemplate;
