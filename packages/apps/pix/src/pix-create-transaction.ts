import type { AxiosInstance } from 'axios';
import type {
  AppModuleBody,
  CreateTransactionParams,
  CreateTransactionResponse,
} from '@cloudcommerce/types';
import { getFirestore } from 'firebase-admin/firestore';
import logger from 'firebase-functions/logger';
import config from '@cloudcommerce/firebase/lib/config';
import axios from 'axios';
import { responseError } from './pix-list-payments';
import Pix from './functions-lib/pix-auth/construtor';
import getPfx from './functions-lib/get-certificate';

const saveToDb = (
  clientId: string,
  clientSecret: string,
  pixApi: any,
  pixAxios: AxiosInstance,
  configApp: { [x: string]: any },
  baseUri: string,
) => {
  return new Promise((resolve) => {
    getFirestore().doc(`pixSetup/${clientId}:${clientSecret}`).get()
      .then((documentSnapshot) => {
        if (!documentSnapshot.exists || !documentSnapshot.get('hasWebhook')) {
          const rand = String(Date.now());
          return documentSnapshot.ref
            .set({
              pixApi,
              rand,
              createdAt: new Date().toISOString(),
            })
            .then(() => pixAxios({
              url: `/v2/webhook/${configApp.pix_key}`,
              method: 'PUT',
              data: {
                webhookUrl: `${baseUri}/pix-webhook/${rand}`,
              },
            }))

            .then(() => {
              documentSnapshot.ref
                .set({ hasWebhook: true }, { merge: true })
                .catch(logger.error);

              resolve(true);
            })
            .catch((err) => {
              logger.error('(App:Pix) Error saving firestore => ', err);
              resolve(false);
            });
        }
        resolve(false);
        return null;
      })
      .catch((err) => {
        logger.error('(App:Pix) Error saving firestore => ', err);
        resolve(false);
      });
  });
};

