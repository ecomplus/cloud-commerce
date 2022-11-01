import type { TemplateData, Template } from './types';
import logger from 'firebase-functions/logger';
import * as transactionalMails from '@ecomplus/transactional-mails';

export default async (
  templateData: TemplateData,
  template: Template,
) => {
  try {
    let { lang } = templateData;
    const {
      store,
      cart,
      order,
      customer,
      customMessage,
      product,
    } = templateData;

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
        return cart
          ? transactionalMails[template](store, customer, cart, lang, customMessage)
          : null;
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
        return order
          ? transactionalMails[template](store, customer, order, lang, customMessage)
          : null;
      case 'promo':
      case 'stock':
        return product
          ? transactionalMails[template](store, customer, product, lang, customMessage)
          : null;
      default:
        return null;
    }
  } catch (err) {
    logger.error(err);
    return null;
  }
};
