import { getFirestore } from 'firebase-admin/firestore';
import axios from 'axios';

// Public sandbox client of the Cielo/Braspag MPI (same check as the legacy app)
const SANDBOX_CLIENT_ID = 'dba3a8db-fa54-40e0-8bab-7bfb9b6f2e2e';

/**
 * Access token for the 3DS script (MPI V2), cached on Firestore until it
 * expires. Ported from the legacy app `functions/lib/braspag/3ds/get-3ds-token.js`.
 */
const get3dsToken = async ({
  clientId,
  clientSecret,
  establishmentCode,
  merchantName,
  mcc,
  isSandbox: _isSandbox,
}) => {
  const isSandbox = Boolean(_isSandbox) || clientId === SANDBOX_CLIENT_ID;
  const documentRef = getFirestore().doc(`braspagAdmin/3ds_${clientId}`);
  const documentSnapshot = await documentRef.get();
  if (
    documentSnapshot.exists
    && documentSnapshot.get('isSandbox') === isSandbox
    && Date.now() < documentSnapshot.get('expiresAt')
  ) {
    return { accessToken: documentSnapshot.get('accessToken'), isSandbox };
  }
  const url = isSandbox
    ? 'https://mpisandbox.braspag.com.br/v2/auth/token'
    : 'https://mpi.braspag.com.br/v2/auth/token';
  const { data } = await axios.post(url, {
    EstablishmentCode: establishmentCode,
    MerchantName: merchantName,
    MCC: mcc,
  }, {
    auth: { username: clientId, password: clientSecret },
    timeout: 7000,
  });
  if (!data?.access_token) {
    const err = new Error('Cannot generate 3DS token');
    err.data = data;
    throw err;
  }
  await documentRef.set({
    accessToken: data.access_token,
    // Renew a minute earlier to not hand out a token about to expire
    expiresAt: Date.now() + Math.max((Number(data.expires_in) || 120) - 60, 30) * 1000,
    isSandbox,
  });
  return { accessToken: data.access_token, isSandbox };
};

export default get3dsToken;
