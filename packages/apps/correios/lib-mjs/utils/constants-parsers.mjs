import logger from 'firebase-functions/logger';

const zipRangeStep = 5000;

const weights = [0.5];
let weight = 0;

do {
  const lastWeight = weights[weights.length - 1];
  weight = lastWeight + Math.ceil(lastWeight / 10);

  if (lastWeight < 1) {
    weight = 1;
  } else if (lastWeight >= 40) {
    weight = 50;
  }
  weights.push(weight);
} while (weight < 50);

const parseZipCode = (zipCode) => {
  return (Number(zipCode) - (Number(zipCode) % zipRangeStep) + 1)
    .toString().padStart(8, '0');
};

const parserWeight = (findWeight) => {
  let foundWeight = findWeight > weights[0] ? weights[weights.length - 1] : weights[0];
  if (findWeight > weights[0]) {
    weights.forEach((n, i) => {
      if (findWeight > weights[i - 1] && findWeight <= n) {
        foundWeight = n;
      }
    });
  }

  return foundWeight;
};

const getDocId = ({
  cepOrigem,
  cepDestino,
  psObjeto,
  correios,
  serviceCodes,
  // valorDeclarado,
  // servicosAdicionais,
}) => {
  let id = `${cepOrigem}_${cepDestino}_${psObjeto}`;

  if (correios) {
    const { nuContrato } = correios.$contract;
    if (nuContrato) {
      id = `${nuContrato}_${id}`;
    }
  }

  if (serviceCodes && serviceCodes.length) {
    id += serviceCodes.reduce((accumulator, code) => {
      return `${accumulator}_${code}`;
    }, '');
  }

  return `correiosResults/1_${id}`;
};

const setCredentials = (appData) => {
  if (!process.env.CORREIOS_POSTCARD) {
    const correiosPostCard = appData.correios_contract?.post_card_number;
    if (correiosPostCard && typeof correiosPostCard === 'string') {
      process.env.CORREIOS_POSTCARD = correiosPostCard;
    } else {
      logger.warn('Missing Correios Postcard number');
    }
  }

  if (!process.env.CORREIOS_USER) {
    const correiosUser = appData.correios_contract?.username;
    if (correiosUser && typeof correiosUser === 'string') {
      process.env.CORREIOS_USER = correiosUser;
    } else {
      logger.warn('Missing Correios Username');
    }
  }

  if (!process.env.CORREIOS_ACCESS_CODE) {
    const correiosAccessCode = appData.correios_contract?.access_code;
    if (correiosAccessCode && typeof correiosAccessCode === 'string') {
      process.env.CORREIOS_ACCESS_CODE = correiosAccessCode;
    } else {
      logger.warn('Missing Correios Acess code');
    }
  }
};

export {
  zipRangeStep,
  weights,
  parseZipCode,
  parserWeight,
  getDocId,
  setCredentials,
};
