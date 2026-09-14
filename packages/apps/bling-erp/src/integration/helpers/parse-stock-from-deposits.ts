/*
Lê a quantidade de um item do Bling a partir do `depositos[]` de uma resposta de
`/estoques/saldos`. Usado pelos DOIS lados (importação e exportação) para que a
base de comparação nunca divirja: com reserva de estoque usa `saldoVirtual`,
senão `saldo`/`saldoFisico`; filtra pelo depósito configurado ou soma todos.
*/

export const hasDepositBalance = (deposit: Record<string, any>) => {
  const saldo = typeof deposit.saldo === 'number'
    ? Number(deposit.saldo)
    : Number(deposit.saldoFisico);
  return Boolean(saldo || Number(deposit.saldoVirtual));
};

const parseStockFromDeposits = (
  blingItem: Record<string, any>,
  blingDeposit: string | number | undefined,
  hasStockReserve: boolean,
): number => {
  if (!Array.isArray(blingItem?.depositos)) return 0;
  const depositFind = blingItem.depositos.find(({ id }: Record<string, any>) => {
    return String(id) === String(blingDeposit);
  });
  if (blingDeposit && !depositFind && blingItem.depositos.length) {
    /* Somar todos os depósitos aqui reproduziria em silêncio exatamente a
    divergência que o `bling_deposit` configurado existe para eliminar, e um id
    digitado errado seria indistinguível de um correto. O `isConfigError` leva
    a falha para os `logs` do app, visível no painel do lojista. */
    const err: any = new Error(
      `O depósito ${blingDeposit} configurado (\`bling_deposit\`) não foi`
      + ' devolvido pelo Bling no saldo de estoque do item'
      + ` ${blingItem.codigo || blingItem.id || ''}`,
    );
    err.isConfigError = true;
    throw err;
  }
  const deposits = depositFind ? [depositFind] : blingItem.depositos;
  let quantity = 0;
  deposits.forEach((deposit: Record<string, any>) => {
    if (hasStockReserve) {
      const saldoVirtual = Number(deposit.saldoVirtual);
      quantity += !Number.isNaN(saldoVirtual) ? saldoVirtual : 0;
    } else {
      const saldo = typeof deposit.saldo === 'number'
        ? Number(deposit.saldo)
        : Number(deposit.saldoFisico);
      quantity += !Number.isNaN(saldo) ? saldo : 0;
    }
  });
  return quantity;
};

export default parseStockFromDeposits;
