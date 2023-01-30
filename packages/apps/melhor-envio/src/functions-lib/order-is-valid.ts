import type { Orders } from '@cloudcommerce/types';

export default (order: Orders, appConfig: { [x: string]: any; }) => {
  if (!order.fulfillment_status || !order.shipping_lines) {
    return false;
  }

  // check if the shipping calculation was done with the app-melhor-envio
  const isByMelhorEnvio = Boolean(order.shipping_lines.find((shippingLine) => {
    return shippingLine.custom_fields && shippingLine.custom_fields.find(({ field }) => {
      return field === 'by_melhor_envio';
    });
  }));

  // checks if the non-commercial shipping option is enabled
  const isNonCommercial = () => (appConfig.enabled_non_commercial);

  // checks if order is ready to ship by last
  // entry in fulfillments instead of checking fulfillment_status

  const isReadyForShipping = () => {
    const current = order.fulfillment_status?.current;
    return (current && current === 'ready_for_shipping');
  };

  // check if nf was issued for the order
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
