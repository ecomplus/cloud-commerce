import type { Orders } from '@cloudcommerce/types';
import type { NormalizedTinyStatus } from './status-to-tiny';

type FinancialStatus = Exclude<Orders['financial_status'], undefined>['current'];
type FulfillmentStatus = Exclude<Orders['fulfillment_status'], undefined>['current'];

const parseTinyStatus = (situacao: string) => {
  let financialStatus: FinancialStatus | undefined;
  let fulfillmentStatus: FulfillmentStatus | undefined;
  let normalizedTinyStatus: NormalizedTinyStatus | undefined;
  switch (situacao.toLowerCase()) {
    case 'aprovado':
    case 'pago':
      financialStatus = 'paid';
      normalizedTinyStatus = 'aprovado';
      break;
    case 'preparando_envio':
    case 'preparando envio':
    case 'em separação':
      fulfillmentStatus = 'in_separation';
      normalizedTinyStatus = 'preparando_envio';
      break;
    case 'em produção':
      fulfillmentStatus = 'in_production';
      break;
    case 'faturado':
    case 'faturado (atendido)':
    case 'atendido':
    case 'nf emitida':
      fulfillmentStatus = 'invoice_issued';
      normalizedTinyStatus = 'faturado';
      break;
    case 'pronto_envio':
    case 'pronto para envio':
      fulfillmentStatus = 'ready_for_shipping';
      normalizedTinyStatus = 'pronto_envio';
      break;
    case 'enviado':
      fulfillmentStatus = 'shipped';
      normalizedTinyStatus = 'enviado';
      break;
    case 'entregue':
      fulfillmentStatus = 'delivered';
      normalizedTinyStatus = 'entregue';
      break;
    case 'aguardando troca':
      fulfillmentStatus = 'received_for_exchange';
      break;
    case 'retorno e troca':
      fulfillmentStatus = 'returned_for_exchange';
      break;
    case 'cancelado':
      financialStatus = 'voided';
      normalizedTinyStatus = 'cancelado';
      break;
    case 'em disputa':
      financialStatus = 'in_dispute';
      break;
    case 'estornado':
      financialStatus = 'refunded';
      break;
    default:
  }
  return {
    financialStatus,
    fulfillmentStatus,
    normalizedTinyStatus,
  };
};

export default parseTinyStatus;
