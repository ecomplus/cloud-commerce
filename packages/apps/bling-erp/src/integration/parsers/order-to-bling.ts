import type { Orders } from '@cloudcommerce/types';
import ecomUtils from '@ecomplus/utils';
import { logger } from '@cloudcommerce/firebase/lib/config';
import parseAddress from './address-to-bling';

const holidays = [
  '2026-01-01', '2026-02-16', '2026-02-17', '2026-04-03', '2026-04-21',
  '2026-05-01', '2026-06-04', '2026-07-09', '2026-09-07', '2026-10-12',
  '2026-11-02', '2026-11-20', '2026-12-24', '2026-12-25', '2026-12-31',
  '2027-01-01', '2027-02-08', '2027-02-09', '2027-04-02', '2027-04-21',
  '2027-05-01', '2027-05-27', '2027-07-09', '2027-09-07', '2027-10-12',
  '2027-11-02', '2027-11-20', '2027-12-24', '2027-12-25', '2027-12-31',
];

const toDateStr = (d: Date) => `${d.getUTCFullYear()}-`
  + `${String(d.getUTCMonth() + 1).padStart(2, '0')}-`
  + `${String(d.getUTCDate()).padStart(2, '0')}`;

const isNonWorkingDay = (dateStr: string) => {
  const day = new Date(`${dateStr}T12:00:00Z`).getUTCDay();
  return day === 0 || day === 6 || holidays.includes(dateStr);
};

const addDaysToDate = (startDateStr: string, days: number, workingDays?: boolean) => {
  const d = new Date(`${startDateStr}T12:00:00Z`);
  let remaining = days;
  while (remaining > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (!workingDays || !isNonWorkingDay(toDateStr(d))) remaining -= 1;
  }
  return toDateStr(d);
};

