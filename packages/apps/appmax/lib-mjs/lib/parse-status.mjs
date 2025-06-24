export const parseStatus = (appmaxStatus) => {
  switch (appmaxStatus) {
    case 'processing':
    case 'analyzing':
      return 'under_analysis';
    case 'waiting_payment':
      return 'pending';
    case 'estornado':
      return 'refunded';
    case 'pending_refund':
      return 'in_dispute';
    case 'cancelado':
      return 'voided';
    case 'aprovado':
    case 'integrado':
      return 'paid';
    case 'autorizado':
      return 'authorized';
    default:
      return 'pending';
  }
};

export default parseStatus;
