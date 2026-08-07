import type { Orders } from '@cloudcommerce/types';
import type Bling from '../../bling-auth/client';
import { URLSearchParams } from 'url';
import ecomUtils from '@ecomplus/utils';
import { logger } from '@cloudcommerce/firebase/lib/config';
import parseAddress from '../parsers/address-to-bling';

export default async (
  bling: Bling,
  appData: Record<string, any>,
  order: Orders,
) => {
  const contatTypeClientId = appData.other_config?._contatTypeClientId
    || appData.outher_config?._contatTypeClientId;
  const buyer = order.buyers?.[0];

  let contato: Record<string, any> | undefined;
  if (buyer?.doc_number) {
    const params = new URLSearchParams({
      numeroDocumento: buyer.doc_number,
      criterio: '1', // Todos
    });
    contato = await bling.get(`/contatos?${params.toString()}`)
      .then(({ data }) => data?.data?.[0])
      .catch((err: any) => {
        logger.warn(`Failed listing Bling contacts: ${err.message}`);
        return undefined;
      });
    if (contato && contato.situacao === 'A') {
      return contato.id;
    }
  }

  const shippingLine = order.shipping_lines?.[0];
  const transaction = order.transactions?.[0];
  const shippingAddress = shippingLine && shippingLine.to;
  const billingAddress = transaction && transaction.billing_address;
  let body: Record<string, any>;

  if (buyer) {
    const blingCustomer: Record<string, any> = {
      nome: (buyer.corporate_name || ecomUtils.fullName(buyer)).substring(0, 30)
        || `Comprador de #${order.number}`,
      tipo: buyer.registry_type === 'j' ? 'J' : 'F',
    };
    if (buyer.doc_number && buyer.doc_number.length <= 18) {
      blingCustomer.numeroDocumento = buyer.doc_number;
    }
    if (!appData.disable_buyer_inscription) {
      if (
        buyer.inscription_number
        && buyer.inscription_number.length <= 18
        && buyer.inscription_type !== 'Municipal'
      ) {
        blingCustomer.ie = buyer.inscription_number;
      }
    }
    if (buyer.main_email && buyer.main_email.length <= 60) {
      blingCustomer.email = buyer.main_email;
      blingCustomer.emailNotaFiscal = buyer.main_email;
    }
    if (buyer.phones) {
      ['celular', 'tel'].forEach((blingCustomerField, i) => {
        const phoneNumber = buyer.phones?.[i]?.number;
        if (phoneNumber && phoneNumber.length >= 9 && phoneNumber.length <= 11) {
          blingCustomer[blingCustomerField] = phoneNumber.length === 9
            ? `11${phoneNumber}`
            : phoneNumber;
        }
      });
    }
    let cobranca: Record<string, any> | undefined;
    let geral: Record<string, any> | undefined;
    if (billingAddress) {
      cobranca = {};
      parseAddress(billingAddress, cobranca);
    }
    if (shippingAddress) {
      geral = {};
      parseAddress(shippingAddress, geral);
    }
    blingCustomer.endereco = { cobranca, geral };
    body = blingCustomer;
  } else {
    body = {
      nome: `Comprador de #${order.number}`,
    };
  }

  if (contatTypeClientId) {
    body.tiposContato = { id: contatTypeClientId };
  }
  body.situacao = 'A';

  const method = contato ? 'put' : 'post';
  const endpoint = `/contatos${contato ? `/${contato.id}` : ''}`;
  return bling[method](endpoint, body)
    .then(({ data }) => (contato ? contato.id : data?.data?.id))
    .catch((err: any) => {
      if (err.response) {
        logger.warn(`Failed saving Bling contact: ${JSON.stringify(err.response.data)}`);
      } else {
        logger.error(err);
      }
      return undefined;
    });
};
