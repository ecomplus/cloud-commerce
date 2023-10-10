import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import axios from 'axios';

const baseURL = 'https://api.correios.com.br/';

const newCorreiosAuth = async () => {
  const username = process.env.CORREIOS_USER;
  const accessCode = process.env.CORREIOS_ACCESS_CODE;
  if (!username || !accessCode) {
    throw new Error('No Correios contract credentials');
  }

  return axios.create({
    baseURL,
    timeout: 6000,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic '
        + Buffer.from(`${username}:${accessCode}`, 'utf8').toString('base64'),
    },
  });
};

const newCorreios = async ({ postCardNumber } = {}) => {
  let token;
  let correiosContract;
  const docRef = getFirestore().doc('correiosv2/contract');
  let correiosAuth;
  if (postCardNumber) {
    correiosAuth = await newCorreiosAuth();
  } else {
    const docSnapshot = await docRef.get();
    if (docSnapshot.exists) {
      const { expiredAt, ...docData } = docSnapshot.data();
      const now = Timestamp.now().toMillis();
      if (now + 9000 < expiredAt.toMillis()) {
        token = docData.token;
      } else {
        correiosAuth = await newCorreiosAuth();
      }
      postCardNumber = process.env.CORREIOS_POSTCARD || docData.postCardNumber;
      correiosContract = docData;
    } else {
      throw Error('No Correios contract document');
    }
  }
  if (correiosAuth) {
    const { data } = await correiosAuth.post('/token/v1/autentica/cartaopostagem', {
      numero: postCardNumber,
    });
    token = data.token;
    const { cartaoPostagem, cnpj } = data;
    const nuContrato = cartaoPostagem.contrato;
    const nuDR = cartaoPostagem.dr;
    if (!correiosContract) {
      correiosContract = {
        postCardNumber,
        nuContrato,
        nuDR,
        cnpj,
        token,
        cartaoPostagem,
      };
    } else {
      Object.assign(correiosContract, {
        nuContrato,
        nuDR,
        cnpj,
        token,
        cartaoPostagem,
      });
    }
    docRef.set({
      ...correiosContract,
      expiredAt: Timestamp.fromDate(new Date(data.expiraEm)),
    }, { merge: true });
  }
  const correios = axios.create({
    baseURL,
    timeout: 20000,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  correios.$contract = correiosContract;
  return correios;
};

export { newCorreiosAuth, newCorreios };
