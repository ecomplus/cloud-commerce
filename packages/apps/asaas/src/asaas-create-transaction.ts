import type {
  AppModuleBody,
  CreateTransactionResponse,
} from '@cloudcommerce/types';
import type { AxiosError } from 'axios';
import { getFirestore } from 'firebase-admin/firestore';
import config, { logger } from '@cloudcommerce/firebase/lib/config';
import {
  fullName as getFullname,
  phone as getPhone,
} from '@ecomplus/utils';
import { getAsaasAxios } from './util/asaas-api';
import { addInstallments } from './util/asaas-utils';

export default async (modBody: AppModuleBody<'create_transaction'>) => {
  const {
    application,
    params,
  } = modBody;
  const appData = {
    ...application.data,
    ...application.hidden_data,
  };
  if (appData.asaas_api_key) {
    process.env.ASAAS_API_KEY = appData.asaas_api_key;
  }
  process.env.ASAAS_ENV = appData.asaas_sandbox
    ? 'sandbox'
    : process.env.ASAAS_ENV || 'live';
  const { ASAAS_API_KEY } = process.env;
  if (!ASAAS_API_KEY) {
    logger.warn('Checkout missing Asaas API Key');
    return {
      error: 'NO_ASAAS_KEY',
      message: 'Chave de API não configurada (lojista deve configurar o aplicativo)',
    };
  }
  const asaasKeyId = `${ASAAS_API_KEY}`.substring(0, 6) + `${ASAAS_API_KEY}`.slice(-3);

  const {
    order_id: orderId,
    order_number: orderNumber,
    payment_method: paymentMethod,
    amount,
    buyer,
    billing_address: billingAddr,
    to: shippingAddr,
    domain,
  } = params;
  const customerAddr = billingAddr || shippingAddr;
  const asaasAxios = await getAsaasAxios();
  const transaction: CreateTransactionResponse['transaction'] = {
    amount: amount.total,
    status: {
      current: 'pending',
    },
  };

  try {
    const {
      data: {
        id: asaasCustomerId,
      },
    } = await asaasAxios.post('/v3/customers', {
      'name': buyer.fullname || getFullname(buyer) || customerAddr?.name || buyer.email,
      'cpfCnpj': buyer.doc_number,
      'email': buyer.email,
      'mobilePhone': getPhone(buyer) || undefined,
      'address': customerAddr?.street,
      'addressNumber': customerAddr?.number?.toString(),
      'complement': customerAddr?.complement,
      'province': customerAddr?.borough,
      'postalCode': customerAddr?.zip,
      // 'externalReference': buyer.customer_id,
      'notificationDisabled': false,
      'municipalInscription': buyer.inscription_type === 'Municipal'
        ? buyer.inscription_number
        : undefined,
      'stateInscription': buyer.inscription_type === 'State'
        ? buyer.inscription_number
        : undefined,
      'foreignCustomer': false,
      'observations': `Pedido ${orderNumber}`,
    });

    const methodConfig = appData[paymentMethod.code];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (methodConfig?.days_due_date || 1));
    const asaasPayment: Record<string, any> = {
      'customer': asaasCustomerId,
      'value': amount.total,
      'dueDate': `${dueDate.getFullYear()}`
        + `-${(dueDate.getMonth() + 1).toString().padStart(2, '0')}`
        + `-${dueDate.getDate().toString().padStart(2, '0')}`,
      'externalReference': orderId,
      'description': `Pedido ${orderNumber} ${domain}`,
      'callback': domain
        ? { 'successUrl': `https://${domain}/app/#/confirmation/${orderId}/` }
        : undefined,
    };
    if (paymentMethod.code === 'account_deposit') {
      asaasPayment.billingType = 'PIX';
      const docRef = getFirestore().doc('asaasSetup/pixKey');
      const docSnap = await docRef.get();
      if (docSnap.data()?.asaasKeyId !== asaasKeyId) {
        const {
          data: pixKeyData,
        } = await asaasAxios.post('/v3/pix/addressKeys', { 'type': 'EVP' });
        await docRef.set({ asaasKeyId, pixKeyData })
          .catch(logger.warn);
      }
    } else if (paymentMethod.code === 'banking_billet') {
      asaasPayment.billingType = 'BOLETO';
    } else if (
      paymentMethod.code === 'credit_card'
      || paymentMethod.code === 'balance_on_intermediary'
    ) {
      asaasPayment.billingType = 'CREDIT_CARD';
      const installmentsNumber = params.installments_number || 1;
      if (installmentsNumber > 1) {
        if (appData.installments) {
          const { gateway } = addInstallments(amount.total, appData.installments);
          const installmentOption = gateway.installment_options
            && gateway.installment_options
              .find(({ number }) => number === installmentsNumber);
          if (installmentOption?.value) {
            transaction.installments = installmentOption;
            const finalAmount = installmentOption.number * installmentOption.value;
            transaction.installments.total = finalAmount;
            asaasPayment.installmentCount = installmentsNumber;
            asaasPayment.installmentValue = installmentOption.value;
          }
        }
      }
    }

    const { data: asaasCreatedPayment } = await asaasAxios.post(
      paymentMethod.code === 'account_deposit'
        ? '/v3/lean/payments'
        : '/v3/payments/',
      asaasPayment,
    );
    const {
      id: asaasPaymentId,
      bankSlipUrl,
      invoiceUrl,
    } = asaasCreatedPayment;
    transaction.intermediator = {
      payment_method: {
        code: asaasPayment.billingType || params.payment_method.code,
      },
      transaction_id: asaasPaymentId,
      transaction_reference: asaasCustomerId,
    };
    transaction.payment_link = invoiceUrl;

    if (paymentMethod.code === 'account_deposit') {
      const {
        data: pixQrCodeData,
      } = await asaasAxios.get(`/v3/payments/${asaasPaymentId}/pixQrCode`);
      transaction.intermediator.transaction_code = pixQrCodeData.payload;
      const qrCodeSrc = `data:image/jpeg;base64,${pixQrCodeData.encodedImage}`;
      transaction.notes = `<img src="${qrCodeSrc}" style="display:block;margin:0 auto">`;
      if (pixQrCodeData.expirationDate) {
        transaction.account_deposit = {
          valid_thru: new Date(pixQrCodeData.expirationDate).toISOString(),
        };
      }
    } else if (paymentMethod.code === 'banking_billet' && bankSlipUrl) {
      const {
        data: bankSlipData,
      } = await asaasAxios.get(`/v3/lean/payments/${asaasPaymentId}/identificationField`);
      transaction.banking_billet = {
        link: bankSlipUrl,
        code: bankSlipData.barCode,
      };
      transaction.payment_link = bankSlipUrl;
    } else {
      if (!transaction.payment_link) {
        const { paymentLink } = asaasCreatedPayment;
        if (paymentLink && typeof paymentLink === 'string') {
          transaction.payment_link = paymentLink;
        }
      }
      if (!transaction.payment_link) {
        logger.warn('Unexpected Asaas credit card response without link', {
          asaasCreatedPayment,
          transaction,
        });
      }
    }

    const {
      storeId,
      httpsFunctionOptions,
      settingsContent,
    } = config.get();
    const locationId = httpsFunctionOptions.region;
    const appBaseUri = `https://${locationId}-${process.env.GCLOUD_PROJECT}.cloudfunctions.net`;
    const webhookUrl = `${appBaseUri}/asaas-webhook`;
    const docRef = getFirestore().doc('asaasSetup/webhook');
    const docSnap = await docRef.get();
    if (docSnap.data()?.asaasKeyId !== asaasKeyId) {
      try {
        const {
          data: webhookData,
        } = await asaasAxios.post('/v3/webhooks', {
          'name': `e-com.plus ${Date.now()}`,
          'url': webhookUrl,
          'email': appData.webhook_email || settingsContent.email,
          'enabled': true,
          'interrupted': false,
          'authToken': `${storeId}_${asaasKeyId}`,
          'sendType': 'SEQUENTIALLY',
          'events': [
            'PAYMENT_CREDIT_CARD_CAPTURE_REFUSED',
            'PAYMENT_AWAITING_CHARGEBACK_REVERSAL',
            'PAYMENT_CHARGEBACK_DISPUTE',
            'PAYMENT_CHARGEBACK_REQUESTED',
            'PAYMENT_RECEIVED_IN_CASH_UNDONE',
            'PAYMENT_REFUND_IN_PROGRESS',
            'PAYMENT_REFUNDED',
            'PAYMENT_RESTORED',
            'PAYMENT_DELETED',
            'PAYMENT_RECEIVED',
            'PAYMENT_CONFIRMED',
            'PAYMENT_REPROVED_BY_RISK_ANALYSIS',
            'PAYMENT_AWAITING_RISK_ANALYSIS',
          ],
        });
        await docRef.set({ asaasKeyId, webhookData })
          .catch(logger.warn);
      } catch (_err) {
        const err = _err as AxiosError;
        logger.warn('Failed saving Asaas webhook', {
          url: err.config?.url,
          request: err.config?.data,
          response: err.response?.data,
          status: err.response?.status,
        });
        logger.error(err);
      }
    }

    return {
      redirect_to_payment: Boolean(
        paymentMethod.code !== 'account_deposit' && transaction.payment_link,
      ),
      transaction,
    };
  } catch (_err) {
    const err = _err as AxiosError;
    logger.warn(`Failed payment for ${orderId}`, {
      orderNumber,
      url: err.config?.url,
      request: err.config?.data,
      response: err.response?.data,
      status: err.response?.status,
    });
    logger.error(err);
    return {
      error: 'ASAAS_TRANSACTION_ERROR',
      message: err.message,
    };
  }
};
