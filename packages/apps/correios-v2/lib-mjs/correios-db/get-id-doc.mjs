export default ({
  cepOrigem,
  cepDestino,
  psObjeto,
  // valorDeclarado,
  // servicosAdicionais,
}) => {
  const id = `${cepOrigem}_${cepDestino}_${psObjeto}`;

  return `correiosV2FreightResults/1_${id}`;
};
