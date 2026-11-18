import { describe, test, expect } from 'vitest';
import {
  getCustomerGateError,
  getCompanyGateError,
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
    expect(getCustomerGateError({ customersOnly: true }, { enabled: false })?.code).toBe('CKT802');
    expect(getCustomerGateError({ customersOnly: true }, {})?.code).toBe('CKT802');
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

  test('personsOnly rejects company buyers only', () => {
    const gates = { personsOnly: true };
    const person = { registry_type: 'p', doc_number: '12345678909' };
    expect(getCompanyGateError(undefined, [{ registry_type: 'j' }])).toBeNull();
    expect(getCompanyGateError({}, [{ registry_type: 'j' }])).toBeNull();
    expect(getCompanyGateError(gates, [person, person])).toBeNull();
    expect(getCompanyGateError(gates, [person, undefined, null])).toBeNull();
    const err = getCompanyGateError(gates, [person, { registry_type: 'j' }]);
    expect(err?.status).toBe(403);
    expect(err?.code).toBe('CKT807');
    expect(err?.userMessage.pt_br).toContain('CNPJ');
    // CNPJ sent as individual registry
    expect(getCompanyGateError(gates, [{ registry_type: 'p', doc_number: '11222333000181' }])
      ?.code).toBe('CKT807');
    expect(getCompanyGateError(gates, [{ doc_number: '11.222.333/0001-81' }])?.code)
      .toBe('CKT807');
  });
});
