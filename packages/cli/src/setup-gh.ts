import { fetch, $ } from 'zx';
import libsodium from 'libsodium-wrappers';

const getRemoteRepo = async () => {
  $.verbose = true;
  try {
    return (await $`git config --get remote.origin.url`).stdout
      .replace(/.*github.com[/:]/, '')
      .replace('.git', '')
      .replace('\n', '');
  } catch {
    return null;
  }
};

const createGhSecrets = async (
  ecomApiKey: string,
  ecomAuthentication: string,
  firebaseServiceAccount: string | null,
  ghToken: string,
  ghRepo?: string,
) => {
  const remoteRepo = ghRepo || await getRemoteRepo();
  if (!remoteRepo) {
    throw new Error("Can't define remote Git repository");
  }
  const baseUrl = `https://api.github.com/repos/${remoteRepo}/actions/secrets`;

  const fetchGhSecrets = async (
    resource: string,
    body?: string,
    method: string = 'GET',
  ) => {
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

  // https:// docs.github.com/pt/rest/actions/secrets#get-a-repository-public-key
  const ghPublicKey = await (await fetchGhSecrets('/public-key')).json() as {
    key_id: string,
    key: string,
  };
  const ghKeyBuffer = Buffer.from(ghPublicKey.key, 'base64');
  await libsodium.ready;

  const createGhSecret = async (
    secretName: string,
    secretValue: string,
  ) => {
    // https://docs.github.com/pt/rest/actions/secrets#example-encrypting-a-secret-using-nodejs
    // Encryption example: https://github.com/github/tweetsodium
    const encryptedBytes = libsodium.crypto_box_seal(
      Buffer.from(secretValue),
      ghKeyBuffer,
    );
    const body = {
      encrypted_value: Buffer.from(encryptedBytes).toString('base64'),
      key_id: ghPublicKey.key_id,
    };
    return fetchGhSecrets(`/${secretName}`, JSON.stringify(body), 'PUT');
  };

  try {
    await createGhSecret('ECOM_API_KEY', ecomApiKey);
    await createGhSecret('ECOM_AUTHENTICATION_ID', ecomAuthentication);
    if (firebaseServiceAccount) {
      await createGhSecret('FIREBASE_SERVICE_ACCOUNT', firebaseServiceAccount);
      return true;
    }
  } catch {
    //
  }
  return false;
};

export default createGhSecrets;
