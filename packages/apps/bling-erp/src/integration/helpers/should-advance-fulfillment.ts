import type { Orders } from '@cloudcommerce/types';

type FulfillmentStatus = Exclude<Orders['fulfillment_status'], undefined>['current'];

/*
Contas Bling padrão não têm situações granulares de envio/entrega, então
"enviado"/"entregue" acabam mapeados para "Atendido", que na volta vira
invoice_issued. Sem guarda, o pedido regride de "entregue" para "nf emitida".
Este helper define a ordem de progresso do fulfillment; status fora da esteira
(troca, devolução) não são ranqueados e sempre podem ser aplicados — só
bloqueamos a transição para trás dentro da esteira.
*/
const RANK: Partial<Record<FulfillmentStatus, number>> = {
  in_production: 1,
  in_separation: 2,
  invoice_issued: 3,
  ready_for_shipping: 4,
  partially_shipped: 5,
  shipped: 6,
  partially_delivered: 7,
  delivered: 8,
};

const shouldAdvanceFulfillment = (
  current: string | undefined,
  next: string | undefined,
): boolean => {
  if (!next) return false;
  if (!current) return true;
  const rankCurrent = RANK[current as FulfillmentStatus];
  const rankNext = RANK[next as FulfillmentStatus];
  if (rankCurrent === undefined || rankNext === undefined) return true;
  return rankNext >= rankCurrent;
};

export default shouldAdvanceFulfillment;
