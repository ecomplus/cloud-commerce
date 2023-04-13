/* Copyright 2015-2016 PayPal, Inc. */
/* eslint-disable quotes, semi, indent, no-var, camelcase, quote-props */
"use strict";

var constants = require('./constants');
var api = require('./api');

module.exports = function () {
    const defaultOptions = {
        mode: 'sandbox',
        schema: 'https',
        host: 'api.sandbox.paypal.com',
        port: '',
        openid_connect_schema: 'https',
        openid_connect_host: 'api.sandbox.paypal.com',
        openid_connect_port: '',
        authorize_url: 'https://www.sandbox.paypal.com/signin/authorize',
        logout_url: 'https://www.sandbox.paypal.com/webapps/auth/protocol/openidconnect/v1/endsession',
        headers: {}
    }

    function configure (options) {
        api.configure(defaultOptions, options);
    }

    function generateToken (config, cb) {
        api.generateToken(defaultOptions, config, cb);
    }

    return {
        version: constants.sdkVersion,
        configure: configure,
        configuration: defaultOptions,
        generateToken: generateToken,
        payment: require('./resources/Payment')(defaultOptions),
        sale: require('./resources/Sale')(defaultOptions),
        refund: require('./resources/Refund')(defaultOptions),
        authorization: require('./resources/Authorization')(defaultOptions),
        capture: require('./resources/Capture')(defaultOptions),
        order: require('./resources/Order')(defaultOptions),
        payout: require('./resources/Payout')(defaultOptions),
        payoutItem: require('./resources/PayoutItem')(defaultOptions),
        billingPlan: require('./resources/BillingPlan')(defaultOptions),
        billingAgreement: require('./resources/BillingAgreement')(defaultOptions),
        creditCard: require('./resources/CreditCard')(defaultOptions),
        invoice: require('./resources/Invoice')(defaultOptions),
        invoiceTemplate: require('./resources/InvoiceTemplate')(defaultOptions),
        openIdConnect: require('./resources/OpenIdConnect')(defaultOptions),
        webProfile: require('./resources/WebProfile')(defaultOptions),
        notification: require('./resources/Notification')(defaultOptions),
        // entries below are deprecated but provided for compatibility with 0.* versions
        generate_token: generateToken,
        billing_plan: require('./resources/BillingPlan')(defaultOptions),
        billing_agreement: require('./resources/BillingAgreement')(defaultOptions),
        credit_card: require('./resources/CreditCard')(defaultOptions),
        openid_connect: require('./resources/OpenIdConnect')(defaultOptions)
    };
};
