import type { PaymentHistoryEntry, FulfillmentsEntry } from './emails-utils';

type MailMapKey = 'welcome' | 'abandoned_cart' | 'new_order'
  | (PaymentHistoryEntry | FulfillmentsEntry)['status'];

const getMailTempl = (typeOrStatus: MailMapKey) => {
  switch (typeOrStatus) {
    case 'welcome':
      return {
        templ: 'welcome',
        subject: {
          pt_br: 'Boas vindas!',
          en_us: 'Welcome!',
        },
      };
    case 'abandoned_cart':
      return {
        templ: 'abandonedCart',
        subject: {
          pt_br: 'Finalize suas compras!',
          en_us: 'Complete your purchase',
        },
      };
    case 'new_order':
      return {
        templ: 'new_order',
        subject: {
          pt_br: 'Pedido recebido com sucesso',
          en_us: 'Order confirmed',
        },
      };
    case 'pending':
      return {
        templ: 'pending',
        subject: {
          pt_br: 'O pagamento do seu pedido está pendente',
          en_us: 'Pending payment',
        },
      };
    case 'paid':
      return {
        templ: 'paid',
        subject: {
          pt_br: 'Seu pagamento foi aprovado!',
          en_us: 'Your order is paid',
        },
      };
    case 'ready_for_shipping':
      return {
        templ: 'readyForShipping',
        subject: {
          pt_br: 'Seu pedido está pronto para o envio!',
          en_us: 'Your order is ready for shipping',
        },
      };
    case 'shipped':
      return {
        templ: 'shipped',
        subject: {
          pt_br: 'Seu pedido está a caminho!',
          en_us: 'Your package is on the way!',
        },
      };
    case 'delivered':
      return {
        templ: 'delivered',
        subject: {
          pt_br: 'Seu pedido foi entregue!',
          en_us: 'A shipment from your order has been delivered',
        },
      };
    case 'under_analysis':
      return {
        templ: 'underAnalysis',
        subject: {
          pt_br: 'Seu pedido está em análise',
          en_us: 'Request under review',
        },
      };
    case 'authorized':
      return {
        templ: 'authorized',
        subject: {
          pt_br: 'Seu pedido está autorizado!',
          en_us: 'Your order is authorized',
        },
      };
    case 'unauthorized':
      return {
        templ: 'unauthorized',
        subject: {
          pt_br: 'Pagamento não autorizado',
          en_us: 'Your payment is unauthorized',
        },
      };
    case 'voided':
      return {
        templ: 'voided',
        subject: {
          pt_br: 'Seu pedido foi cancelado',
          en_us: 'Your order has been canceled',
        },
      };
    case 'in_dispute':
      return {
        templ: 'inDispute',
        subject: {
          pt_br: 'Pagamento em disputa',
          en_us: 'Payment in dispute',
        },
      };
    case 'refunded':
      return {
        templ: 'refunded',
        subject: {
          pt_br: 'Pagamento estornado',
          en_us: 'Refunded Payment',
        },
      };
    case 'invoice_issued':
      return {
        templ: 'invoice_issued',
        subject: {
          pt_br: 'Nota Fiscal do seu pedido',
          en_us: 'Invoice of your order',
        },
      };
    case 'in_production':
      return {
        templ: 'inProduction',
        subject: {
          pt_br: 'Seu pedido está em produção!',
          en_us: 'Your order is in production',
        },
      };
    case 'in_separation':
      return {
        templ: 'inSeparation',
        subject: {
          pt_br: 'Produto em separação',
          en_us: 'Separating product(s)',
        },
      };
    case 'returned_for_exchange':
      return {
        templ: 'returnedForExchange',
        subject: {
          pt_br: 'Enviado para troca',
          en_us: 'Sent for exchange',
        },
      };
    case 'received_for_exchange':
      return {
        templ: 'receivedForExchange',
        subject: {
          pt_br: 'Pedido recebido para troca',
          en_us: 'Order received for exchange',
        },
      };
    case 'returned':
      return {
        templ: 'returned',
        subject: {
          pt_br: 'Seu pedido foi retornado',
          en_us: 'Your order has returned',
        },
      };
    default:
  }
  return null;
};

export default getMailTempl;
