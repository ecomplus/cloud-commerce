// import type { GalaxpayApp } from '../../types/configApp';
// import type { ListPaymentsResponse } from '@cloudcommerce/types/modules/list_payments:response';

// type Gateway = ListPaymentsResponse['payment_gateways'][number]

const gerateId = (id: string | number) => {
  const length = 24 - id.toString().length + 1;
  return Array(length).join('0') + id;
};

const parsePeriodicityToEcom = (periodicity?: string) => {
  switch (periodicity) {
    case 'weekly':
      return 'Semanal';
    case 'biweekly':
      return 'Quinzenal';
    case 'monthly':
      return 'Mensal';
    case 'bimonthly':
      return 'Bimestral';
    case 'quarterly':
      return 'Trimestral';
    case 'biannual':
      return 'Semestral';
    case 'yearly':
      return 'Anual';
    default:
      return periodicity;
  }
};

const parseStatus = (status?: string) => {
  switch (status) {
    case 'notSend': // Ainda não enviada para operadora de Cartão
    case 'pendingBoleto': // Boleto em aberto
    case 'pendingPix': // Pix em aberto
      return 'pending';

    case 'authorized': // Autorizado na Operadora de Cartão
      return 'authorized';

    case 'captured': // Capturada na Operadora de Cartão
    case 'payExternal': // Paga fora do sistema
    case 'payedBoleto': // Boleto compensado
    case 'payedPix': // Pix pago
    case 'free': // Isento
      return 'paid';

    case 'denied': // Negada na Operadora de Cartão
      return 'unauthorized';

    case 'reversed': // Estornada na Operadora de Cartão
      return 'refunded';

    case 'cancel': // Cancelada manualmente
    case 'cancelByContract': // Cancelada ao cancelar a cobrança
    case 'notCompensated': // Boleto baixado por decurso de prazo
    case 'unavailablePix': // Pix indisponível para pagamento
      return 'voided';
    default:
      return 'unknown';
  }
};

const parsePeriodicityToGalaxPay = (periodicity?: string) => {
  switch (periodicity) {
    case 'Semanal':
      return 'weekly';
    case 'Quinzenal':
      return 'biweekly';
    case 'Mensal':
      return 'monthly';
    case 'Bimestral':
      return 'bimonthly';
    case 'Trimestral':
      return 'quarterly';
    case 'Semestral':
      return 'biannual';
    case 'Anual':
      return 'yearly';
    default:
      return periodicity;
  }
};

export {
  gerateId,
  parsePeriodicityToEcom,
  parsePeriodicityToGalaxPay,
  parseStatus,
};
