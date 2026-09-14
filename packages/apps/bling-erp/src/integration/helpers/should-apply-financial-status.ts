import type { Orders } from '@cloudcommerce/types';

type FinancialStatus = Exclude<Orders['financial_status'], undefined>['current'];

/*
Contrapartida financeira do `should-advance-fulfillment`: "Cancelado" é o alvo
de CINCO status financeiros da loja (`status-to-bling.ts`), mas a volta devolve
só `voided` (`status-from-bling.ts`). Então o pedido estornado é exportado como
"Cancelado", o Bling dispara o callback da própria mudança, e a importação
regrava o pedido como cancelado — o histórico guarda o `refunded`, mas o status
corrente degrada e o app de e-mails manda "seu pedido foi cancelado" logo
depois do "pagamento estornado".
Cortamos só esse degradê: cancelamento humano no Bling sobre pedido pago, em
disputa ou não autorizado continua propagando normalmente.
*/
const COLLAPSED_INTO_VOIDED: FinancialStatus[] = ['refunded', 'partially_refunded'];

const shouldApplyFinancialStatus = (
  current: string | undefined,
  next: string | undefined,
): boolean => {
  if (!next) return false;
  if (!current) return true;
  if (next === 'voided' && COLLAPSED_INTO_VOIDED.includes(current as FinancialStatus)) {
    return false;
  }
  return true;
};

export default shouldApplyFinancialStatus;
