/* Copyright 2015-2016 PayPal, Inc. */
/* eslint-disable quotes, semi, indent, no-var, camelcase, quote-props, no-trailing-spaces, space-before-function-paren, comma-dangle, spaced-comment */
"use strict";

var client = require('../client');
var utils = require('../utils');
var querystring = require('querystring');

/**
 * Sets up request body for open id connect module requests
 * @param  {String}   path              url endpoint
 * @param  {Object}   data              Payload for HTTP Request
 * @param  {Object|Function}   config   Configuration parameters such as authorization code or refresh token
 * @param  {Function} cb     
 */
function openIdConnectRequest(defaultOptions, path, data, config, cb) {
    var http_options = {
        schema: config.openid_connect_schema || defaultOptions.openid_connect_schema,
        host: utils.getDefaultApiEndpoint(config.mode) || config.openid_connect_host,
        port: config.openid_connect_port || defaultOptions.openid_connect_port,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    //Populate Basic Auth header only for endpoints that need it such as tokeninfo
    if (data.client_id && data.client_secret) {
        http_options.headers.Authorization = 'Basic ' + Buffer.from(data.client_id + ':' + data.client_secret).toString('base64');
    }

    client.invoke(defaultOptions, 'POST', path, querystring.stringify(data), http_options, cb);
}

/**
 * @param  {Object} config Configurations for settings and Auth
 * @return {String}        client id
 */
function getClientId(defaultOptions, config) {
    return config.openid_client_id || config.client_id ||
        defaultOptions.openid_client_id || defaultOptions.client_id;
}

/**
 * @param  {Object} config Configurations for settings and Auth
 * @return {String}        client secret
 */
function getClientSecret(defaultOptions, config) {
    return config.openid_client_secret || config.client_secret ||
        defaultOptions.openid_client_secret || defaultOptions.client_secret;
}

/**
 * Configurations for settings and Auth
 * @return {String}        redirect uri
 */
function getRedirectUri(defaultOptions, config) {
    return config.openid_redirect_uri || defaultOptions.openid_redirect_uri;
}

/**
 * Obtain a user’s consent to make Identity API calls on their behalf by redirecting them
 * to authorization endpoint
 * @param  {Data}   data      Payload associated with API request
 * @param  {Object} config    Configurations for settings and Auth
 * @return {String}        authorize url
 */
function authorizeUrl(defaultOptions, data, config) {
    config = config || defaultOptions;
    data = data || {};

    //Use mode provided, live or sandbox to construct authorize_url, sandbox is default
    var url = 'https://www.' + utils.getDefaultEndpoint(config.mode) + '/signin/authorize' || config.authorize_url;

    data = utils.merge({
        'client_id': getClientId(defaultOptions, config),
        'scope': 'openid',
        'response_type': 'code',
        'redirect_uri': getRedirectUri(defaultOptions, config)
    }, data);

    return url + '?' + querystring.stringify(data);
}

/**
 * Direct user to logout url to end session
 * @param  {Data}   data      Payload associated with API request
 * @param  {Object} config    Configurations for settings and Auth
 * @return {String}        logout url
 */
function logoutUrl(defaultOptions, data, config) {
    config = config || defaultOptions;
    data = data || {};

    var url = 'https://www.' + utils.getDefaultEndpoint(config.mode) + '/webapps/auth/protocol/openidconnect/v1/endsession' || config.logout_url;

    if (typeof data === 'string') {
        data = { 'id_token': data };
    }

    data = utils.merge({
        'logout': 'true',
        'redirect_uri': getRedirectUri(defaultOptions, config)
    }, data);

    return url + '?' + querystring.stringify(data);
}

/**
 * Grant a new access token, using a refresh token
 * @param  {Object}   data   Payload associated with API request
 * @param  {Object|Function}   config Configurations for settings and Auth
 * @param  {Function} cb     Callback function
 */
function tokenInfoRequest(defaultOptions, data, config, cb) {
    if (typeof config === 'function') {
        cb = config;
        config = defaultOptions;
    } else if (!config) {
        config = defaultOptions;
    }

    data = utils.merge({
        'client_id': getClientId(defaultOptions, config),
        'client_secret': getClientSecret(defaultOptions, config)
    }, data);

    openIdConnectRequest(defaultOptions, '/v1/identity/openidconnect/tokenservice', data, config, cb);
}

/**
 * Retrieve user profile attributes
 * @param  {Object}   data   Payload associated with API request
 * @param  {Object|Function}   config Configurations for settings and Auth
 * @param  {Function} cb     Callback function
 */
function userInfoRequest(defaultOptions, data, config, cb) {
    if (typeof config === 'function') {
        cb = config;
        config = defaultOptions;
    } else if (!config) {
        config = defaultOptions;
    }

    if (typeof data === 'string') {
        data = { 'access_token': data };
    }

    data = utils.merge({
        'schema': 'openid'
    }, data);

    openIdConnectRequest(defaultOptions, '/v1/identity/openidconnect/userinfo', data, config, cb);
}

/**
 * Use log in with PayPal to avoid storing user data on the system
 * @return {Object} openidconnect functions
 */
function openIdConnect(defaultOptions) {
    return {
        tokeninfo: {
            create: function (data, config, cb) {
                if (typeof data === 'string') {
                    data = { 'code': data };
                }
                data.grant_type = 'authorization_code';
                tokenInfoRequest(defaultOptions, data, config, cb);
            },
            refresh: function (data, config, cb) {
                if (typeof data === 'string') {
                    data = { 'refresh_token': data };
                }
                data.grant_type = 'refresh_token';
                tokenInfoRequest(defaultOptions, data, config, cb);
            }
        },
        authorizeUrl: function () {
            authorizeUrl(defaultOptions)
        },
        logoutUrl: function () {
            logoutUrl(defaultOptions)
        },
        userinfo: {
            get: function () {
                userInfoRequest(defaultOptions)
            }
        },
        //entries below are deprecated but provided for compatibility with 0.* versions
        authorize_url: function () {
            authorizeUrl(defaultOptions)
        },
        logout_url: function () {
            logoutUrl(defaultOptions)
        }
    };
}

module.exports = openIdConnect;
