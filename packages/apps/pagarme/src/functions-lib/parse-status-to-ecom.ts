export default (pagarmeStatus: string) => {
  switch (pagarmeStatus) {
    case 'processing':
    case 'analyzing':
      return 'under_analysis';
    case 'authorized':
    case 'paid':
    case 'refunded':
      return pagarmeStatus;
    case 'waiting_payment':
      return 'pending';
    case 'pending_refund':
      return 'in_dispute';
    case 'refused':
      return 'unauthorized';
    case 'chargedback':
      return 'refunded';
    case 'pending_review':
      return 'authorized';
    default:
      return 'unknown';
  }
};
