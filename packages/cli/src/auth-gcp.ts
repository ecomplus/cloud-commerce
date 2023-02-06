import path from 'node:path';
import { GoogleAuth } from 'google-auth-library';
import {
  fs,
  question,
  echo,
  chalk,
} from 'zx';

// https://developers.google.com/identity/protocols/oauth2/service-account?hl=pt-br

const readFile = (pathFile: string): Promise<any | null> => new Promise((resolve) => {
  try {
    const file = fs.readJSONSync(pathFile);
    resolve(file as any);
  } catch (e) {
    resolve(null);
  }
});

export default async (projectId: string, pwd: string) => {
  await fs.ensureDir(path.join(pwd, '.cloudcommerce'));
  const pathAccountKeys = path.join(pwd, '.cloudcommerce', 'account-keys.json');
  const accountKeys = await readFile(pathAccountKeys);

  await echo`${chalk.bold('Account Keys:')} ${chalk.bgMagenta(JSON.stringify(accountKeys) || '')}\n`;

  if (!accountKeys || !accountKeys?.clientId
    || !accountKeys?.clientSecret || !accountKeys?.refreshToken) {
    await echo`-- Get the Google administrator account credentials.
    (i) To obtain them, access (https://shell.cloud.google.com/?fromcloudshell=true&show=terminal)

    (ii) Execute 'gcloud auth application-default login' in cloud shell

    (iii) Then access the created credentials file, to obtain them`;
  }

  const clientId = accountKeys?.clientId || await question('clientId: ');
  const clientSecret = accountKeys?.clientSecret || await question('clientSecret: ');
  const refreshToken = accountKeys?.refreshToken || await question('refreshToken: ');

  const clientOptions = {
    clientId,
    clientSecret,
    refreshToken,
  };

  if (!accountKeys || !accountKeys?.clientId
    || !accountKeys?.clientSecret || !accountKeys?.refreshToken) {
    // update file
    fs.writeJSONSync(pathAccountKeys, clientOptions);
  }

  const googleClient = new GoogleAuth({
    projectId,
    clientOptions,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  return googleClient.getAccessToken();
};
