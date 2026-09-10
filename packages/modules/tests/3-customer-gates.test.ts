import { describe, test, expect } from 'vitest';
import {
  getCustomerGateError,
  getSubtotalGateError,
} from '../src/firebase/functions-checkout/customer-gates';

describe('Checkout customer gates (customers-only stores)', () => {
  test('no gates config keeps default behavior', () => {
    expect(getCustomerGateError(undefined, null)).toBeNull();
    expect(getCustomerGateError({}, { enabled: false })).toBeNull();
    expect(getSubtotalGateError(undefined, 0)).toBeNull();
  });

  test('customersOnly rejects unknown customer', () => {
    const err = getCustomerGateError({ customersOnly: true }, null);
    expect(err?.status).toBe(403);
    expect(err?.code).toBe('CKT804');
  });

  test('customersOnly requires enabled === true', () => {
    expect(getCustomerGateError({ customersOnly: true }, { enabled: false })?.code).toBe('CKT804');
    expect(getCustomerGateError({ customersOnly: true }, {})?.code).toBe('CKT804');
    expect(getCustomerGateError({ customersOnly: true }, { enabled: true })).toBeNull();
  });

  test('requireStaffSignature rejects self-enabled customers', () => {
    const gates = { customersOnly: true, requireStaffSignature: true };
    expect(getCustomerGateError(gates, { enabled: true })?.code).toBe('CKT805');
    expect(getCustomerGateError(gates, { enabled: true, staff_signature: false })?.code).toBe('CKT805');
    expect(getCustomerGateError(gates, { enabled: true, staff_signature: true })).toBeNull();
  });

  test('minSubtotal rejects lower subtotals only', () => {
    const gates = { minSubtotal: 300 };
    expect(getSubtotalGateError(gates, 299.99)?.code).toBe('CKT806');
    expect(getSubtotalGateError(gates, 299.99)?.userMessage.pt_br).toContain('300,00');
    expect(getSubtotalGateError(gates, 300)).toBeNull();
    expect(getSubtotalGateError({ minSubtotal: 0 }, 1)).toBeNull();
  });
});
