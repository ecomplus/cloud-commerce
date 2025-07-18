import type { AxiosInstance, AxiosError } from 'axios';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import axios from 'axios';
import config, { logger } from '@cloudcommerce/firebase/lib/config';

let _paypalAxios: AxiosInstance | undefined;
let _tokenExpiresAt: number | undefined;

export const getPaypalAxios = async () => {
  if (_tokenExpiresAt && Date.now() > _tokenExpiresAt - 9000) {
    _paypalAxios = undefined;
    _tokenExpiresAt = undefined;
  }
  if (_paypalAxios) return _paypalAxios;
  const {
    PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET,
    PAYPAL_ENV,
  } = process.env;
  const baseURL = PAYPAL_ENV === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com/'
    : 'https://api-m.paypal.com/';
  let token: string | undefined;
  const docRef = getFirestore().doc(`paypalTokens/${PAYPAL_CLIENT_ID}`);
  const docSnap = await docRef.get();
  if (docSnap.exists) {
    const { data, expiresAt } = (docSnap.data() || {}) as {
      data?: Record<string, string>,
      expiresAt?: Timestamp,
    };
    _tokenExpiresAt = expiresAt && expiresAt.toMillis();
    if (_tokenExpiresAt && _tokenExpiresAt > Date.now() + 9000) {
      token = data?.access_token;
    }
  }
  if (!token) {
    try {
      const { data } = await axios.post(
        '/v1/oauth2/token',
        'grant_type=client_credentials',
        {
          baseURL,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          auth: {
            username: PAYPAL_CLIENT_ID!,
            password: PAYPAL_CLIENT_SECRET!,
          },
        },
      );
      if (data?.access_token) {
        _tokenExpiresAt = data.expires_in
          ? Date.now() + (data.expires_in * 1000)
          : Date.now() + (9 * 60 * 60 * 1000);
        docRef.set({
          data,
          expiresAt: Timestamp.fromMillis(_tokenExpiresAt),
        }).catch(logger.warn);
        token = data.access_token;
      }
    } catch (_err) {
      const err = _err as AxiosError;
      logger.warn(`Cannot generate PayPal token (${err.response?.status})'`, {
        response: err.response?.data,
      });
      throw _err;
    }
  }
  if (!token) {
    throw new Error('Missing PayPal access token');
  }
  _paypalAxios = axios.create({
    baseURL,
    headers: { Authorization: `Bearer ${token}` },
  });
  return _paypalAxios;
};

export const createPaypalPayment = async (paypalPayment: Record<string, any>) => {
  const paypalAxios = await getPaypalAxios();
  const { data } = await paypalAxios.post('/v1/payments/payment', paypalPayment);
  return data as Record<string, any>;
};

export const readPaypalPayment = async (paymentId: string) => {
  const paypalAxios = await getPaypalAxios();
  const { data } = await paypalAxios.get(`/v1/payments/payment/${paymentId}`);
  return data as Record<string, any>;
};

export const editPaypalPayment = async (
  paymentId: string,
  paypalPaymentEdit: Array<Record<string, any>>,
) => {
  const paypalAxios = await getPaypalAxios();
  const { data } = await paypalAxios
    .patch(`/v1/payments/payment/${paymentId}`, paypalPaymentEdit);
  return data as Record<string, any>;
};

export const executePaypalPayment = async (
  paymentId: string,
  paypalPaymentExecute: Record<string, any> & { payer_id: string },
) => {
  const paypalAxios = await getPaypalAxios();
  const { data } = await paypalAxios
    .post(`/v1/payments/payment/${paymentId}/execute/`, paypalPaymentExecute);
  return data as Record<string, any>;
};

export const createPaypalProfile = async () => {
  const { settingsContent } = config.get();
  return (await getPaypalAxios()).post('/v1/payment-experience/web-profiles/', {
    name: `EComPlus_${Date.now()}`,
    presentation: {
      brand_name: settingsContent.name || 'Loja Virtual',
      logo_image: settingsContent.logo
        || 'https://www.paypalobjects.com/webstatic/mktg/logo/AM_SbyPP_mc_vs_dc_ae.jpg',
      locale_code: settingsContent.countryCode || 'BR',
    },
    input_fields: {
      allow_note: true,
      no_shipping: 1,
      address_override: 1,
    },
    flow_config: {
      landing_page_type: 'billing',
      bank_txn_pending_url: settingsContent.domain
        ? `https://${settingsContent.domain}/app/#/confirmation/`
        : 'http://www.yeowza.com',
    },
  });
};

export const createPaypalWebhook = async () => {
  const locationId = config.get().httpsFunctionOptions.region;
  const appBaseUri = `https://${locationId}-${process.env.GCLOUD_PROJECT}.cloudfunctions.net`;
  return (await getPaypalAxios()).post('/v1/notifications/webhooks', {
    url: `${appBaseUri}/paypal-webhook`,
    event_types: [
      // v2
      'PAYMENT.AUTHORIZATION.CREATED',
      'PAYMENT.AUTHORIZATION.VOIDED',
      'PAYMENT.CAPTURE.COMPLETED',
      'PAYMENT.CAPTURE.DENIED',
      'PAYMENT.CAPTURE.PENDING',
      'PAYMENT.CAPTURE.REFUNDED',
      'PAYMENT.CAPTURE.REVERSED',
      // v1
      'PAYMENT.SALE.PENDING',
      'PAYMENT.SALE.DENIED',
      'PAYMENT.SALE.COMPLETED',
      'PAYMENT.SALE.REFUNDED',
      'PAYMENT.SALE.REVERSED',
      'PAYMENT.PAYOUTSBATCH.PROCESSING',
      'PAYMENT.PAYOUTSBATCH.SUCCESS',
      'PAYMENT.PAYOUTSBATCH.DENIED',
      'RISK.DISPUTE.CREATED',
    ].map((name) => ({ name })),
  }).catch((_err) => {
    const err = _err as AxiosError<any>;
    if (err.response?.data?.name === 'WEBHOOK_URL_ALREADY_EXISTS') {
      return null;
    }
    throw err;
  });
};

export const readPaypalWebhookEvent = async (eventId: string) => {
  const paypalAxios = await getPaypalAxios();
  const { data } = await paypalAxios.get(`/v1/notifications/webhooks-events/${eventId}`);
  return data as Record<string, any>;
};
