import assert from 'node:assert';
import test, { describe } from 'node:test';
import redactSecrets, { isAuthRequest } from '../lib/integration/helpers/redact-secrets.js';

// Os `logs` do app vão para o `hidden_data`, lido no painel do lojista: o corpo
// do `/oauth/token` (que carrega o refresh token do Bling) não pode chegar lá.
describe('Redact Bling credentials from app logs', () => {
  test('não vaza o refresh token do corpo urlencoded do OAuth', () => {
    const notes = redactSecrets('POST /oauth/token '
      + '"grant_type=refresh_token&refresh_token=abc.DEF-123"');
    assert.ok(!notes.includes('abc.DEF-123'));
    assert.match(notes, /refresh_token=\[REDACTED\]/);
  });

  test('não vaza tokens de respostas JSON', () => {
    const notes = redactSecrets('{"access_token":"xyz","refresh_token":"zzz","expires_in":21600}');
    assert.ok(!notes.includes('xyz'));
    assert.ok(!notes.includes('zzz'));
    assert.match(notes, /"expires_in":21600/);
  });

  test('mantém os dados úteis do erro', () => {
    const notes = '{"error":{"type":"invalid_grant","error_code":42,"description":"expirado"}}';
    assert.strictEqual(redactSecrets(notes), notes);
  });

  test('não confunde `codigo`/`codigoRastreamento` do Bling com o `code` do OAuth', () => {
    const notes = 'PUT /produtos {"codigo":"SKU-1","codigoRastreamento":"BR123"}';
    assert.strictEqual(redactSecrets(notes), notes);
  });

  test('reconhece a requisição de autenticação', () => {
    assert.strictEqual(isAuthRequest('/oauth/token'), true);
    assert.strictEqual(isAuthRequest('/pedidos/vendas'), false);
    assert.strictEqual(isAuthRequest(undefined), false);
  });
});
