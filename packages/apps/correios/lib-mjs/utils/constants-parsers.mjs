import logger from 'firebase-functions/logger';

const zipRangeStep = 5000;

const weights = [0.5];
let weight = 0;

// representation in kg
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
  for (let i = 0; i < weights.length; i++) {
    if (findWeight <= weights[i]) return weights[i];
  }
  return weights[weights.length - 1];
};

const getDocId = ({
  cepOrigem,
  cepDestino,
  psObjeto,
  nuContrato,
  serviceCodes,
}) => {
  let id = `${nuContrato}_${cepOrigem}_${cepDestino}_${psObjeto}`;

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
      logger.warn('Missing Correios Access code');
    }
  }
};

const dataToDoc = (data) => {
  const d = data.map(({
    coProduto,
    pcProduto,
    prazoEntrega,
    txErro,
  }) => {
    const obj = {
      c: coProduto,
      p: pcProduto,
      e: prazoEntrega,
      m: txErro,
    };
    // TODO:
    // set ignoreUndefinedProperties in Firestore
    // no need to delete undefined fields

    Object.keys(obj).forEach((key) => {
      if (!obj[key]) delete obj[key];
    });

    return obj;
  });

  return { d };
};

const docToData = ({ d }) => {
  const data = d.map(({
    c,
    p,
    e,
    m,
  }) => {
    return {
      coProduto: c,
      pcProduto: p,
      prazoEntrega: e,
      txErro: m,
    };
  });
  return data;
};

export {
  zipRangeStep,
  weights,
  parseZipCode,
  parserWeight,
  getDocId,
  setCredentials,
  dataToDoc,
  docToData,
};
