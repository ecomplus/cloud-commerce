import { describe, test, expect } from 'vitest';
import getNewCustomerBody from '../src/firebase/new-customer';

describe('getNewCustomerBody', () => {
  const user = { name: 'Ana', email: 'ana@example.com', email_verified: true };

  test('default body without store config', () => {
    expect(getNewCustomerBody(user)).toEqual({
      display_name: 'Ana',
      main_email: 'ana@example.com',
      emails: [{ address: 'ana@example.com', verified: true }],
    });
  });

  test('store config can create customers not yet enabled', () => {
    const body = getNewCustomerBody(user, { enabled: false, staff_signature: false });
    expect(body.enabled).toBe(false);
    expect(body.staff_signature).toBe(false);
    expect(body.main_email).toBe('ana@example.com');
  });
});
