import type { Orders } from '@cloudcommerce/types';
import type Bling from '../../bling-auth/client';

type ShippingLines = Exclude<Orders['shipping_lines'], undefined>;

export default async (
  blingOrder: Record<string, any>,
  shippingLines: ShippingLines | undefined,
  bling: Bling,
): Promise<Record<string, any>> => {
  const partialOrder: Record<string, any> = {};
  if (blingOrder.observacaointerna) {
    partialOrder.staff_notes = blingOrder.observacaointerna;
  }
  if (shippingLines && shippingLines.length) {
    const isGeneratedFallback = (existing: Record<string, any> | undefined) => {
      if (!existing) {
        return true;
      }
      return existing.code === 'Sem codigo | Consultar no link'
        || (existing.link && existing.link.startsWith('https://www.melhorrastreio.com.br/rastreio/'));
    };

    const addTrackingCode = (shippingLine: ShippingLines[0], volume: Record<string, any>) => {
      if (!volume || (!volume.codigoRastreamento && !volume.urlRastreamento)) {
        return;
      }
      const existing = shippingLine.tracking_codes?.[0];
      if (existing && !isGeneratedFallback(existing)) {
        return;
      }
      const tracking = volume.codigoRastreamento
        ? {
          code: String(volume.codigoRastreamento),
          link: volume.urlRastreamento
            || `https://www.melhorrastreio.com.br/rastreio/${volume.codigoRastreamento}`,
        }
        : {
          code: 'Sem codigo | Consultar no link',
          link: volume.urlRastreamento,
        };
      if (existing && existing.code === tracking.code && existing.link === tracking.link) {
        return;
      }
      shippingLine.tracking_codes = [tracking];
      partialOrder.shipping_lines = shippingLines;
    };

    const checkTrackingCodes = ({ codigosRastreamento, transporte }: Record<string, any>) => {
      if (transporte && transporte.volumes) {
        const { volumes } = transporte;
        for (let i = 0; i < volumes.length && i < shippingLines.length; i++) {
          const volume = volumes[i].volume || volumes[i];
          addTrackingCode(shippingLines[i], volume);
        }
      }
      if (codigosRastreamento) {
        addTrackingCode(shippingLines[0], codigosRastreamento[0] || codigosRastreamento);
      }
    };
    checkTrackingCodes(blingOrder);

    const { nota } = blingOrder;
    if (nota && nota.numero) {
      const shippingLine = shippingLines[0];
      if (!shippingLine.invoices) {
        shippingLine.invoices = [];
      }
      let invoiceIndex = shippingLine.invoices.findIndex(({ number }) => {
        return number === String(nota.numero);
      });
      if (invoiceIndex === -1) {
        const invoice: Record<string, any> = {
          number: String(nota.numero),
        };
        if (nota.serie) {
          invoice.serial_number = String(nota.serie);
        }
        if (nota.chaveAcesso) {
          invoice.access_key = String(nota.chaveAcesso);
        }
        if (nota.dataEmissao) {
          const date = new Date(nota.dataEmissao);
          if (date.getTime() > 0) {
            invoice.issued_at = date.toISOString();
          }
        }
        shippingLine.invoices.push(invoice as any);
        invoiceIndex = shippingLine.invoices.length - 1;
        partialOrder.shipping_lines = shippingLines;
      } else if (invoiceIndex && nota.chaveAcesso) {
        shippingLine.invoices[invoiceIndex].access_key = String(nota.chaveAcesso);
      }

      if (nota.serie) {
        const data = await bling.get(`/notafiscal/${nota.numero}/${nota.serie}`)
          .then((response) => response.data)
          .catch(() => null);
        let blingInvoice: Record<string, any> | undefined;
        if (Array.isArray(data?.notasfiscais)) {
          blingInvoice = data.notasfiscais.find((fiscal: Record<string, any>) => {
            return !nota.chaveAcesso
              || String(fiscal.notafiscal.chaveAcesso) === String(nota.chaveAcesso);
          });
          if (blingInvoice) {
            blingInvoice = blingInvoice.notafiscal;
          }
        }
        if (blingInvoice) {
          checkTrackingCodes(blingInvoice);
          ([
            ['linkDanfe', 'link'],
            ['chaveAcesso', 'access_key'],
          ] as Array<[string, string]>).forEach(([blingField, field]) => {
            if (blingInvoice![blingField] && !shippingLine.invoices![invoiceIndex][field]) {
              shippingLine.invoices![invoiceIndex][field] = String(blingInvoice![blingField]);
              partialOrder.shipping_lines = shippingLines;
            }
          });
        }
      }
    }
  }
  return partialOrder;
};
