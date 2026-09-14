/*
Os `logs` do app vão para o `hidden_data` da aplicação, que o lojista lê no
painel e qualquer token com leitura de aplicações consegue baixar. O corpo do
`POST /oauth/token` carrega o `refresh_token` do Bling, então nada vindo de
request/response de autenticação pode ser gravado ali em texto puro.
*/
const SECRET_FIELDS = 'refresh_token|access_token|client_secret|code';

/* Cobre `a=b&refresh_token=xxx` (corpo urlencoded do OAuth) e
`{"refresh_token":"xxx"}` (resposta JSON); o lookbehind evita apagar campos que
só terminam com o nome, como `error_code`. */
const SECRETS_RE = new RegExp(
  `(?<![\\w-])((?:${SECRET_FIELDS})["']?\\s*[=:]\\s*["']?)[^"'&\\s,}]+`,
  'gi',
);

export const isAuthRequest = (url: any) => typeof url === 'string' && url.includes('/oauth/token');

export const redactSecrets = (value: string) => value.replace(SECRETS_RE, '$1[REDACTED]');

export default redactSecrets;
