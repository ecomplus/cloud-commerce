import type { Orders } from '@cloudcommerce/types';

const parseStatusTitle = {
  pending: 'Pendente',
  under_analysis: 'Em análise',
  authorized: 'Autorizado',
  unauthorized: 'Não autorizado',
  partially_paid: 'Parte pago',
  paid: 'Pago',
  in_dispute: 'Disputa',
  partially_refunded: 'Parte devolvido',
  refunded: 'Devolvido',
  voided: 'Cancelado',
  in_production: 'Em produção',
  in_separation: 'Em separação',
  ready_for_shipping: 'Pronto para envio',
  invoice_issued: 'NF emitida',
  shipped: 'Enviado',
  partially_shipped: 'Parte enviado',
  partially_delivered: 'Parte entregue',
  delivered: 'Entregue',
  returned_for_exchange: 'Retorno e troca',
  received_for_exchange: 'Aguardando troca',
};

const findStatusConfig = (statusApi: string, appData: Record<string, any>) => {
  if (!appData.parse_status?.length) return null;
  const statusApp = appData.parse_status.find((status: Record<string, any>) => {
    return status.status_ecom === parseStatusTitle[statusApi];
  });
  return statusApp?.status_bling
    ? [String(statusApp.status_bling).toLowerCase()]
    : null;
};

export default (order: Orders, appData: Record<string, any>): string[] => {
  let financialStatus = order.financial_status?.current;
  if (!financialStatus) {
    const paymentsHistory = order.payments_history;
    if (paymentsHistory && paymentsHistory.length) {
      financialStatus = paymentsHistory[paymentsHistory.length - 1].status;
    }
  }
  switch (financialStatus) {
    case 'pending':
    case 'under_analysis':
    case 'unknown':
    case 'authorized':
    case 'partially_paid':
      return findStatusConfig(financialStatus, appData) || ['pendente', 'em aberto'];
    case 'voided':
    case 'refunded':
    case 'in_dispute':
    case 'unauthorized':
    case 'partially_refunded':
      return findStatusConfig(financialStatus, appData) || ['cancelado'];
    default:
  }
  const fulfillmentStatus = order.fulfillment_status?.current;
  switch (fulfillmentStatus) {
    case 'in_production':
      return findStatusConfig(fulfillmentStatus, appData)
        || ['em produção', 'em producao', 'em andamento'];
    case 'in_separation':
      return findStatusConfig(fulfillmentStatus, appData)
        || ['em separação', 'em separacao', 'em andamento'];
    case 'invoice_issued':
      return findStatusConfig(fulfillmentStatus, appData) || ['faturado', 'atendido'];
    case 'ready_for_shipping':
      return findStatusConfig(fulfillmentStatus, appData) || ['pronto para envio', 'pronto envio'];
    case 'shipped':
    case 'partially_shipped':
      return findStatusConfig(fulfillmentStatus, appData) || ['enviado', 'atendido'];
    case 'delivered':
      return findStatusConfig(fulfillmentStatus, appData) || ['entregue', 'atendido'];
    default:
  }
  if (financialStatus === 'paid') {
    return findStatusConfig(financialStatus, appData) || ['aprovado', 'em aberto'];
  }
  return ['em aberto', 'pendente'];
};
