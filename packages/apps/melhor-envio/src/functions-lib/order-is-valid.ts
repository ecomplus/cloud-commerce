import type { Orders } from '@cloudcommerce/types';

export default (order: Orders, appConfig: Record<string, any>) => {
  if (!order.fulfillment_status || !order.shipping_lines) {
    return false;
  }

  const isByMelhorEnvio = Boolean(order.shipping_lines.find((shippingLine) => {
    return shippingLine.custom_fields && shippingLine.custom_fields.find(({ field }) => {
      return field === 'by_melhor_envio';
    });
  }));

  const isNonCommercial = () => (appConfig.enabled_non_commercial);

  const isReadyForShipping = () => {
    let statusToCheck = 'ready_for_shipping';
    switch (appConfig.new_label_status) {
      case 'Em produção':
        statusToCheck = 'in_production';
        break;
      case 'Em separação':
        statusToCheck = 'in_separation';
        break;
      case 'Pronto para envio':
        statusToCheck = 'ready_for_shipping';
        break;
      case 'NF emitida':
        statusToCheck = 'invoice_issued';
        break;
      default:
    }
    const { current } = order.fulfillment_status || {};
    return (current && current === statusToCheck);
  };

  const hasInvoice = () => {
    return Boolean(order.shipping_lines?.find(({ invoices }) => {
      return invoices && invoices[0] && invoices[0].number;
    }));
  };

  const hasLabelBuyIt = () => {
    if (order.hidden_metafields) {
      return order.hidden_metafields
        .find(({ field }) => field === 'melhor_envio_label_id');
    }
    return false;
  };

  if (!isByMelhorEnvio || !isReadyForShipping() || hasLabelBuyIt()) {
    return false;
  }

  if (isNonCommercial() || hasInvoice()) {
    return true;
  }

  return false;
};
