import type { Orders } from '@cloudcommerce/types';

export default (situacao: string) => {
  let financialStatus: Exclude<Orders['financial_status'], undefined>['current'] | undefined;
  let fulfillmentStatus: Exclude<Orders['fulfillment_status'], undefined>['current'] | undefined;
  switch (situacao) {
    case 'aprovado':
      financialStatus = 'paid';
      break;
    case 'preparando_envio':
    case 'preparando envio':
      fulfillmentStatus = 'in_separation';
      break;
    case 'faturado':
    case 'faturado (atendido)':
    case 'atendido':
      fulfillmentStatus = 'invoice_issued';
      break;
    case 'pronto_envio':
    case 'pronto para envio':
      fulfillmentStatus = 'ready_for_shipping';
      break;
    case 'enviado':
      fulfillmentStatus = 'shipped';
      break;
    case 'entregue':
      fulfillmentStatus = 'delivered';
      break;
    case 'cancelado':
      financialStatus = 'voided';
      break;
    default:
  }
  return { financialStatus, fulfillmentStatus };
};
