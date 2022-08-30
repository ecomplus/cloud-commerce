import postTiny from '../post-tiny-erp';

export default (tinyOrder, shippingLines) => new Promise((resolve, reject) => {
  const partialOrder: Record<string, any> = {};
  if (tinyOrder.obs_interna) {
    partialOrder.staff_notes = tinyOrder.obs_interna;
  }

  if (shippingLines && shippingLines.length) {
    const shippingLine = shippingLines[0];
    if (
      (tinyOrder.codigo_rastreamento || tinyOrder.url_rastreamento)
      && (!shippingLine.tracking_codes || !shippingLine.tracking_codes.length)
    ) {
      let link;
      if (tinyOrder.url_rastreamento) {
        link = tinyOrder.url_rastreamento;
      }
      const tracking = {
        code: String(tinyOrder.codigo_rastreamento)
          || link.replace(/^https?:\/\/[^/]+/, '').replace(/^[^?]+\?/, '').substring(0, 70),
        link,
      };
      shippingLine.tracking_codes = [tracking];
      partialOrder.shipping_lines = shippingLines;
    }

    if (tinyOrder.id_nota_fiscal > 0) {
      if (!shippingLine.invoices) {
        shippingLine.invoices = [];
      }
      postTiny('/nota.fiscal.obter.php', { id: tinyOrder.id_nota_fiscal })
        .then((tinyInvoice) => {
          const number = String(tinyInvoice.nota_fiscal.numero);
          if (number && !shippingLine.invoices.find((invoice) => invoice.number === number)) {
            shippingLine.invoices.push({
              number,
              serial_number: String(tinyInvoice.nota_fiscal.serie),
            });
          }
          partialOrder.shipping_lines = shippingLines;
          resolve(partialOrder);
        })
        .catch(reject);
      return;
    }
  }
  resolve(partialOrder);
});
