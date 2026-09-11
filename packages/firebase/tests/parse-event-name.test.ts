import { describe, test, expect } from 'vitest';
import parseEventName from '../src/handlers/parse-event-name';

describe('parseEventName', () => {
  test('customers-staffSignatureSet watches staff_signature', () => {
    const { resource, params } = parseEventName('customers-staffSignatureSet', {});
    expect(resource).toBe('customers');
    expect(params.modified_fields).toEqual(['staff_signature']);
  });

  test('customers-enabledSet watches enabled', () => {
    const { params } = parseEventName('customers-enabledSet', {});
    expect(params.modified_fields).toEqual(['enabled']);
  });

  test('customers-new keeps create action', () => {
    const { params } = parseEventName('customers-new', {});
    expect(params.action).toBe('create');
    expect(params.modified_fields).toBeUndefined();
  });

  test('existing mappings unchanged', () => {
    expect(parseEventName('products-priceSet', {}).params.modified_fields).toEqual(['price', 'variations.price']);
    expect(parseEventName('orders-paid', {}).params['body.financial_status.current']).toBe('paid');
  });
});
