# `@cloudcommerce/app-braspag`

## Card script on checkout

Modules API caps `js_client.onload_expression` at 3000 characters; over it the
`list_payments` response fails validation and the checkout drops every Braspag
method, Pix and billet included. The card client (ClearSale fingerprint, Silent
Order Post and 3DS, `assets/braspag-card-client.js`) is about 5800 characters
minified and the 3DS token alone about 1200, so the expression only sets the
`window` variables and runs a small loader (`assets/braspag-onload-expression.js`).

The loader gets the card client from jsDelivr, pinned to the package major
version (`assets/` is published to npm), with unpkg as fallback, same as the
checkout app script. The major pin makes a card client fix reach every store
without waiting for each one to update the app, and in turn makes the script a
contract: within a major, the `window` variables (`_braspag*`) and the card
hash format (`token`, `fingerPrintId`, `status3ds`, `out3ds`) must stay
compatible with previous versions (see the header of
`assets/braspag-card-client.js`). `lib-mjs/lib/braspag/js-client.mjs` builds
the expression and checks the limit: over it, 3DS is dropped when optional, or
the credit card is unlisted when 3DS is required. Pix and billet are never
affected.

Before a release the pinned version doesn't have the new card client on npm.
To test unreleased code on a store, set `BRASPAG_CARD_CLIENT_URI` to the file
served from GitHub, e.g.
`https://cdn.jsdelivr.net/gh/ecomplus/cloud-commerce@<commit>/packages/apps/braspag/assets/braspag-card-client.js`.

## Silent Order Post

The card goes from the browser straight to the SOP API, which answers a
`PaymentToken` for the transaction.

- **Cielo merchants:** the SOP script posts to Braspag unless `provider` is
  `cielo`, and Braspag answers 500 to a Cielo merchant. With `is_cielo` in
  production, `list_payments` loads the Cielo SOP script, and the card client
  sets `provider: 'cielo'` when that script is on the page.
- **Single-use token:** each SOP access token tokenizes one card; reused, the
  API answers 500 without CORS headers. Every `list_payments` gets a new token
  (no cache), and a second attempt on the same page asks the buyer to reload.

## 3DS (Cielo MPI)

Credit card authentication with the Cielo 3DS script (MPI V2), configured on
`braspag_3ds` (app hidden data):

| Field | Effect |
|---|---|
| `client_id`, `client_secret` | 3DS credentials (Cielo e-commerce portal) |
| `establishment_code`, `merchant_name`, `mcc` | Merchant data sent to the MPI token |
| `required` | **No card without 3DS.** Any result other than authenticated is refused before calling Cielo (failed challenge, card not enrolled, brand without 3DS, script error or timeout). If the 3DS token can't be generated, credit card is not listed and Pix/billet keep working |
| `timeout` | Seconds for the cardholder to finish the challenge (30–900; default 300 when required, 30 otherwise) |
| `fraud_analysis` | Keep ClearSale fraud analysis on authenticated transactions (default: authenticated ones are captured without it, as before) |

In production the MPI refuses the whole authentication with `102` "Invalid
field value" when a buyer field is out of format, empty ones included. The card
client sends only valid values: phone as `55` + area code + number, zip code
with 8 digits, CPF/CNPJ digits, and `bpmpi_merchant_url` from the page origin
when `storefront.settings` is empty (v3 checkout).

Accepted ECI (Cielo table): Visa, Elo and Amex `05`/`06`, Mastercard `02`/`01`.
The result goes to the transaction `custom_fields` (`3ds`, `3ds_eci`,
`3ds_versao`, `3ds_referencia`), shown on the order.

The 3DS rules live in `lib-mjs/lib/braspag/3ds/policy.mjs`, apart from the
authentication script: MPI V3 keeps the same authorization data (Cavv, Xid,
Eci, Version, ReferenceId), so only the browser/token step changes.

Admin settings schema for the Market app, inside `braspag_3ds.schema.properties`:

```json
"required": {
  "type": "boolean",
  "default": false,
  "title": "3DS obrigatório",
  "description": "Recusar compra no cartão não autenticada e ocultar o cartão quando o 3DS estiver indisponível"
},
"timeout": {
  "type": "integer",
  "minimum": 30,
  "maximum": 900,
  "title": "Tempo para o desafio (segundos)"
},
"fraud_analysis": {
  "type": "boolean",
  "default": false,
  "title": "Antifraude também nas compras autenticadas"
}
```

Unit tests: `node --test tests-unit/`.
