import assert from 'node:assert';
import test, { describe } from 'node:test';
import decide from '../lib/bling-auth/decide-refresh-failure.js';

const GAP = 9000;
// Contexto base: sem refresh concorrente (updatedAt não avançou), sem erro.
const base = {
  isInvalidGrant: false,
  initialUpdatedAtMs: 1000,
  nowMs: 5000,
  tokenExpirationGap: GAP,
  current: { updatedAtMs: 1000, countErr: 0 },
};

describe('Decide on Bling token refresh failure', () => {
  test('refresh concorrente bem-sucedido reusa o token novo, mesmo com invalid_grant', () => {
    const d = decide({
      ...base,
      isInvalidGrant: true,
      current: {
        updatedAtMs: 4000, // avançou → alguém renovou
        accessToken: 'NOVO',
        expiredAtMs: 5000 + GAP + 1, // ainda válido dentro do gap
        isBloqued: false,
      },
    });
    assert.deepStrictEqual(d, { action: 'reuse', accessToken: 'NOVO' });
  });

  test('invalid_grant sem refresh concorrente bloqueia', () => {
    const d = decide({
      ...base,
      isInvalidGrant: true,
      current: { updatedAtMs: 1000, accessToken: 'X', expiredAtMs: 999 },
    });
    assert.deepStrictEqual(d, { action: 'block' });
  });

  test('token concorrente presente mas expirado não é reusado', () => {
    const d = decide({
      ...base,
      isInvalidGrant: true,
      current: { updatedAtMs: 4000, accessToken: 'NOVO', expiredAtMs: 5000 }, // nowMs+gap não cabe
    });
    assert.deepStrictEqual(d, { action: 'block' });
  });

  test('doc concorrente bloqueado não é reusado', () => {
    const d = decide({
      ...base,
      isInvalidGrant: true,
      current: {
        updatedAtMs: 4000, accessToken: 'NOVO', expiredAtMs: 5000 + GAP + 1, isBloqued: true,
      },
    });
    assert.deepStrictEqual(d, { action: 'block' });
  });

  test('erro transitório abaixo do limite apenas conta o erro', () => {
    const current = { updatedAtMs: 1000, countErr: 1 };
    const d = decide({ ...base, isInvalidGrant: false, current });
    assert.deepStrictEqual(d, { action: 'countErr' });
  });

  test('erro transitório acima do limite bloqueia', () => {
    const current = { updatedAtMs: 1000, countErr: 3 };
    const d = decide({ ...base, isInvalidGrant: false, current });
    assert.deepStrictEqual(d, { action: 'block' });
  });
});
