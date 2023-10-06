const servicesToDoc = (services) => {
  const s = services.map(({
    Codigo,
    Erro,
    MsgErro,
    PrazoEntrega,
    Valor,
  }) => {
    return {
      c: Codigo,
      e: Erro,
      m: MsgErro,
      p: PrazoEntrega,
      v: Valor,
    };
  });
  return { s };
};

const docToServices = ({ s }) => {
  const services = s.map(({
    c,
    e,
    m,
    p,
    v,
  }) => {
    return {
      Codigo: c,
      Erro: e,
      MsgErro: m,
      PrazoEntrega: p,
      Valor: v,
    };
  });
  return services;
};

export {
  servicesToDoc,
  docToServices,
};
