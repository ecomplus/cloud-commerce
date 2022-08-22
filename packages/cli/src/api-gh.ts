import { fetch, $ } from 'zx';
import libsodium from 'libsodium-wrappers';

type PublicKeyGhSecrets = {
  'key_id': string,
  'key': string
}

const getOwnerAndRepoGH = async () => {
  try {
    return (await $`git config --get remote.origin.url`).stdout
      .replace('https://github.com/', '')
      .replace('.git', '')
      .replace('\n', '');
  } catch (e) {
    return null;
  }
};

const hasCreatedAllSecretsCloudCommerceGH = async (
  ecomApiKey: string,
  ecomAuthentication: string,
  firebaseServiceAccount: string | null,
  ghToken: string,
  ghOwnerRepo?: string,
) => {
  const baseUrl = `https://api.github.com/repos/${(ghOwnerRepo
  || await getOwnerAndRepoGH())}/actions/secrets`;

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

  const getRepositoryPublicKeyGH = async (): Promise<PublicKeyGhSecrets> => {
    // https:// docs.github.com/pt/rest/actions/secrets#get-a-repository-public-key
    const publicKey = await (await fetchApiGh('/public-key', 'GET')).json();
    return publicKey as PublicKeyGhSecrets;
  };

  const publicKeyGH = await getRepositoryPublicKeyGH();
  await libsodium.ready;

  const createSecretsGH = async (
    secretName: string,
    secretValue: string,
  ) => {
    //  https://docs.github.com/pt/rest/actions/secrets#example-encrypting-a-secret-using-nodejs
    // Encryption example: https://github.com/github/tweetsodium
    const encryptedBytes = libsodium.crypto_box_seal(
      Buffer.from(secretValue),
      Buffer.from(publicKeyGH.key, 'base64'),
    );
    const body = {
      encrypted_value: Buffer.from(encryptedBytes).toString('base64'),
      key_id: publicKeyGH.key_id,
    };
    return fetchApiGh(`/${secretName}`, 'PUT', JSON.stringify(body));
  };

  let hasCreatedAll = true;
  try {
    await createSecretsGH('ECOM_API_KEY', ecomApiKey);
  } catch (e) {
    hasCreatedAll = false;
  }

  try {
    await createSecretsGH('ECOM_AUTHENTICATION_ID', ecomAuthentication);
  } catch (e) {
    hasCreatedAll = false;
  }

  try {
    await createSecretsGH('GH_TOKEN', ghToken);
  } catch (e) {
    hasCreatedAll = false;
  }

  if (firebaseServiceAccount) {
    try {
      await createSecretsGH('FIREBASE_SERVICE_ACCOUNT', firebaseServiceAccount);
    } catch (e) {
      hasCreatedAll = false;
    }
  } else {
    hasCreatedAll = false;
  }

  return hasCreatedAll;
};

export default hasCreatedAllSecretsCloudCommerceGH;

export {
  hasCreatedAllSecretsCloudCommerceGH,
  getOwnerAndRepoGH,
};
