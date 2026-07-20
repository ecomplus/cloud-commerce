# Awin MasterTag — inserção via CMS (Tiasonia)

Referência: [docs/prd-awin-integration.md](prd-awin-integration.md), seção 4.1.

## O que inserir

```html
<script src="https://www.dwin1.com/128977.js" type="text/javascript" defer></script>
```

MID (Advertiser ID) da Tiasonia: `128977`.

## Onde inserir

- Em **todas as páginas** do storefront, como script customizado.
- **Exceção**: não inserir em páginas que processem ou exibam dados de pagamento sensíveis (ex.: formulário de cartão de crédito).
- Inserir o mais tarde possível na página — como script deferido, antes do fechamento da tag `</body>` (mesmo padrão recomendado pela Awin, mesma posição relativa usada hoje para outros pixels/scripts de terceiros já configurados via CMS).

### Detalhe técnico sobre a exceção de pagamento

O checkout inteiro (carrinho, frete, pagamento e confirmação) roda como um app embutido em `/app/` com roteamento **client-side** (Vue Router, rotas internas `cart` → `checkout` com `step=1` frete / `step=2` pagamento → `confirmation`). Isso significa que **a URL vista pelo servidor é sempre a mesma** (`/app/...`) em todos esses passos — não dá para diferenciar "passo de pagamento" de "confirmação" só pela URL da requisição.

Na prática, isso quer dizer:
- Se o mecanismo do CMS insere o script por **URL/rota do servidor**, provavelmente só vai conseguir excluir a MasterTag do app `/app/` inteiro (o que também tiraria ela da página de confirmação — **errado**, já que a confirmação precisa da MasterTag) ou incluir em tudo (inclusive no passo de pagamento).
- Se precisar de fato excluir só o passo de pagamento (`step=2` da rota `checkout`), a exclusão só é possível com lógica **client-side** que observe a rota atual do app embutido (o mesmo padrão já usado em `packages/storefront/src/lib/scripts/vbeta-app.ts:168-194`, função `parseRouteToGtag`, que já sabe diferenciar esses passos).
- Avaliamos implementar isso como código (reaproveitando o `router.afterEach` já existente) e decidimos não fazer agora pela complexidade adicional — optamos por manter via CMS mesmo com essa limitação técnica conhecida.

## Cuidado com redirecionamentos

Se o fluxo de checkout envolver qualquer redirecionamento (ex.: gateway de pagamento externo) antes da página de confirmação, o parâmetro `awc` presente na URL de entrada precisa ser preservado através do redirecionamento — não deixar ele se perder no caminho, senão o rastreamento de clique da Awin quebra.

## Status

- [x] Script inserido no CMS — commit real [`62718c0`](https://github.com/tiasonia/tiasonia/commit/62718c0) em `functions/ssr/content/layout.json` (`customCode.htmlBody`), pushado para `main` em 2026-07-20. **Correção**: a data 2026-07-15 registrada anteriormente neste documento estava incorreta — não havia nenhum commit da MasterTag no repo até 2026-07-20; o item tinha sido marcado como feito antes de ser executado de fato.
- Implementação real difere levemente do snippet da seção "O que inserir": em vez do `<script src=... defer>` cru, foi empilhado via `window.$delayedAsyncScripts?.push('https://www.dwin1.com/128977.js')` — o loader de scripts adiados do `@cloudcommerce/storefront` (dispara após 1ª interação ou timeout de 2.5–4s), mesmo padrão já usado no repo para Tawk.to/GTM/Meta Pixel em `customCode.htmlBody`. Efeito equivalente (deferido, perto do fim do `<body>`, mesma exceção de `/app` **não aplicada** — ver nota abaixo), só o mecanismo de carregamento que muda.
- Rodou em `/app` inteiro (não há exclusão do passo de pagamento) — decisão já documentada na seção "Detalhe técnico" abaixo, mantida como está.
- [ ] Validado em produção — checado em 2026-07-20 ~20:25 UTC via `curl` direto em `https://www.tiasonia.com.br/`: `dwin1` **ainda não aparece** no HTML servido (CDN/BunnyCDN + Cloudflare, `cache-control: max-age=120`, `Last-Modified` recente). Provável deploy do GitHub Action (`build-and-deploy.yml`, disparado por push em `main` tocando `functions/**`) ainda em andamento, ou cache de build desatualizado. Precisa reconferir em alguns minutos antes de fechar este item.

## Resolvido — "AW Last Click Identifier"

A Awin confirmou (2026-07-15): é exatamente a captura do parâmetro `awc` da URL e o armazenamento no cookie `AwinChannelCookie` que já fazemos hoje em [set-tracking-ids.ts](../packages/storefront/src/analytics/set-tracking-ids.ts) — mesmo conceito, nome diferente na doc de GTM deles. **Nenhuma implementação adicional necessária.**

## Por que manter a MasterTag mesmo sem a Conversion Tag client-side

A Awin confirmou que a Conversion Tag client-side (`AWIN.Tracking.Sale`) pode ser dispensada, já que o S2S via Conversion API está ativo e é suficiente para registrar conversões. **Mas a MasterTag continua obrigatória** por um motivo além do tracking de conversão: ela é a base de funcionamento dos tech partners da Awin (ferramentas de cupom, cashback, comparadores de preço). Sem ela, esses parceiros não operam no programa, o que pode afetar o volume/performance de campanhas — reforça a importância de validar que está mesmo ativa em produção.
