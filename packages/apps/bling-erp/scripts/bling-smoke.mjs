/* eslint-disable no-console */
/*
Read-only smoke test against the real Bling API (v3), to validate credentials,
scopes and every endpoint used by the app. Nothing is created or updated.

Usage:
  BLING_ACCESS_TOKEN=... node scripts/bling-smoke.mjs [SKU] [NUMERO_PEDIDO]

Get `BLING_ACCESS_TOKEN` from the `access_token` on the Firestore doc
`blingTokens/{clientId}` of an already authorized store (valid for ~6h).

Running with BLING_CLIENT_ID + BLING_CLIENT_SECRET + BLING_REFRESH_TOKEN is
also supported BUT the refresh token is rotated on use: the store integration
keeps the old one and gets `invalid_grant` on the next refresh, blocking it.
Only use it with a token that is NOT stored by a live integration, or save the
printed new refresh token back to the Firestore doc right after running.
*/
import { URLSearchParams } from 'node:url';

const {
  BLING_ACCESS_TOKEN: directAccessToken,
  BLING_CLIENT_ID: clientId,
  BLING_CLIENT_SECRET: clientSecret,
  BLING_REFRESH_TOKEN: refreshToken,
} = process.env;
const [sku, orderNumber] = process.argv.slice(2);

if (!directAccessToken && (!clientId || !clientSecret || !refreshToken)) {
  console.error('Set BLING_ACCESS_TOKEN (preferred, no token rotation)'
    + ' or BLING_CLIENT_ID + BLING_CLIENT_SECRET + BLING_REFRESH_TOKEN');
  process.exit(1);
}

const BASE_URL = 'https://api.bling.com.br/Api/v3';
let checks = 0;
let failures = 0;

const getAccessToken = async () => {
  if (directAccessToken) {
    console.log('✓ Using BLING_ACCESS_TOKEN directly (no refresh, nothing is rotated)');
    return directAccessToken;
  }
  console.warn('⚠ Refreshing rotates the refresh token: if it came from a live'
    + ' integration, save the printed new refresh_token back to the Firestore doc'
    + ' `blingTokens/{clientId}`, or the integration will be blocked on invalid_grant');
  const res = await fetch(`${BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Accept': '1.0',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }).toString(),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`OAuth failed (${res.status}): ${JSON.stringify(data)}`);
  }
  console.log(`✓ OAuth refresh_token => access_token (expires_in ${data.expires_in}s)`);
  console.log(`  next refresh_token: ${data.refresh_token}`);
  return data.access_token;
};

const accessToken = await getAccessToken();

const check = async (label, endpoint, { optional = false } = {}) => {
  checks += 1;
  // Bling rate limit: 3 req/s
  await new Promise((resolve) => { setTimeout(resolve, 400); });
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  let body;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) {
    const msg = `${res.status} ${JSON.stringify(body?.error || body)}`;
    if (optional) {
      console.log(`~ ${label}: ${msg}`);
    } else {
      failures += 1;
      console.log(`✗ ${label} [${endpoint}]: ${msg}`);
    }
    return null;
  }
  const { data } = body;
  const count = Array.isArray(data) ? `${data.length} item(s)` : 'object';
  console.log(`✓ ${label} [${endpoint}]: ${count}`);
  if (process.env.BLING_SMOKE_DUMP) {
    console.log(`${JSON.stringify(data, null, 2)}\n`);
  }
  return data;
};

const modules = await check('Situações: módulos', '/situacoes/modulos');
const salesModule = Array.isArray(modules)
  && modules.find(({ nome }) => nome?.toLowerCase() === 'vendas');
if (salesModule) {
  const situacoes = await check(
    'Situações do módulo de vendas',
    `/situacoes/modulos/${salesModule.id}`,
  );
  if (Array.isArray(situacoes)) {
    console.log(`  ${situacoes.map(({ nome }) => nome).join(', ')}`);
  }
} else {
  failures += 1;
  console.log('✗ Módulo "Vendas" não encontrado em /situacoes/modulos');
}

await check('Tipos de contato', '/contatos/tipos');
await check('Formas de pagamento', '/formas-pagamentos');
await check('Categorias de produtos', '/categorias/produtos');

let sampleSku = sku;
if (!sampleSku) {
  const produtos = await check('Primeiro produto (amostra)', '/produtos?limite=1');
  sampleSku = Array.isArray(produtos) && produtos[0]?.codigo;
}
if (sampleSku) {
  const produtos = await check(
    `Produto por código ${sampleSku}`,
    `/produtos?codigo=${sampleSku}`,
  );
  const blingProduct = Array.isArray(produtos) && produtos[0];
  if (blingProduct) {
    const produto = await check('Produto completo', `/produtos/${blingProduct.id}`);
    const idsProdutos = [blingProduct.id]
      .concat((produto?.variacoes || []).map(({ id }) => id));
    await check(
      'Saldos de estoque',
      `/estoques/saldos?${idsProdutos.map((id) => `idsProdutos[]=${id}`).join('&')}`,
    );
  }
}

let sampleOrderNumber = orderNumber;
if (!sampleOrderNumber) {
  const pedidos = await check('Último pedido (amostra)', '/pedidos/vendas?limite=1');
  sampleOrderNumber = Array.isArray(pedidos) && pedidos[0]?.numero;
}
if (sampleOrderNumber) {
  const pedidos = await check(
    `Pedido por número ${sampleOrderNumber}`,
    `/pedidos/vendas?numero=${sampleOrderNumber}`,
  );
  const blingOrder = Array.isArray(pedidos) && pedidos[0];
  if (blingOrder) {
    const pedido = await check('Pedido completo', `/pedidos/vendas/${blingOrder.id}`);
    if (pedido?.situacao?.id) {
      await check('Situação do pedido', `/situacoes/${pedido.situacao.id}`);
    }
  }
}

console.log(`\n${checks - failures}/${checks} checks OK`);
process.exit(failures ? 1 : 0);
