/*
Decide o que fazer quando o refresh do access_token do Bling falha.

O ponto central: o Bling rotaciona o `refresh_token` a cada uso, então quando
dois processos (cron `cronRefreshToken` + `callback` concorrente) tentam renovar
ao mesmo tempo, o perdedor recebe `invalid_grant` mesmo que o outro tenha
renovado com sucesso. Antes, isso gravava `isBloqued: true` e desativava a
integração inteira até re-autorização manual. Aqui, se o doc foi renovado
concorrentemente (token novo, válido e não bloqueado), REUSAMOS esse token em
vez de bloquear.
*/
export type RefreshFailureContext = {
  isInvalidGrant: boolean,
  initialUpdatedAtMs: number,
  nowMs: number,
  tokenExpirationGap: number,
  current: {
    updatedAtMs: number,
    accessToken?: string,
    expiredAtMs?: number,
    isBloqued?: boolean,
    countErr?: number,
  },
};

export type RefreshFailureDecision =
  | { action: 'reuse', accessToken: string }
  | { action: 'block' }
  | { action: 'countErr' };

export const MAX_TRANSIENT_ERRORS = 3;

const decideRefreshFailure = (ctx: RefreshFailureContext): RefreshFailureDecision => {
  const { current } = ctx;
  const refreshedConcurrently = current.updatedAtMs > ctx.initialUpdatedAtMs
    && !current.isBloqued
    && typeof current.accessToken === 'string'
    && current.accessToken.length > 0
    && current.expiredAtMs !== undefined
    && ctx.nowMs + ctx.tokenExpirationGap < current.expiredAtMs;
  if (refreshedConcurrently) {
    return { action: 'reuse', accessToken: current.accessToken as string };
  }
  if (ctx.isInvalidGrant) {
    return { action: 'block' };
  }
  return (current.countErr || 0) + 1 > MAX_TRANSIENT_ERRORS
    ? { action: 'block' }
    : { action: 'countErr' };
};

export default decideRefreshFailure;
