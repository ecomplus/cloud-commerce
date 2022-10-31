import type { TemplateData, Template } from './types';
import api from '@cloudcommerce/api';
import * as transactionalMails from '@ecomplus/transactional-mails';

export default async (
  templateData: TemplateData,
  template: Template,
) => {
  let { store, lang } = templateData;
  const {
    cart,
    order,
    customer,
    customMessage,
    product,
  } = templateData;

  if (!store) {
    store = (await api.get('stores/me')).data;
  }

  lang = lang || 'pt_br';

  switch (template) {
    case 'welcome':
      return transactionalMails[template](
        store,
        customer,
        lang,
        customMessage,
      );
    case 'abandonedCart':
      return transactionalMails[template](store, customer, cart, lang, customMessage);
    case 'authorized':
    case 'delivered':
    case 'inDispute':
    case 'inProduction':
    case 'inSeparation':
    case 'invoiceIssued':
    case 'new_order':
    case 'paid':
    case 'partiallyDelivered':
    case 'partiallyPaid':
    case 'partiallyRefunded':
    case 'partiallyShipped':
    case 'pending':
    case 'readyForShipping':
    case 'receivedForExchange':
    case 'refunded':
    case 'returned':
    case 'returnedForExchange':
    case 'shipped':
    case 'unauthorized':
    case 'underAnalysis':
    case 'voided':
      return transactionalMails[template](
        store,
        customer,
        order,
        lang,
        customMessage,
      );
    case 'promo':
    case 'stock':
      return transactionalMails[template](
        store,
        customer,
        product,
        lang,
        customMessage,
      );
    default:
      return null;
  }
};
