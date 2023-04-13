/* Copyright 2015-2016 PayPal, Inc. */
/* eslint-disable quotes, semi, indent, no-var, camelcase, quote-props, no-trailing-spaces, space-before-function-paren, comma-dangle */
"use strict";

var generate = require('../generate');
var api = require('../api');

/**
 * Retrieving, capturing, voiding, and reauthorizing previously created authorizations
 * @return {Object} authorization functions
 */
function authorization(defaultOptions) {
    var baseURL = '/v1/payments/authorization/';
    var operations = ['get', 'capture'];

    var ret = {
        defaultOptions: defaultOptions,
        baseURL: baseURL,
        /**
         * Void a previously authorized payment
         * @param  {String}   id     authorization identifier
         * @param  {Object|Function}   config     Configuration parameters e.g. client_id, client_secret override or callback
         * @param  {Function} cb        
         * @return {Object}          Authorization object
         */
        void: function voidAuthorization(id, config, cb) {
            api.executeHttp(defaultOptions, 'POST', this.baseURL + id + '/void', {}, config, cb);
        },
        /**
         * Reauthorize a PayPal account payment
         * @param  {String}   id     authorization identifier
         * @param  {object}   data   amount object with total e.g. 7.00 and currency e.g. USD
         * @param  {Object|Function}   config     Configuration parameters e.g. client_id, client_secret override or callback
         * @param  {Function} cb     
         * @return {}          
         */
        reauthorize: function reauthorize(id, data, config, cb) {
            api.executeHttp(defaultOptions, 'POST', this.baseURL + id + '/reauthorize', data, config, cb);
        },
    };
    ret = generate.mixin(ret, operations);
    return ret;
}

module.exports = authorization;
