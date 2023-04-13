/* Copyright 2015-2016 PayPal, Inc. */
/* eslint-disable quotes, semi, indent, no-var, camelcase, quote-props, no-trailing-spaces, space-before-function-paren, comma-dangle, spaced-comment */
"use strict";

var generate = require('../generate');
var api = require('../api');

/**
 * Create, send and manage invoices, PayPal emails the customer with link to invoice
 * on PayPal's website. Customers can pay with PayPal, check, debit or credit card.
 * @return {Invoice} Invoice functions
 */
function invoice(defaultOptions) {
    var baseURL = '/v1/invoicing/invoices/';
    var operations = ['create', 'get', 'list', 'del', 'delete', 'cancel'];

    var ret = {
        defaultOptions: defaultOptions,
        baseURL: baseURL,
        search: function search(data, config, cb) {
            api.executeHttp(defaultOptions, 'POST', '/v1/invoicing/search', data, config, cb);
        },
        update: function update(id, data, config, cb) {
            api.executeHttp(defaultOptions, 'PUT', this.baseURL + id, data, config, cb);
        },
        send: function send(id, config, cb) {
            api.executeHttp(defaultOptions, 'POST', this.baseURL + id + '/send', {}, config, cb);
        },
        remind: function remind(id, data, config, cb) {
            api.executeHttp(defaultOptions, 'POST', this.baseURL + id + '/remind', data, config, cb);
        },
        recordPayment: function recordPayment(id, data, config, cb) {
            api.executeHttp(defaultOptions, 'POST', this.baseURL + id + '/record-payment', data, config, cb);
        },
        recordRefund: function recordRefund(id, data, config, cb) {
            api.executeHttp(defaultOptions, 'POST', this.baseURL + id + '/record-refund', data, config, cb);
        },
        deleteExternalPayment: function deleteExternalPayment(invoiceId, transactionId, config, cb) {
            api.executeHttp(defaultOptions, 'DELETE', this.baseURL + invoiceId + '/payment-records/' + transactionId, {}, config, cb);
        },
        deleteExternalRefund: function deleteExternalRefund(invoiceId, transactionId, config, cb) {
            api.executeHttp(defaultOptions, 'DELETE', this.baseURL + invoiceId + '/refund-records/' + transactionId, {}, config, cb);
        },
        generateNumber: function generateNumber(config, cb) {
            api.executeHttp(defaultOptions, "POST", this.baseURL + '/next-invoice-number', {}, config, cb);
        },
        /* Specify invoice ID to get a QR code corresponding to the invoice */
        qrCode: function qrCode(id, height, width, config, cb) {
            var image_attributes = {
                "height": height,
                "width": width
            };
            api.executeHttp(defaultOptions, 'GET', this.baseURL + id + '/qr-code', image_attributes, config, cb);
        }
    };
    ret = generate.mixin(ret, operations);
    return ret;
}

module.exports = invoice;