export default (
  order: Orders,
  blingOrderNumber: string | undefined,
  blingStore: string | number | undefined,
  appData: Record<string, any>,
  customerIdBling: number | string,
  paymentTypeId: number | string | null,
  itemsBling: Array<Record<string, any>>,
  originalBlingOrder?: Record<string, any>,
) => {
  try {
    const { amount } = order;
    const blingOrder: Record<string, any> = {
      numeroLoja: String(order.number),
      data: (order.opened_at || order.created_at).substring(0, 10),
      numeroPedidoCompra: order.number ? String(order.number) : undefined,
      contato: { id: customerIdBling },
    };
    blingOrder.dataSaida = blingOrder.data;
    if (order.number && !appData.disable_order_number) {
      blingOrder.numero = appData.random_order_number === true ? blingOrderNumber : order.number;
    }
    if (blingStore) {
      blingOrder.loja = { id: Number(blingStore) };
    }

    if (appData.bling_order_data) {
      Object.keys(appData.bling_order_data).forEach((field) => {
        let value = appData.bling_order_data[field];
        switch (value) {
          case undefined:
          case '':
          case null:
            break;
          default:
            if (typeof value === 'string') {
              value = value.trim();
              if (value) {
                blingOrder[field] = value;
              }
            } else {
              blingOrder[field] = value;
            }
        }
      });
    }

    const shippingLine = order.shipping_lines?.[0];
    const transaction = order.transactions?.[0];
    const shippingAddress = shippingLine && shippingLine.to;

    let subtotal = 0;
    if (order.items && order.items.length) {
      blingOrder.itens = [];
      order.items.forEach((item) => {
        if (item.quantity) {
          const itemRef = String(item.sku || item._id || '').substring(0, 40);
          const valor = Math.round(ecomUtils.price(item) * 100) / 100;
          const itemToBling: Record<string, any> = {
            codigo: itemRef,
            descricao: item.name ? item.name.substring(0, 120) : itemRef,
            unidade: 'Un',
            quantidade: item.quantity,
            valor,
          };
          subtotal += (valor * item.quantity);
          const productBlingId = itemsBling.find(({ codigo }) => codigo === item.sku)?.id;
          if (productBlingId) {
            itemToBling.produto = { id: productBlingId };
          }
          blingOrder.itens.push(itemToBling);
        }
      });
    }

    if (shippingLine) {
      const { posting_deadline: postingDeadline, delivery_time: deliveryTime } = shippingLine;
      if (postingDeadline?.days || deliveryTime?.days) {
        let estimatedDate = (order.opened_at || order.created_at).substring(0, 10);
        if (postingDeadline?.days) {
          estimatedDate = addDaysToDate(
            estimatedDate,
            postingDeadline.days,
            postingDeadline.working_days,
          );
        }
        if (deliveryTime?.days) {
          estimatedDate = addDaysToDate(
            estimatedDate,
            deliveryTime.days,
            deliveryTime.working_days,
          );
        }
        blingOrder.dataPrevista = estimatedDate;
      }

      blingOrder.transporte = {};
      let shippingService: Record<string, any> | undefined;
      const blingShipping = appData.parse_shipping;
      if (shippingLine.app && blingShipping && blingShipping.length) {
        shippingService = blingShipping.find(({ ecom_shipping: ecomShipping }) => {
          return ecomShipping
            && ecomShipping.toLowerCase() === shippingLine.app?.label?.toLowerCase();
        });
      }
      if (!originalBlingOrder || !originalBlingOrder.transporte?.volumes?.length) {
        let shippingLabel = shippingService?.bling_shipping;
        if (!shippingLabel) {
          shippingLabel = shippingLine.app?.service_code || order.shipping_method_label;
        }
        if (shippingLabel) {
          blingOrder.transporte.volumes = [{ servico: shippingLabel }];
        }
      }

      if (shippingLine.package?.weight) {
        const { unit, value } = shippingLine.package.weight;
        let pesoBruto = value;
        if (unit === 'g') {
          pesoBruto = value / 1000;
        } else if (unit === 'mg') {
          pesoBruto = value / 1000000;
        }
        blingOrder.transporte.pesoBruto = pesoBruto;
      }

      if (shippingAddress) {
        blingOrder.transporte.etiqueta = {};
        parseAddress(shippingAddress, blingOrder.transporte.etiqueta);
      }

      if (typeof amount.freight === 'number') {
        blingOrder.transporte.frete = Math.round(amount.freight * 100) / 100;
      }
    }

    if (amount.discount) {
      blingOrder.desconto = {
        valor: Math.round(amount.discount * 100) / 100,
        unidade: 'REAL',
      };
    }
    if (amount.balance) {
      if (!blingOrder.desconto) {
        blingOrder.desconto = {
          valor: 0,
          unidade: 'REAL',
        };
      }
      blingOrder.desconto.valor += Math.round(amount.balance * 100) / 100;
    }

    if (transaction) {
      let blingPaymentLabel = '';
      if (order.payment_method_label) {
        blingPaymentLabel = order.payment_method_label;
      } else if (transaction.payment_method.name) {
        blingPaymentLabel = transaction.payment_method.name.substring(0, 140);
      }
      const total = subtotal
        + (blingOrder.transporte?.frete || 0)
        - (blingOrder.desconto?.valor || 0);
      blingOrder.parcelas = [];
      if (transaction.installments) {
        const { number } = transaction.installments;
        const vlr = Math.round((total * 100) / number) / 100;
        const date = new Date(blingOrder.data).getTime();
        for (let i = 0; i < number; i++) {
          const addDaysMs = i ? (i * 30 * 24 * 60 * 60 * 1000) : 0;
          const deadLine = new Date(date + addDaysMs);
          blingOrder.parcelas.push({
            dataVencimento: deadLine.toISOString().substring(0, 10),
            valor: i < number - 1
              ? vlr
              : Math.round((total - (vlr * i)) * 100) / 100,
            observacoes: `${blingPaymentLabel} (${(i + 1)}/${number})`,
            formaPagamento: { id: paymentTypeId },
          });
        }
      } else {
        blingOrder.parcelas.push({
          dataVencimento: blingOrder.data,
          valor: Math.round(total * 100) / 100,
          observacoes: `${blingPaymentLabel} (1/1)`,
          formaPagamento: { id: paymentTypeId },
        });
      }
    }

    if (order.notes) {
      blingOrder.observacoes = order.notes;
    }

    return blingOrder;
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
