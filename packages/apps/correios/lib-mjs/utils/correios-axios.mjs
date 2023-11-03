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

const newCorreios = async () => {
  let token;
  let correiosContract;
  const docRef = getFirestore().doc('correios/contract');
  let correiosAuth;

  const postCardNumber = process.env.CORREIOS_POSTCARD;

  if (postCardNumber) {
    correiosAuth = await newCorreiosAuth();
  } else {
    throw Error('Correios postCard number not found');
  }

  const docSnapshot = await docRef.get();
  if (docSnapshot.exists) {
    const { expiredAt, ...docData } = docSnapshot.data();
    const now = Timestamp.now().toMillis();
    if (now + 9000 < expiredAt.toMillis()) {
      token = docData.token;
    } else {
      correiosAuth = await newCorreiosAuth();
    }
    correiosContract = docData;
  }

  if (correiosAuth && !token) {
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
