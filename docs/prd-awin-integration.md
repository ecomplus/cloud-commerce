# PRD — Integração de Rastreamento de Conversão Awin

Status: **Quase completo.** Fase 1 (S2S) e Fase 2 (pixel de fallback) implementadas em código; Fase 1.5 (Conversion Tag client-side) cancelada — Awin confirmou que não é necessária. MasterTag inserida no CMS (commit real [`62718c0`](https://github.com/tiasonia/tiasonia/commit/62718c0), 2026-07-20 — ver correção de data no handoff), falta validar em produção. Restam: pergunta sobre Custom Parameter de pagamento via `custom` da Conversion API, typecheck/lint real do projeto, e teste/homologação real contra a API da Awin. Ver seção 9.
Autor: gerado com Claude Code a partir da doc oficial Awin (Guia de Implementação Técnica v4 BR) e do código atual do monorepo
Última atualização: 2026-07-20

## 1. Contexto

A Awin é uma rede de afiliados. Para que afiliados sejam remunerados corretamente e a loja apareça nos relatórios da rede, é preciso implementar o rastreamento de conversão da Awin conforme a "Política de Rastreamento Awin", que define 5 elementos (3 obrigatórios, 1 obrigatório-condicional, 1 opcional):

| Elemento | Obrigatoriedade | Onde roda |
|---|---|---|
| MasterTag / Tag de Jornada | Obrigatório | Todas as páginas |
| Tag de Conversão (client-side) | Obrigatório | Página de confirmação |
| Server-to-Server (S2S) | Obrigatório | Backend, no momento da conversão |
| Pixel de Conversão Fall-back | Obrigatório | Página de confirmação |
| Rastreamento em nível de produto | Opcional | Página de confirmação |

## 2. Estado atual no código (importante — não é greenfield)

Uma integração parcial com a Awin **já existe** no monorepo, dentro do pipeline de analytics server-side do SSR (o mesmo pipeline que já envia eventos para GA4, Meta e TikTok):

- [packages/ssr/src/lib/analytics/send-to-awin.ts](packages/ssr/src/lib/analytics/send-to-awin.ts) — chama a **Awin Conversion API REST moderna** (`POST https://api.awin.com/s2s/advertiser/{AWIN_ADVERTISER_ID}/orders`, autenticada com header `x-api-key`), e não o formato legado baseado em URL/pixel (`sread.php`) descrito no PDF anexado. Esse é o elemento "**Server-to-Server**" da política, e já cobre o essencial do "**Rastreamento em nível de produto**" (envia `basket[]` no corpo JSON).
- [packages/ssr/src/lib/analytics/send-analytics-events.ts:85-89](packages/ssr/src/lib/analytics/send-analytics-events.ts#L85-L89) — dispara `sendToAwin` junto com os demais providers sempre que chega um evento `purchase` no endpoint `POST /_analytics` do SSR ([packages/ssr/src/lib/serve-storefront.ts](packages/ssr/src/lib/serve-storefront.ts), rota `/_analytics`).
- [packages/storefront/src/analytics/set-tracking-ids.ts:45-88](packages/storefront/src/analytics/set-tracking-ids.ts#L45-L88) — já captura `awc` (query string ou cookie `awc`) e `awin_channel` (cookie `AwinChannelCookie`) no client, persiste em `sessionStorage` e repassa no payload enviado a `/_analytics`.
- Credenciais (`AWIN_ADVERTISER_ID`, `AWIN_API_KEY`) já são variáveis de ambiente por loja, definidas via secrets do GitHub Action de deploy ([action.yml:305-306,363-364](action.yml#L305-L306)) — mesmo padrão usado para `GA_MEASUREMENT_ID`/`FB_PIXEL_ID`/`TIKTOK_PIXEL_ID`.
- Sem testes automatizados hoje (nenhum dos forwarders de analytics tem testes).
- Erros são só logados (`logger.warn`, fire-and-forget via `Promise.allSettled`), sem retry — mesmo padrão dos outros providers de analytics.

**Conclusão**: o elemento "Server-to-Server" já está tecnicamente implementado, usando uma API mais moderna que o PDF anexado (que descreve principalmente a versão legada por pixel). Os elementos ausentes ou incompletos são: MasterTag, **Conversion Tag client-side (correção — ver abaixo)**, Pixel de Fall-back, e o refinamento de dados enviados no S2S (moeda dinâmica, grupos de comissão, testmode). Este PRD trata desses gaps.

**Correção (após 2ª rodada de pesquisa na doc oficial da Awin)**: eu havia assumido inicialmente que a Conversion Tag client-side (declaração JS da venda, `AWIN.Tracking.Sale`, na página de confirmação) seria redundante já que o S2S via Conversion API está implementado. **Isso está incorreto.** A doc oficial da Awin (`help.awin.com/developers/docs/gtm-client-side`) descreve **3 tags client-side distintas** (MasterTag, "AW Last Click Identifier", e Conversion Tag) e instrui explicitamente a implementar client-side **e** server-to-server em conjunto, não como alternativas — é o modelo "hybrid tracking" deles. Portanto:
- **Conversion Tag client-side não está implementada em lugar nenhum do código** — isso é um gap real, distinto do S2S, e precisa entrar no escopo (ver seção 4.4).
- **"AW Last Click Identifier"** é um elemento que não tínhamos mapeado antes — precisa confirmar com a Awin se a captura atual de `awc`/cookie `AwinChannelCookie` em [set-tracking-ids.ts](packages/storefront/src/analytics/set-tracking-ids.ts) já cobre essa função, ou se é uma tag/script separado.

## 3. Objetivo

Deixar a integração Awin em conformidade com os 3 elementos obrigatórios da política de rastreamento (MasterTag, S2S, Pixel Fall-back) e refinar o S2S existente para suportar corretamente moeda, grupos de comissão e modo de teste — reaproveitando a arquitetura/stack já usada pelas integrações de analytics existentes (GA4, Meta, TikTok), sem criar um novo padrão.

### Não-objetivos (fora de escopo deste PRD)
- Feed de produtos para a Awin — a Awin pediu inicialmente (seção 9, pergunta 4 deles), mas **confirmaram que não será necessário adaptar** o feed existente (`packages/feeds`, `/_feeds/catalog.xml`). Item resolvido, sem trabalho adicional.
- Grupos de comissão além de `DEFAULT` — confirmado que a loja inicia com um único grupo (`DEFAULT`), suportado por `commissionGroups: [{ code: 'DEFAULT', amount }]` já hoje. Suporte a múltiplos grupos (`NEW`/`EXISTING`/`VOUCHER`/`PRODUCT_X`) fica para um PRD futuro, se/quando a loja precisar diferenciar comissão por segmento.
- Injeção de código da MasterTag pelo storefront — confirmado que será inserida via CMS (custom script), não pelo código deste repositório. Ver seção 4.1.
- SDK mobile (Tune/Adjust/AppsFlyer/etc.) — não há app mobile neste projeto.
- Deduplicação avançada entre canais pagos (Apêndices/Prefixos de clique) — depende de acordo comercial com a Awin, tratar caso a caso depois que o rastreamento básico estiver validado.
- CSP (Content-Security-Policy) — o storefront hoje **não define CSP** (`packages/feeds` define CSP só para o serviço de feeds, não para o storefront). Não é um bloqueio agora; só vira relevante se/quando alguém adicionar CSP ao storefront.
- Múltiplas contas Awin por instalação — confirmado modelo uma loja = uma conta Awin (um `AWIN_ADVERTISER_ID`/`AWIN_API_KEY` por deploy), igual ao padrão já usado para GA/Meta/TikTok.

## 4. Requisitos funcionais

### 4.1 MasterTag — via CMS (confirmado, sem código neste repo)
- **Decisão confirmada**: a MasterTag (`https://www.dwin1.com/{AWIN_ADVERTISER_ID}.js`) será inserida pelo time de CMS/conteúdo via custom script, seguindo o mesmo modelo já usado hoje para outros pixels (o storefront não injeta `gtag.js`/`fbevents.js`/TikTok Pixel — só assume que `window.gtag`/`window.fbq`/`window.ttq` já existem).
- Entregável deste PRD para essa parte é **documentação de configuração**, não código: informar ao time de CMS o script exato, o `AWIN_ADVERTISER_ID` (MID) da loja, e a regra de posicionamento (todas as páginas, exceto páginas com dados de pagamento sensíveis, conforme pág. 5 do guia Awin). **Feito** — ver [docs/awin-mastertag-cms-handoff.md](awin-mastertag-cms-handoff.md) (inserido em `functions/ssr/content/layout.json` da tiasonia via `window.$delayedAsyncScripts`, não o `<script defer>` literal — mecanismo diferente, mesmo efeito, ver detalhe no handoff).
- Sem mudança em `packages/storefront` para este item.
- **Alternativa considerada e descartada (2026-07-15)**: renderizar a tag via código server-side em [BaseHead.astro](packages/storefront/src/lib/layouts/BaseHead.astro), reaproveitando o secret `AWIN_ADVERTISER_ID` já existente (esse arquivo já injeta outros valores de ambiente como `window.X` por página, no mesmo padrão). Seria tecnicamente mais confiável (sem depender de ação manual do time de CMS), mas exigiria investigar qual rota do storefront corresponde à página de pagamento para excluir corretamente a tag dela — decisão do usuário foi manter via CMS mesmo assim, sem essa investigação adicional.

### 4.2 Pixel de Conversão Fall-back — implementado (2026-07-15, adiantado da Fase 2)
- A própria documentação da Awin lista este elemento como **"Obrigatório"** na tabela de dependências (pág. 4 do guia: "Pixel de conversão Fall-back ... Modo alternativo de rastreamento ... Obrigatório"), então não é dispensável mesmo já existindo o S2S via REST API.
- **Priorização**: originalmente planejado por último (depois de validar S2S + Conversion Tag client-side em produção), mas adiantado a pedido do usuário em 2026-07-15 enquanto a Fase 1.5 (Conversion Tag client-side, seção 4.4) segue bloqueada aguardando resposta da Awin — o pixel de fallback é independente dessa resposta.
- **Implementado client-side**, disparado no browser (não no servidor), para ser redundante em relação ao S2S da Awin e não compartilhar os mesmos pontos de falha:
  - [packages/storefront/client.d.ts](packages/storefront/client.d.ts): novo campo `AWIN_ADVERTISER_ID?: string` no tipo `Window`.
  - [packages/storefront/src/lib/layouts/BaseHead.astro](packages/storefront/src/lib/layouts/BaseHead.astro): expõe `window.AWIN_ADVERTISER_ID` a partir do env var/secret já existente (mesmo padrão de `GOOGLE_ADS_ID`/`GIT_BRANCH`; valor não sensível, é o mesmo MID já público na URL da MasterTag).
  - [packages/storefront/src/lib/scripts/vbeta-app.ts](packages/storefront/src/lib/scripts/vbeta-app.ts): função `emitAwinFallbackPixel`, chamada logo após `emitGtagEvent('purchase', ...)` dentro de `emitPurchase`. Só dispara se `window.AWIN_ADVERTISER_ID` e `trackingIds.awc` estiverem presentes (mesmo gate usado em `send-to-awin.ts` no S2S). Usa `window.ECOM_CURRENCY` para moeda (já injetado por `BaseHead.astro`) e `trackingIds.awin_channel` para canal.
- **Ressalva conhecida**: o formato de URL documentado pela Awin para este pixel (pág. 9 do guia) não inclui parâmetro de `awc`/`cks` explícito — a atribuição do clique depende do cookie que a própria Awin gerencia via MasterTag no navegador. Como a MasterTag ainda não foi inserida pelo CMS (seção 4.1), esse pixel pode não atribuir corretamente a venda a um afiliado até a MasterTag estar ativa em produção — isso não é um bug do código, é uma dependência entre os elementos.
- **Ainda falta**: rodar o typecheck/lint real do projeto sobre essas mudanças (não foi possível neste ambiente) e testar de fato na página de confirmação.

### 4.3 Refinamento do S2S existente (`send-to-awin.ts`)
Gaps identificados no código atual ([send-to-awin.ts:37-58](packages/ssr/src/lib/analytics/send-to-awin.ts#L37-L58)), já cruzados com o schema oficial da REST API moderna (`developer.awin.com/apidocs/conversion-api` — referenciada no próprio código, e **diferente** do fluxo legado por pixel/URL documentado no PDF anexado). Grupos de comissão **não entram nesta lista** — confirmado que a loja usa só `DEFAULT` por enquanto, e o código já cobre isso corretamente:

| Campo | Hoje | Requisito |
|---|---|---|
| `currency` | fallback fixo `'BRL'` (campo **obrigatório** no schema da Awin) | usar a moeda real da loja via `config.get().currency` (`@cloudcommerce/config`, já disponível em `packages/ssr` — ver [config.ts:12,39](packages/config/src/config.ts#L12)) |
| `category` no `basket[]` | **bug**: código lê `item.category`, mas o evento `purchase` nunca preenche esse campo — o gtag item real usa `item_category` ([use-analytics.ts:277](packages/storefront/src/lib/state/use-analytics.ts#L277)). Ou seja, hoje a Awin **nunca recebe a categoria real**, sempre cai em `item_brand` ou `item_id` | corrigir para ler `item.item_category` (campo é **obrigatório** no schema da Awin) |
| `testmode` | não enviado | **não existe campo de test mode no body desta REST API** (confirmado na doc oficial — `isTest` só aparece na *resposta*, não como parâmetro de entrada; isso é diferente do `testmode=0` da URL legada descrita no PDF). Remover esse item do escopo: não há o que implementar aqui. Testes reais em produção via este endpoint **geram pedido real** do lado da Awin — o teste precisa ser feito com o link de afiliado de teste da Awin e validado com o contato de integração deles (ver seção 6) |
| `channel` | usa `payload.awin_channel` ou `'aw'` (campo **obrigatório**) | validar/normalizar contra a lista fechada de valores aceitos pela Awin (`aw`, `ppcgeneric`, `ppcbrand`, `display`, `social`, `Other`, `Organic`, `direct`) |
| `voucher` (valor do desconto) | `params.value` = `amount.total` do pedido (já vem da API do e-com.plus, presumivelmente líquido de desconto) | confirmar que `amount.total` já reflete o valor líquido pós-desconto, como a Awin exige |
| Caracteres `\|` em `id`/`name`/`sku`/`category` | não sanitizado | a Awin proíbe o caractere pipe (`\|`) nesses campos do `basket[]` — sanitizar antes de enviar |

**Achado extra (não bloqueante, fica para depois)**: o schema oficial tem um campo `customerAcquisition` (enum `NEW`/`RETURNING`) no nível do pedido — isso pode resolver a segmentação "novos vs. existentes" do guia Awin **sem precisar de múltiplos `commissionGroups`**, se a loja quiser isso no futuro.

### 4.4 Conversion Tag client-side — RESOLVIDO: não é necessária (2026-07-15)
- A Awin confirmou explicitamente: com a Conversion API (S2S) ativa, a Conversion Tag client-side (`AWIN.Tracking.Sale`) **pode ser dispensada** — o S2S é suficiente para registrar conversões.
- **Fase 1.5 cancelada.** Nenhuma implementação necessária em `packages/storefront` para este item.
- Ressalva importante trazida pela própria Awin: a **MasterTag continua obrigatória** mesmo sem a Conversion Tag — ela não serve só para tracking de conversão, é a base de funcionamento dos tech partners da Awin (cupom, cashback, comparadores de preço). Sem ela, esses parceiros não operam no programa. Isso reforça a importância da seção 4.1 (MasterTag via CMS), já **inserida** — falta só validar em produção.

### 4.5 "AW Last Click Identifier" — RESOLVIDO: já coberto (2026-07-15)
- A Awin confirmou: é exatamente a captura do parâmetro `awc` da URL e o armazenamento no cookie `AwinChannelCookie`, já implementado em [set-tracking-ids.ts](packages/storefront/src/analytics/set-tracking-ids.ts) — mesmo conceito, nome diferente na doc de GTM. **Nenhuma implementação adicional necessária.**

## 5. Arquitetura proposta

### 5.1 Fases de implementação
1. **Fase 1 — Refinamento do S2S** (seção 4.3): moeda dinâmica, correção do bug de `category`, validação de `channel`/`voucher`, sanitização. **Implementada.**
2. **Fase 1 (paralelo) — Handoff da MasterTag para o CMS** (seção 4.1): documentação entregue e **script inserido no CMS**. Falta validar em produção.
3. ~~Fase 1.5 — Conversion Tag client-side~~ — **cancelada** (seção 4.4): a Awin confirmou que não é necessária com o S2S ativo.
4. **Fase 2 — Pixel de Conversão Fall-back** (seção 4.2): **implementada**, adiantada antes mesmo da resposta da Awin sobre a Fase 1.5 (que acabou sendo cancelada de qualquer forma).

Sem novo padrão — reaproveita 100% a estrutura existente:
- Continua vivendo em `packages/ssr/src/lib/analytics/send-to-awin.ts`, chamado por `send-analytics-events.ts`, disparado pelo endpoint `/_analytics` do SSR a partir do evento `purchase` client-side.
- Configuração continua via variáveis de ambiente por loja (`AWIN_ADVERTISER_ID`, `AWIN_API_KEY`), setadas via secrets do GitHub Action de deploy — mesmo mecanismo de `GA_MEASUREMENT_ID`/`FB_PIXEL_ID`/`TIKTOK_PIXEL_ID`.
- Captura de `awc`/`awin_channel` continua em `packages/storefront/src/analytics/set-tracking-ids.ts`.
- Cliente HTTP: `axios`, mesmo padrão dos outros forwarders (`send-to-ga4.ts`, `send-to-meta.ts`, `send-to-tiktok.ts`).
- Tratamento de erro: mesmo padrão fire-and-forget com log via `logger.warn` em `send-analytics-events.ts` (sem retry) — consistente com os demais providers.

## 6. Testes / QA

- Não há testes automatizados hoje para nenhum forwarder de analytics (`send-to-*.ts`); manter consistência significa não introduzir um framework de teste novo só para a Awin, a menos que se decida cobrir toda a pasta `analytics/` de uma vez (seria um projeto à parte).
- QA manual seguindo o roteiro oficial da Awin (pág. 20 do guia): link de afiliado de teste, checkout com 3 produtos de grupos de comissão distintos, voucher aplicado, inspeção da aba Network filtrando por `merchant=XXXX` para conferir o payload enviado.
- Adicionar log de debug condicional (`DEBUG_SERVER_ANALYTICS`, já existente) para inspecionar o payload exato enviado à Awin durante QA — já implementado em `send-to-awin.ts:62-64`, sem mudanças necessárias aqui.

## 7. Decisões confirmadas

1. **MasterTag**: inserida via CMS (custom script), fora do código deste repositório. Sem mudança em `packages/storefront`.
2. **Grupos de comissão**: apenas `DEFAULT` inicialmente. Suporte a múltiplos grupos fica fora de escopo deste PRD (seção 3).
3. **Pixel de Fall-back**: confirmado como obrigatório pela própria documentação da Awin (pág. 4). Implementado por último (Fase 2), depois do refinamento do S2S.
4. **Escopo multi-loja**: confirmado modelo uma loja = uma conta Awin (um `AWIN_ADVERTISER_ID`/`AWIN_API_KEY` por deploy), igual ao já usado para GA/Meta/TikTok.
5. **Loja piloto**: [tiasonia/tiasonia](https://github.com/tiasonia/tiasonia). Já existem secrets `AWIN_ADVERTISER_ID` e `AWIN_API_KEY` configurados no repositório (Settings → Secrets and variables → Actions), mas **a validade deles ainda não foi confirmada** — pendente confirmação com o cliente antes de rodar qualquer teste/homologação real.
6. **MID confirmado pela Awin**: `128977`. Precisa bater com o valor já salvo no secret `AWIN_ADVERTISER_ID` do repo `tiasonia/tiasonia` — conferir manualmente (não dá para ler o valor do secret via API/CLI, só sobrescrever).
7. **Método client-side escolhido**: "Direct Integration" (via código/CMS), não GTM — consistente com a decisão já tomada no item 1 (MasterTag via CMS custom script, sem uso de GTM).
8. **Método S2S escolhido**: **Conversion API (REST)** — é o que o código já implementa em `send-to-awin.ts`, e a própria doc da Awin recomenda explicitamente essa opção em vez do "Direct S2S" legado (`sread.php`): *"we highly recommend the use of our authenticated Conversion API instead"*. Não há mudança de arquitetura necessária.

## 9. Rodada de perguntas com a Awin

### 9.1 Primeira rodada — respondida parcialmente
Perguntas originais (integração legada vs. REST, validade de credenciais, testmode) — a Awin respondeu confirmando o MID e as opções de integração (ver 9.2). Validade das credenciais **resolvida** (ver 9.4). Modo de teste seguiu sem resposta direta — ver 9.4.

### 9.2 Segunda rodada — perguntas da Awin e itens já resolvidos
A Awin perguntou 5 coisas de volta (Click Appends/UTM, feed de produtos, custom parameter de método de pagamento, e pediu para escolhermos entre as opções de client-side/S2S — respondido nos itens 7.7 e 7.8 acima).

1. **Click Appends/UTM**: aceito o padrão sugerido pela Awin (`utm_source=awin&utm_id=!!!affid!!!_!!!clickref!!!&utm_campaign=afiliados`), enviado na resposta.
2. **Feed de produtos**: **resolvido** — Awin confirmou que não é necessário adaptar o feed existente (`/_feeds/catalog.xml`). Ver não-objetivo atualizado na seção 3.
3. **Custom Parameter para método de pagamento — pergunta mudou de escopo**: a pergunta original assumia a Conversion Tag client-side, que **foi cancelada** (seção 4.4). Como não teremos essa tag, o campo "Custom Parameters" dela não existe para nós. **Nova pergunta a fazer à Awin**: dá para enviar o método de pagamento pelo campo `custom` do corpo da Conversion API (S2S/REST) em vez disso? Se sim, qual chave numérica usar? O dado já está disponível no pedido: `order.transactions[].payment_method.code`/`.name` (ver [orders.d.ts:726-743](packages/api/types/orders.d.ts#L726)), mas a implementação em `send-to-awin.ts` ainda não foi feita — depende dessa resposta.

### 9.3 Terceira rodada — RESOLVIDA (2026-07-15)
Ao investigar mais a fundo a doc de client-side (`gtm-client-side`), descobrimos que o modelo atual da Awin tem **3 tags client-side** (MasterTag, "AW Last Click Identifier", Conversion Tag), não só a MasterTag — e que a doc deles instrui implementar client-side e S2S **em conjunto**, não como alternativas. Isso mudou o escopo (seção 4.4 e 4.5) temporariamente. A Awin respondeu:

1. **Conversion Tag client-side**: não é necessária — o S2S via Conversion API já é suficiente para registrar conversões. **Porém a MasterTag continua obrigatória**, não só para tracking de conversão, mas como base de funcionamento dos tech partners da Awin (cupom, cashback, comparadores de preço) — sem ela esses parceiros não operam no programa.
2. **"AW Last Click Identifier"**: é exatamente a captura de `awc`/cookie `AwinChannelCookie` que já fazemos hoje — mesmo conceito, nome diferente na doc de GTM. Nenhuma implementação adicional necessária.

**Fase 1.5 cancelada** (seção 4.4). MasterTag já **inserida no CMS** (seção 4.1), falta validar em produção.

### 9.4 Quarta rodada — credenciais de produção confirmadas
A Awin forneceu diretamente `AWIN_ADVERTISER_ID` (128977) e um novo `AWIN_API_KEY` válidos **para testes em produção** (não há ambiente de sandbox/modo de teste — qualquer pedido de teste real enviado ao endpoint gera efeito real do lado da Awin, conforme já alertado na seção 4.3). Os valores das credenciais não são registrados neste PRD (arquivo versionado em git) por serem segredos — conferir/atualizar diretamente no secret `AWIN_API_KEY` do repositório `tiasonia/tiasonia` (Settings → Secrets and variables → Actions). **Testes reais devem ser feitos com cautela**, cientes de que geram comissão real — coordenar com quem acompanha a conta do lado comercial antes de rodar o roteiro de homologação da seção 6.

## 8. Critérios de aceite

- [x] `send-to-awin.ts` envia a moeda real da loja (`config.get().currency`, não mais fallback fixo `'BRL'`). Implementado 2026-07-15.
- [x] Bug de `category` corrigido (`item.item_category` em vez de `item.category`), `channel` validado contra lista fechada, e valores de `id`/`name`/`sku`/`category` sanitizados contra o caractere `|`. Implementado 2026-07-15 — falta rodar typecheck/lint reais do projeto (não foi possível neste ambiente) e testar de fato contra a API da Awin.
- [x] `amount.total` confirmado como valor líquido de desconto ([orders.d.ts:204-220](packages/api/types/orders.d.ts#L204): `total` é "Order total amount", `discount` é campo separado). Verificado 2026-07-15 — sem mudança de código necessária.
  - Ressalva não bloqueante: não foi possível confirmar se `item.price` (unit_price por item, via `price()` de `@ecomplus/utils`) já vem pró-rateado com desconto de voucher a nível de item. Esse valor é compartilhado com GA4/Meta/TikTok (mesma função `getGtagItem`), então não é uma característica específica do Awin — tratar como um projeto à parte de qualidade de dados do pipeline de analytics como um todo, se necessário no futuro.
- [x] MasterTag documentada e entregue ao time de CMS — ver [docs/awin-mastertag-cms-handoff.md](awin-mastertag-cms-handoff.md) (script + MID 128977 + regra de posicionamento).
- [x] MasterTag inserida no CMS — commit [`62718c0`](https://github.com/tiasonia/tiasonia/commit/62718c0) em `main` da tiasonia, 2026-07-20 (data 2026-07-15 anterior estava incorreta, corrigida no handoff).
- [ ] MasterTag validada em produção (aparece nas páginas certas, ausente na página de pagamento — com a ressalva técnica documentada no handoff sobre essa exclusão). Checado em 2026-07-20 ~20:25 UTC, ainda não visível no HTML servido — deploy provavelmente ainda propagando, reconferir.
- [x] ~~Conversion Tag client-side~~ — **cancelada**, Awin confirmou que não é necessária com o S2S ativo (seção 4.4/9.3).
- [x] Pixel de fall-back implementado em `vbeta-app.ts`/`BaseHead.astro` (ver seção 4.2) — falta typecheck/lint real e teste em produção.
- [ ] Custom Parameter de método de pagamento — pergunta nova pra Awin (usar `custom` da Conversion API em vez da Conversion Tag, seção 9.2.3), depois implementar em `send-to-awin.ts`.
- [ ] Teste manual do roteiro oficial da Awin (pág. 20) executado com sucesso e prints enviados ao contato de integração da Awin para validação.
- [ ] Rodar o typecheck/lint real do projeto sobre todas as mudanças de código feitas (`send-to-awin.ts`, `BaseHead.astro`, `vbeta-app.ts`, `client.d.ts`) — não foi possível neste ambiente.
- [ ] Nenhuma regressão nos demais forwarders de analytics (GA4/Meta/TikTok) que compartilham `send-analytics-events.ts`.
