import type { ApiError, Customers } from '@cloudcommerce/api/types';
import type { CheckoutGatesConfig } from '@cloudcommerce/firebase/lib/config';
import api from '@cloudcommerce/api';
import { logger } from '@cloudcommerce/firebase/lib/config';
import {
  type CheckoutGateError,
  getCustomerGateError,
} from './functions-checkout/customer-gates';

export const hasCustomerGates = (gates: CheckoutGatesConfig | undefined) => {
  return Boolean(gates?.customersOnly || gates?.requireStaffSignature);
};

/* Strict customer check for customers-only stores, called before `checkout()`
like the anti-fraud guard. Requests the Store API only when a customer gate is set.
Runs before ajv validation, so the body is read defensively. */
export default async function checkoutCustomerGuard(
  req: { body: any },
  gates: CheckoutGatesConfig | undefined,
): Promise<CheckoutGateError | null> {
  if (!hasCustomerGates(gates)) return null;
  const customerId = req.body?.customer?._id;
  const mainEmail = req.body?.customer?.main_email;
  // Same endpoint rule of `readOrSaveCustomer`
  let customerEndpoint: `customers/${Customers['_id']}` | `customers/${string}:${string}`;
  if (typeof customerId === 'string' && customerId.length === 24) {
    customerEndpoint = `customers/${customerId}` as `customers/${Customers['_id']}`;
  } else if (typeof mainEmail === 'string' && mainEmail) {
    customerEndpoint = `customers/main_email:${mainEmail}`;
  } else {
    // Invalid body, let ajv validation on checkout refuse it
    return null;
  }
  let savedCustomer: Customers | null = null;
  try {
    ({ data: savedCustomer } = await api.get(customerEndpoint));
  } catch (_err: any) {
    const err = _err as ApiError;
    if (err.statusCode !== 404) {
      // Can't tell whether the customer is allowed, refuse with retryable error (no fail-open)
      (err as any).checkoutCode = `cantReadCustomer,${customerEndpoint}`;
      logger.error(err);
      return {
        status: 503,
        code: 'CKT503',
        message: 'Cannot check customer registration now, try again later',
        userMessage: {
          en_us: 'We could not check your registration right now, please try again',
          pt_br: 'Não foi possível verificar seu cadastro agora, tente novamente',
        },
      };
    }
  }
  return getCustomerGateError(gates, savedCustomer);
}