export default async (appData: AppModuleBody) => {
  const locationId = config.get().httpsFunctionOptions.region;
  const baseUri = `https://${locationId}-${process.env.GCLOUD_PROJECT}.cloudfunctions.net`;
  // body was already pre-validated on @/bin/web.js
  // treat module request body
  const { application } = appData;
  const params = appData.params as CreateTransactionParams;
  // app configured options
  const configApp = { ...application.data, ...application.hidden_data };

  const {
    amount,
    buyer,
    payer,
    items,
  } = params;

  const orderId = params.order_id;
  logger.log('>(App:Pix) Transaction #', orderId);

  // https://apx-mods.e-com.plus/api/v1/create_transaction/response_schema.json?store_id=100
  const transaction: CreateTransactionResponse['transaction'] = {
    amount: amount.total,
  };

  const pixApi = configApp.pix_api;
  let pfx;
  try {
    pfx = await getPfx(pixApi.certificate);
  } catch (e) {
    logger.error(e);
    return responseError(409, 'INVALID_PIX_CERTIFICATE', 'Arquivo de certificado não encontrado ou inválido');
  }

  let baseURL: string | undefined;
  if (pixApi.host && typeof pixApi.host === 'string') {
    baseURL = pixApi.host.startsWith('http') ? pixApi.host : `https://${pixApi.host}`;
  }
  const isGerencianet = Boolean(baseURL && baseURL.indexOf('gerencianet.') > -1);
  // const clientId = pixApi.client_id;
  // const clientSecret = pixApi.client_secret;

  let clientId: string;
  let clientSecret: string;
  let tokenData: string;

  if (process.env.PIX_CREDENTIALS) {
    try {
      const pixCredentials = JSON.parse(process.env.PIX_CREDENTIALS);
      clientId = pixCredentials.client_id;
      clientSecret = pixCredentials.client_secret;
      tokenData = pixCredentials.authentication;
    } catch (e) {
      logger.error(e);

      clientId = pixApi.client_id;
      clientSecret = pixApi.client_secret;
      tokenData = pixApi.authentication;
    }
  } else {
    clientId = pixApi.client_id;
    clientSecret = pixApi.client_secret;
    tokenData = pixApi.authentication;
  }

  const pix = new Pix({
    clientId,
    clientSecret,
    pfx,
    baseURL,
    oauthEndpoint: pixApi.oauth_endpoint,
    tokenData,
  });

  let pixCob: { [key: string]: any } | undefined;

  try {
    await pix.preparing;

    let txid = [...Array(32)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    let docNumber: string;
    let registryType: string;
    let fullname: string;

    if (payer && payer.doc_number) {
      docNumber = payer.doc_number;
      registryType = payer.doc_number.length === 11 ? 'p' : 'j';
      fullname = payer.fullname || buyer.fullname;
    } else {
      docNumber = buyer.doc_number;
      registryType = buyer.registry_type;
      fullname = buyer.fullname;
    }

    pixCob = {
      calendario: {
        expiracao: (configApp.pix_expiration || 60) * 60,
      },
      devedor: {
        [registryType === 'j' ? 'cnpj' : 'cpf']: docNumber,
        nome: fullname,
      },
      valor: {
        original: amount.total.toFixed(2),
      },
      chave: configApp.pix_key,
      infoAdicionais: [{
        nome: 'pedido',
        valor: `Pedido #${params.order_number} na loja ${params.domain}`,
      }],
    };

    if (typeof configApp.pix_input === 'string' && configApp.pix_input.length > 3) {
      const solicitacaoPagador = configApp.pix_input.substring(0, 140);
      Object.assign(pixCob, { solicitacaoPagador });
    }
    if (typeof configApp.pix_info === 'string' && configApp.pix_info.length > 3) {
      pixCob.infoAdicionais.unshift({
        nome: 'texto',
        valor: configApp.pix_info.substring(0, 200),
      });
    }

    items.forEach((item, i) => {
      if (pixCob) {
        pixCob.infoAdicionais.push({
          nome: `item_${(i + 1)}`,
          valor: `${item.quantity}x ${(item.name || item.sku)}`.substring(0, 200),
        });
      }
    });

    pixCob.infoAdicionais.push({
      nome: 'ecom_order_id',
      valor: String(orderId),
    });

    if (pix.axios) {
      let { data } = await pix.axios({
        url: `/v2/cob/${txid}`,
        method: 'PUT',
        data: pixCob,
      });
      if (data) {
        const { loc } = data;
        txid = data.txid;

        const location = (loc && loc.location) || data.location;
        const pixCodeHost = 'https://gerarqrcodepix.com.br/api/v1';
        const pixCodeParams = `&location=${location}`
          + `&nome=${encodeURIComponent(configApp.pix_receiver || params.domain)}`
          + `&cidade=${encodeURIComponent(configApp.pix_city || params.domain)}`;
        const qrCodeUrl = `${pixCodeHost}?pim=12&saida=qr${pixCodeParams}`;
        let qrCodeSrc = qrCodeUrl;
        const brCodeUrl = `${pixCodeHost}?saida=br${pixCodeParams}`;

        try {
          if (isGerencianet && loc && loc.id) {
            const res = await pix.axios.get(`/v2/loc/${loc.id}/qrcode`);
            qrCodeSrc = res.data.imagemQrcode;
          } else {
            throw new Error('Retry');
          }
        } catch (err: any) {
          data = (await axios.get(brCodeUrl)).data;
        }

        if (data) {
          transaction.intermediator = {
            payment_method: params.payment_method,
            transaction_id: txid,
            transaction_code: data.brcode || data.qrcode,
          };
          transaction.payment_link = qrCodeUrl;
          transaction.notes = `<img src="${qrCodeSrc}" style="display:block;margin:0 auto">`;

          await saveToDb(clientId, clientSecret, pixApi, pix.axios, configApp, baseUri);

          return {
            status: 200,
            redirect_to_payment: false,
            transaction,
          };
        }
        return responseError(409, 'PIX_REQUEST_ERR_', 'QRCode not found');
      }
      return responseError(409, 'PIX_REQUEST_ERR_', 'Unexpected error creating charge');
    }
    return responseError(409, 'PIX_REQUEST_ERR_', 'Axios instance not created');
  } catch (error: any) {
    logger.error(error);
    // try to debug request error
    let errCode = 'PIX_COB_ERR_';
    let { message } = error;

    const err = {
      message: `PIX_COB_ERR_ Order: #${orderId} => ${message}`,
      payment: '',
      status: 0,
      response: '',
    };

    if (error.response) {
      const { status, data } = error.response;
      if (status !== 401 && status !== 403) {
        err.payment = JSON.stringify(pixCob);
        err.status = status;
        errCode += status;
        if (typeof data === 'object' && data) {
          err.response = JSON.stringify(data);
        } else {
          err.response = data;
        }
      } else if (data && data.mensagem) {
        message = data.mensagem;
      }
    }
    // logger.error('(App:Pix) Error => ', err);

    return responseError(409, errCode, message);
  }
};
