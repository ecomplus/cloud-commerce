import type { Orders } from '@cloudcommerce/types';

type FinancialStatus = Exclude<Orders['financial_status'], undefined>['current'];
type FulfillmentStatus = Exclude<Orders['fulfillment_status'], undefined>['current'];

export default (blingSituacao: string | undefined, appData: Record<string, any>) => {
  const situacao = `${blingSituacao}`.toLowerCase();
  let financialStatus: FinancialStatus | undefined;
  let fulfillmentStatus: FulfillmentStatus | undefined;
  const mappedStatus = appData.parse_status?.find((status: Record<string, any>) => {
    return status?.status_bling?.toLowerCase() === situacao;
  });
  switch (mappedStatus?.status_ecom?.toLowerCase() || situacao) {
    case 'pendente':
      financialStatus = 'pending';
      break;
    case 'em análise':
      financialStatus = 'under_analysis';
      break;
    case 'autorizado':
      financialStatus = 'authorized';
      break;
    case 'não autorizado':
      financialStatus = 'unauthorized';
      break;
    case 'venda agenciada':
    case 'aprovado':
    case 'pago':
      financialStatus = 'paid';
      break;
    case 'em andamento':
    case 'em separação':
    case 'em separacao':
      fulfillmentStatus = 'in_separation';
      break;
    case 'em produção':
    case 'em producao':
      fulfillmentStatus = 'in_production';
      break;
    case 'faturado':
    case 'atendido':
    case 'nf emitida':
      fulfillmentStatus = 'invoice_issued';
      break;
    case 'pronto para envio':
      fulfillmentStatus = 'ready_for_shipping';
      break;
    case 'enviado':
    case 'despachado':
      fulfillmentStatus = 'shipped';
      break;
    case 'entregue':
      fulfillmentStatus = 'delivered';
      break;
    case 'cancelado':
      financialStatus = 'voided';
      break;
    case 'aguardando troca':
      fulfillmentStatus = 'received_for_exchange';
      break;
    case 'devolvido':
      financialStatus = 'refunded';
      break;
    case 'retorno e troca':
      fulfillmentStatus = 'returned_for_exchange';
      break;
    case 'disputa':
      financialStatus = 'in_dispute';
      break;
    default:
  }
  return { financialStatus, fulfillmentStatus };
};
