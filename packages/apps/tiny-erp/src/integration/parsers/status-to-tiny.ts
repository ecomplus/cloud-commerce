import type { Orders } from '@cloudcommerce/types';

const parseStatusToTiny = (order: Orders) => {
  const financialStatus = order.financial_status && order.financial_status.current;
  switch (financialStatus) {
    case 'pending':
    case 'under_analysis':
    case 'unknown':
    case 'authorized':
    case 'partially_paid':
      return 'aberto';
    case 'voided':
    case 'refunded':
    case 'in_dispute':
    case 'unauthorized':
      return 'cancelado';
    default:
  }
  switch (order.fulfillment_status && order.fulfillment_status.current) {
    case 'in_production':
    case 'in_separation':
      return 'preparando_envio';
    case 'invoice_issued':
      return 'faturado';
    case 'ready_for_shipping':
      return 'pronto_envio';
    case 'shipped':
    case 'partially_shipped':
      return 'enviado';
    case 'delivered':
      return 'entregue';
    case 'returned':
      return 'cancelado';
    default:
  }
  if (financialStatus === 'paid') {
    return 'aprovado';
  }
  return 'aberto';
};

export default parseStatusToTiny;

export type NormalizedTinyStatus = ReturnType<typeof parseStatusToTiny>;
