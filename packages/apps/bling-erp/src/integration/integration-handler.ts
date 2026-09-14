/*
Assinatura comum dos handlers de importação/exportação, chamados pelos dois
entrypoints de fan-out (`event-to-bling` e `bling-callback`). Handlers podem
declarar menos parâmetros (o `importOrder` usa só os três primeiros).
*/
export type IntegrationHandler = (
  apiDoc: Record<string, any>,
  queueEntry: Record<string, any>,
  appData: Record<string, any>,
  canCreateNew?: boolean,
  isHiddenQueue?: boolean,
) => Promise<any>;

export default IntegrationHandler;
