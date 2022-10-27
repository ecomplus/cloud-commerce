type Env = {
  storeId: number;
  apiAuth: {
    authenticationId: string;
    apiKey: string;
  },
  githubToken?: string;
  emailProvider: {
    providerMailId?: string,
    mainMail: string,
    user: string,
    password: string,
    token?: string
  }
};

// @ts-ignore
const _env: Record<string, any> = import.meta.env
  || (typeof process === 'object' && process?.env)
  || globalThis;

export default () => {
  const {
    ECOM_STORE_ID,
    ECOM_AUTHENTICATION_ID,
    ECOM_API_KEY,
    GITHUB_TOKEN,
    PROVIDER_MAIL_ID,
    MAIN_EMAIL,
    PROVIDER_MAIL_USER,
    PROVIDER_MAIL_PASS,
    PROVIDER_MAIL_TOKEN,
  } = _env;
  const storeId = ECOM_STORE_ID && parseInt(ECOM_STORE_ID, 10);
  if (!storeId) {
    throw new Error('ECOM_STORE_ID is not set or not a number');
  }
  if (!ECOM_AUTHENTICATION_ID) {
    throw new Error('ECOM_AUTHENTICATION_ID is not set');
  }
  if (!ECOM_API_KEY) {
    throw new Error('ECOM_API_KEY is not set');
  }
  if (!MAIN_EMAIL) {
    throw new Error('MAIN_EMAIL is not set');
  }
  if (!PROVIDER_MAIL_USER) {
    throw new Error('PROVIDER_MAIL_USER is not set');
  }
  if (!PROVIDER_MAIL_PASS) {
    throw new Error('PROVIDER_MAIL_PASS is not set');
  }
  const authenticationId = ECOM_AUTHENTICATION_ID;
  const apiKey = ECOM_API_KEY;
  const githubToken = GITHUB_TOKEN;
  const providerMailId = PROVIDER_MAIL_ID;
  const providerMainMail = MAIN_EMAIL;
  const providerMailUser = PROVIDER_MAIL_USER;
  const providerMailPass = PROVIDER_MAIL_PASS;
  const providerMailToken = PROVIDER_MAIL_TOKEN;
  const env: Env = {
    storeId,
    apiAuth: {
      authenticationId,
      apiKey,
    },
    githubToken,
    emailProvider: {
      providerMailId,
      mainMail: providerMainMail,
      user: providerMailUser,
      password: providerMailPass,
      token: providerMailToken,
    },
  };
  return env;
};

export type { Env };
