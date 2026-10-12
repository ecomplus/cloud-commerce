import {
  describe,
  test,
  expect,
  vi,
  beforeEach,
} from 'vitest';
import checkoutCustomerGuard from '../src/firebase/checkout-customer-guard';

const { apiGet } = vi.hoisted(() => ({ apiGet: vi.fn() }));
vi.mock('@cloudcommerce/api', () => ({ default: { get: apiGet } }));
vi.mock('@cloudcommerce/firebase/lib/config', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

const customerId = '6123456789abcdef01234567';
const reqById = { body: { customer: { _id: customerId, main_email: 'ana@example.com' } } };
const reqByEmail = { body: { customer: { main_email: 'ana@example.com' } } };
const apiError = (statusCode?: number) => Object.assign(new Error('API'), { statusCode });

describe('Checkout customer guard (customers-only stores)', () => {
  beforeEach(() => {
    apiGet.mockReset();
  });

  test('no customer gates config means no API request', async () => {
    expect(await checkoutCustomerGuard(reqById, undefined)).toBeNull();
    expect(await checkoutCustomerGuard(reqById, {})).toBeNull();
    expect(await checkoutCustomerGuard(reqById, { minSubtotal: 300 })).toBeNull();
    expect(apiGet).not.toHaveBeenCalled();
  });

  test('reads customer by _id or main_email like readOrSaveCustomer', async () => {
    apiGet.mockResolvedValue({ data: { _id: customerId, enabled: true } });
    expect(await checkoutCustomerGuard(reqById, { customersOnly: true })).toBeNull();
    expect(apiGet).toHaveBeenLastCalledWith(`customers/${customerId}`);
    expect(await checkoutCustomerGuard(reqByEmail, { customersOnly: true })).toBeNull();
    expect(apiGet).toHaveBeenLastCalledWith('customers/main_email:ana@example.com');
  });

  test('invalid body passes through to ajv validation', async () => {
    expect(await checkoutCustomerGuard({ body: {} }, { customersOnly: true })).toBeNull();
    expect(await checkoutCustomerGuard({ body: null }, { customersOnly: true })).toBeNull();
    expect(await checkoutCustomerGuard({
      body: { customer: { _id: 123, main_email: ['x'] } },
    }, { customersOnly: true })).toBeNull();
    expect(apiGet).not.toHaveBeenCalled();
  });

  test('unknown customer (404) is refused', async () => {
    apiGet.mockRejectedValue(apiError(404));
    const err = await checkoutCustomerGuard(reqById, { customersOnly: true });
    expect(err?.status).toBe(403);
    expect(err?.code).toBe('CKT804');
  });

  test('read error other than 404 is retryable, not fail-open', async () => {
    apiGet.mockRejectedValueOnce(apiError(500));
    const err = await checkoutCustomerGuard(reqById, { customersOnly: true });
    expect(err?.status).toBe(503);
    expect(err?.code).toBe('CKT503');
    apiGet.mockRejectedValueOnce(apiError());
    expect((await checkoutCustomerGuard(reqById, { customersOnly: true }))?.status).toBe(503);
  });

  test('customer not enabled is refused with CKT802', async () => {
    apiGet.mockResolvedValue({ data: { _id: customerId, enabled: false } });
    const err = await checkoutCustomerGuard(reqById, { customersOnly: true });
    expect(err?.status).toBe(403);
    expect(err?.code).toBe('CKT802');
  });

  test('requireStaffSignature checks staff_signature', async () => {
    const gates = { customersOnly: true, requireStaffSignature: true };
    apiGet.mockResolvedValueOnce({ data: { _id: customerId, enabled: true } });
    expect((await checkoutCustomerGuard(reqById, gates))?.code).toBe('CKT805');
    apiGet.mockResolvedValueOnce({
      data: { _id: customerId, enabled: true, staff_signature: true },
    });
    expect(await checkoutCustomerGuard(reqById, gates)).toBeNull();
  });
});
