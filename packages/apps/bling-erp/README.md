# `@cloudcommerce/app-bling-erp`

Integração com o [Bling ERP](https://www.bling.com.br/) usando a
[API v3](https://developer.bling.com.br/referencia), portada do app
`app-bling-erp-v2` para o monorepo Cloud Commerce.

## Funções

| Função | Descrição |
|---|---|
| `blingerp-onStoreEvent` | Trata eventos da loja (pedidos, produtos e fila manual em `applications-dataSet`) exportando/importando do Bling |
| `blingerp-callback` | Recebe os callbacks de estoque e pedidos configurados no Bling |
| `blingerp-authCallback` | Recebe o `code` do fluxo OAuth do Bling e salva os tokens |
| `blingerp-cronRefreshToken` | Renova o `access_token` antes de expirar (`CRONTAB_BLINGERP_REFRESH_TOKEN`) |

## Autorização

1. Configure `client_id` e `client_secret` (do aplicativo criado no
   [Bling Developer](https://developer.bling.com.br/aplicativos)) nas configurações do app;
2. Cadastre a URL de redirecionamento do aplicativo no Bling apontando para a função
   `blingerp-authCallback`:
   `https://<region>-<project>.cloudfunctions.net/blingerp-authCallback`;
3. Autorize o aplicativo pelo Bling — os tokens ficam salvos no Firestore em
   `blingTokens/{clientId}`.

## Callbacks do Bling

Cadastre no Bling (Preferências > Integrações > Callbacks) a URL da função
`blingerp-callback`. Recomendado: defina a variável de ambiente
`BLINGERP_CALLBACK_TOKEN` (input `blingerp-callback-token` na GitHub Action de
deploy, ou o campo `callback_token` nas configurações do app) e
inclua `?token=<valor>` na URL. Sem isso o app aceita qualquer requisição com corpo
válido (e registra um aviso no log) — o conteúdo do callback não é confiado, todos
os dados são relidos da API do Bling, mas o token evita processamento indevido.

## Produtos com variações

Preencha o **código (SKU) de cada variação no Bling**. Variações criadas sem código
são importadas usando o ID do Bling como SKU na loja — funciona, inclusive para
sincronizar estoque, mas gera SKUs numéricos. Se o código for preenchido depois, a
variação passa a ser tratada como uma nova (o casamento é por SKU).

O Bling ignora o preço enviado em cada variação ao salvar o produto pai, aplicando o
preço do pai a todas; o app corrige isso com um `PUT /produtos/{idVariacao}` apenas
para as variações com preço diferente do produto principal.

## Testes

```bash
pnpm --filter @cloudcommerce/app-bling-erp build
pnpm --filter @cloudcommerce/app-bling-erp test
```

Os testes em `tests/` cobrem os parsers (pedido/produto/status/endereço em ambas as
direções) e rodam offline — sem credenciais do Bling nem da Store API.

Para validar credenciais e endpoints contra a API real (somente leitura, nada é
criado ou alterado):

```bash
BLING_ACCESS_TOKEN=... node scripts/bling-smoke.mjs [SKU] [NUMERO_PEDIDO]
```

Use o `access_token` do doc `blingTokens/{clientId}` de uma loja já autorizada
(válido por ~6h). O script também aceita `BLING_CLIENT_ID` + `BLING_CLIENT_SECRET`
+ `BLING_REFRESH_TOKEN`, **mas o Bling rotaciona o refresh token a cada uso**: se
ele veio de uma integração ativa, grave o novo refresh token impresso pelo script
de volta no doc do Firestore, senão o próximo refresh da integração recebe
`invalid_grant` e ela é bloqueada até reautorizar.

## Coleções no Firestore

- `blingTokens/{clientId}`: tokens OAuth, flags de bloqueio e de limite diário;
- `blingStatuses/{clientId}`: cache (1h) das situações do módulo de vendas.
