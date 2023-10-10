export default ({
  cepOrigem,
  cepDestino,
  psObjeto,
  length,
  height,
  width,
  valorDeclarado,
}) => {
  const dimensions = `${length}_${height}_${width}`;
  const id = `${cepOrigem}_${cepDestino}_${psObjeto}_${dimensions}_${valorDeclarado}`;

  return `correiosV2FreightResults/1_${id}`;
};
