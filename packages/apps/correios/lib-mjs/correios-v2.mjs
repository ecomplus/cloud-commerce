import logger from 'firebase-functions/logger';
import { newCorreios } from './utils/correios-axios.mjs';

const calculate = async ({
  correiosParams,
  serviceCodes = ['03220', '03298'],
  correios,
  timeout = 20000,
}) => {
  if (!correios) {
    correios = await newCorreios();
  }
  const { nuContrato, nuDR } = correios.$contract;
  if (!(Number(correiosParams.psObjeto) >= 200)) {
    correiosParams.psObjeto = '200';
  }
  if (!(Number(correiosParams.comprimento) >= 15)) {
    correiosParams.comprimento = '15';
  }
  if (!(Number(correiosParams.altura) >= 2)) {
    correiosParams.altura = '2';
  }
  if (!(Number(correiosParams.largura) >= 11)) {
    correiosParams.largura = '11';
  }
  [
    'psObjeto',
    'comprimento',
    'altura',
    'largura',
  ].forEach((param) => {
    if (typeof correiosParams[param] === 'number') {
      correiosParams[param] = String(Math.round(correiosParams[param]));
    }
  });
  const debugError = (err) => {
    if (err.response) {
      logger.warn('[calculate] failed for', {
        body: err.config.data,
        response: err.response.data,
        status: err.response.status,
      });
    } else {
      logger.error(err);
    }
    throw err;
  };
  const params = serviceCodes
    .filter((coProduto) => typeof coProduto === 'string' && coProduto)
    .map((coProduto, nuRequisicao) => {
      const _params = {
        ...correiosParams,
        coProduto,
        nuContrato,
        nuDR,
        nuRequisicao,
        tpObjeto: '2',
      };

      return _params;
    });
  return Promise.all([
    correios.post('/preco/v1/nacional', {
      idLote: '1',
      parametrosProduto: params,
    }, { timeout })
      .catch(debugError),
    correios.post('/prazo/v1/nacional', {
      idLote: '1',
      parametrosPrazo: params,
    }, { timeout })
      .catch(debugError),
  ]).then((responses) => {
    responses[1].data.forEach(({ coProduto, ...value }) => {
      const result = responses[0].data.find((resultFind) => resultFind.coProduto === coProduto);
      if (result) {
        Object.assign(result, value);
      }
    });
    return responses[0];
  });
};

export default calculate;
