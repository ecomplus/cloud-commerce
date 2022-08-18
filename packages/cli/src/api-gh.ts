import { fetch, $ } from 'zx';
import * as sodium from '@devtomio/sodium';

export default async (
  storeId: number,
  ecomApiKey: string,
  ecomAuthentication: string,
  firebaseServiceAccount: string | null,
  ghToken: string,
) => {
  const getOwnerAndRepo = async () => {
    try {
      return (await $`git config --get remote.origin.url`)
        .toString()
        .replace('https://github.com/', '')
        .replace('.git', '')
        .replace('\n', '');
    } catch (e) {
      return null;
    }
  };

  const baseUrl = `https://api.github.com/repos/${await getOwnerAndRepo()}/actions/secrets`;

  const fetchApiGh = async (resource: string, method: string, body?: string) => {
    const url = `${baseUrl}${resource}`;
    const headers = {
      Accept: 'application/vnd.github+json',
      Authorization: `token ${ghToken}`,
    };
    return fetch(url, {
      method,
      headers,
      body,
    });
  };

  type PublicKeyGhSecrets = {
    'key_id': string,
    'key': string
  }

  const getRepositoryPublicKeyGH = async (): Promise<PublicKeyGhSecrets> => {
    // https:// docs.github.com/pt/rest/actions/secrets#get-a-repository-public-key
    const publicKey = await (await fetchApiGh('/public-key', 'GET')).json();
    return publicKey as PublicKeyGhSecrets;
  };

  const publicKeyGH = await getRepositoryPublicKeyGH();

  const createSecretsGH = async (
    secretName: string,
    secretValue: string,
  ) => {
    // https://docs.github.com/pt/rest/actions/secrets#create-or-update-a-repository-secret
    // Encryption example: https://github.com/devtomio/sodium/blob/main/tests/box.test.ts
    const encryptedSodiun = sodium.crypto_box_seal(
      Buffer.from(secretValue),
      Buffer.from(publicKeyGH.key),
    );
    const encryptedValue = Buffer.from(encryptedSodiun).toString('hex');
    const body = {
      encrypted_value: encryptedValue,
      key_id: publicKeyGH.key_id,
    };
    return fetchApiGh(`/${secretName}`, 'PUT', JSON.stringify(body));
  };

  const createAllSecretsCloudCommerceGH = async (
    secrets: {
      storeId: number,
      ecomApiKey: string,
      ecomAuthentication: string,
      firebaseServiceAccount: string | null
    },
  ) => {
    let allCreate = true;
    if (secrets.ecomApiKey) {
      try {
        await createSecretsGH('ECOM_API_KEY', secrets.ecomApiKey);
      } catch (e) {
        allCreate = false;
        //
      }
    }
    if (secrets.ecomAuthentication) {
      try {
        await createSecretsGH('ECOM_AUTHENTICATION_ID', secrets.ecomAuthentication);
      } catch (e) {
        allCreate = false;
        //
      }
    }
    if (secrets.firebaseServiceAccount) {
      try {
        await createSecretsGH('FIREBASE_SERVICE_ACCOUNT', secrets.firebaseServiceAccount);
      } catch (e) {
        allCreate = false;
        //
      }
    }
    if (secrets.storeId) {
      try {
        await createSecretsGH('ECOM_STORE_ID', `${secrets.storeId}`);
      } catch (e) {
        allCreate = false;
        //
      }
    }
    try {
      await createSecretsGH('GH_TOKEN', ghToken);
    } catch (e) {
      allCreate = false;
      //
    }

    return allCreate;
  };

  return createAllSecretsCloudCommerceGH({
    storeId, ecomApiKey, ecomAuthentication, firebaseServiceAccount,
  });
};
