# `@cloudcommerce/app-braspag`

## Card script on checkout

Modules API caps `js_client.onload_expression` at 3000 characters; over it the
`list_payments` response fails validation and the checkout drops every Braspag
method, Pix and billet included. The card client (ClearSale fingerprint, Silent
Order Post and 3DS, `assets/braspag-card-client.js`) is about 5800 characters
minified and the 3DS token alone about 1200, so the expression only sets the
`window` variables and runs a small loader (`assets/braspag-onload-expression.js`).

The loader gets the card client from jsDelivr, pinned to the running package
version (`assets/` is published to npm), with unpkg as fallback, same as the
checkout app script. `lib-mjs/lib/braspag/js-client.mjs` builds the expression
and checks the limit: over it, 3DS is dropped when optional, or the credit card
is unlisted when 3DS is required. Pix and billet are never affected.

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
