/*
Mapeia o evento recebido (`evName`) para a fila de integração a processar.
Extraído para função pura, como `decide-refresh-failure`, porque este é o único
ponto de decisão do fan-out e já quebrou duas vezes sem teste pegar.

Sobre o eco importação -> evento -> exportação: ele é ACEITO de propósito.
Escrita de recurso na Store API não tem autoria distinguível — todos os apps do
deploy autenticam com o mesmo `ECOM_AUTHENTICATION_ID` (`api.ts` usa a
credencial do env em toda requisição), então filtrar por `authentication_id`
descartava também os eventos dos apps de pagamento e matava a exportação
automática de pedidos; e suprimir na origem (`X-Event-Flag: _skip`) escondia o
evento dos demais assinantes (e-mails, Melhor Envio, fidelidade, afiliados,
webhooks). O eco termina em um salto porque a exportação compara antes de
escrever — evento de quantidade não reexporta o produto (`isStockOnlyEvent`) e
estoque/situação iguais não geram requisição.
*/
export type EventQueueConfig = {
  integrationConfig: Record<string, any>,
  /*
  `canCreateNew` is a tri-state, `undefined` means the resource can be created
  on Bling only when it was not exported before.
  */
  canCreateNew: boolean | undefined,
  isQueued: boolean,
  isStockOnlyEvent: boolean,
};

const parseEventConfig = (
  evName: string,
  appData: Record<string, any>,
  resourceId: string,
): EventQueueConfig | null => {
  if (evName === 'applications-dataSet') {
    return {
      integrationConfig: appData,
      canCreateNew: true,
      isQueued: true,
      isStockOnlyEvent: false,
    };
  }
  if (evName === 'orders-anyStatusSet') {
    return {
      integrationConfig: {
        _exportation: {
          order_ids: [resourceId],
        },
      },
      canCreateNew: appData.new_orders ? undefined : false,
      isQueued: false,
      isStockOnlyEvent: false,
    };
  }
  let canCreateNew: boolean | undefined = false;
  if (evName === 'products-new') {
    if (!appData.new_products) {
      return null;
    }
    canCreateNew = true;
  } else if (evName === 'products-priceSet') {
    if (!appData.export_price) {
      return null;
    }
  } else if (!appData.export_quantity) {
    return null;
  }
  return {
    integrationConfig: {
      _exportation: {
        product_ids: [resourceId],
      },
    },
    canCreateNew,
    isQueued: false,
    isStockOnlyEvent: evName === 'products-quantitySet',
  };
};

export default parseEventConfig;
