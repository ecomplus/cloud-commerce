import type { Customers } from '@cloudcommerce/api/types';
import type { CheckoutGatesConfig } from '@cloudcommerce/firebase/lib/config';

export type CheckoutGateError = {
  status: number,
  code: string,
  message: string,
  userMessage: { en_us: string, pt_br: string },
};

/* Gates for stores restricted to registered/approved customers.
Without `gates` (default config) nothing changes on checkout. */
export const getCustomerGateError = (
  gates: CheckoutGatesConfig | undefined,
  savedCustomer: Pick<Customers, 'enabled' | 'staff_signature'> | null,
): CheckoutGateError | null => {
  if (!gates) return null;
  if (gates.customersOnly) {
    if (!savedCustomer) {
      return {
        status: 403,
        code: 'CKT804',
        message: 'Checkout is restricted to registered customers',
        userMessage: {
          en_us: 'Only registered customers can place orders',
          pt_br: 'Somente clientes cadastrados podem fazer pedidos',
        },
      };
    }
    if (savedCustomer.enabled !== true) {
      // Same code as the default `enabled === false` check on checkout
      return {
        status: 403,
        code: 'CKT802',
        message: 'Customer is disabled from placing new orders',
        userMessage: {
          en_us: 'Your account is not yet enabled to place orders',
          pt_br: 'Seu cadastro ainda não está liberado para compras',
        },
      };
    }
  }
  if (gates.requireStaffSignature && savedCustomer?.staff_signature !== true) {
    return {
      status: 403,
      code: 'CKT805',
      message: 'Customer is not approved by store staff',
      userMessage: {
        en_us: 'Your account is not yet approved by the store',
        pt_br: 'Seu cadastro ainda não foi aprovado pela loja',
      },
    };
  }
  return null;
};

type BuyerRegistry = {
  registry_type?: string,
  doc_number?: string,
} | null | undefined;

const isCompanyBuyer = (buyer: BuyerRegistry) => {
  if (!buyer) return false;
  if (buyer.registry_type === 'j') return true;
  // Brazilian CNPJ, catches companies sent with `registry_type: 'p'`
  return typeof buyer.doc_number === 'string'
    && buyer.doc_number.replace(/\D/g, '').length === 14;
};

/* Gate for stores that sell to individuals only (no CNPJ).
Receives the checkout customer and every transaction buyer, any company rejects. */
export const getCompanyGateError = (
  gates: CheckoutGatesConfig | undefined,
  buyers: BuyerRegistry[],
): CheckoutGateError | null => {
  if (!gates?.personsOnly || !buyers.some(isCompanyBuyer)) return null;
  return {
    status: 403,
    code: 'CKT807',
    message: 'Checkout is restricted to individuals, company buyers are not allowed',
    userMessage: {
      en_us: 'This store sells to individuals only, purchases with company registration are not allowed',
      pt_br: 'Esta loja vende somente para pessoa física (CPF), compras com CNPJ não são permitidas',
    },
  };
};

export const getSubtotalGateError = (
  gates: CheckoutGatesConfig | undefined,
  subtotal: number,
): CheckoutGateError | null => {
  const minSubtotal = gates?.minSubtotal;
  if (!(minSubtotal && minSubtotal > 0) || subtotal >= minSubtotal) return null;
  const minFormatted = minSubtotal.toFixed(2);
  return {
    status: 400,
    code: 'CKT806',
    message: `Items subtotal is lower than the minimum of ${minFormatted}`,
    userMessage: {
      en_us: `Minimum order subtotal is ${minFormatted}`,
      pt_br: `O pedido mínimo é de ${minFormatted.replace('.', ',')}`,
    },
  };
};
