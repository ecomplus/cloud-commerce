/* eslint-disable no-console */
import axios from 'axios';
import * as xml2js from 'xml2js';

const roundDecimal = (num) => Math.round(num * 100) / 100;

// https://www.correios.com.br/precos-e-prazos/calculador-remoto-de-precos-e-prazos
const baseUrl = 'http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx?StrRetorno=xml';

const sendCalculateRequest = (params, timeout, isDebug = false) => {
  let url = baseUrl;
  Object.keys(params).forEach((param) => {
    if (params[param] !== undefined) {
      url += `&${param}=${params[param]}`;
    }
  });
  if (isDebug === true) {
    // eslint-disable-next-line no-console
    console.log(`[ws] ${url}`);
  }

  return axios({
    method: 'get',
    url,
    timeout,
    responseType: 'text',
  })
    .then(async (response) => {
      // parse XML to object
      const result = await xml2js.parseStringPromise(response.data);
      let services;
      if (Array.isArray(result.Servicos)) {
        services = result.Servicos;
      } else {
        services = Array.isArray(result.Servicos.cServico)
          ? result.Servicos.cServico
          : [result.Servicos.cServico];
      }
      const availableService = services.find(({ Erro, MsgErro }) => {
        return String(Erro) !== '-33' && !String(MsgErro).includes('Unavailable');
      });
      if (availableService) {
        return {
          ...result,
          services,
          url,
        };
      }
      const err = new Error('Correios WS unavailable');
      err.code = 'E503';
      err.config = response.config;
      err.response = response;
      throw err;
    })

    .catch((error) => {
      switch (error.code) {
        case 'ECONNRESET':
        case 'ECONNABORTED':
        case 'ETIMEDOUT':
          break;
        default:
          // Debug unknown error
          if (error.response) {
            const err = new Error('Correios WS error');
            err.code = error.code;
            err.config = error.config;
            err.response = {
              status: error.response.status,
              data: error.response.data,
            };
            console.error(err);
          } else {
            console.error(error);
          }
      }
      throw error;
    });
};

export default (params, timeout = 20000, isDebug = false) => {
  params.nIndicaCalculo = 3;
  params.nCdFormato = 1;
  params.nVlDiametro = 0;
  if (!params.nCdServico) {
    // PAC, SEDEX
    params.nCdServico = '04510,04014';
  }
  // Check minimum package dimensions
  if (!(params.nVlPeso >= 0.1)) {
    params.nVlPeso = 0.1;
  } else {
    params.nVlPeso = roundDecimal(params.nVlPeso);
  }
  if (!(params.nVlComprimento >= 16)) {
    params.nVlComprimento = 16;
  }
  if (!(params.nVlAltura >= 2)) {
    params.nVlAltura = 2;
  }
  if (!(params.nVlLargura >= 11)) {
    params.nVlLargura = 11;
  }

  // Optional additional services
  ['sCdMaoPropria', 'sCdAvisoRecebimento'].forEach((param) => {
    if (!params[param]) {
      params[param] = 'n';
    }
  });
  if (params.nVlValorDeclarado === undefined) {
    params.nVlValorDeclarado = 0;
  } else if (params.nVlValorDeclarado < 24) {
    params.nVlValorDeclarado = 24;
  } else if (params.nVlValorDeclarado > 10000) {
    params.nVlValorDeclarado = 10000;
  } else {
    params.nVlValorDeclarado = roundDecimal(params.nVlValorDeclarado);
  }

  const promises = [];
  if (!params.nCdEmpresa || !params.sDsSenha) {
    // Correios limit up to 1 service code per public request
    params.nCdServico.split(',').forEach((nCdServico) => {
      if (nCdServico) {
        promises.push(sendCalculateRequest({ ...params, nCdServico }, timeout, isDebug));
      }
    });
  } else {
    // Can send multiple service codes
    promises.push(sendCalculateRequest(params, timeout, isDebug));
  }

  return Promise.all(promises).then((results) => {
    if (results.length === 1) {
      // single request with multiple services
      const { Servicos, url } = results[0];
      const { cServico } = Servicos;
      return {
        Servicos: {
          cServico: (Array.isArray(cServico) ? cServico : [cServico])
            .map((_cServico) => ({ ..._cServico, url })),
        },
      };
    }
    return {
      Servicos: {
        cServico: results.map(({ Servicos, url }) => {
          return { ...Servicos.cServico, url };
        }),
      },
    };
  });
};
