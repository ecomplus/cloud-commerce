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
      return {
        status: 403,
        code: 'CKT804',
        message: 'Customer is not enabled to place orders',
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
