export default ({
  sCepDestino,
  nVlPeso,
  nCdEmpresa = '',
  sCepOrigem,
}) => {
  return `calc_results/1_${nCdEmpresa}_${sCepOrigem}_${sCepDestino}_${nVlPeso}`;
};
