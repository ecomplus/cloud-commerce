type Env = {
  storeId: number;
  apiAuth: {
    authenticationId: string;
    apiKey: string;
  },
  githubToken?: string;
};

const _env = (
  (typeof process === 'object' && process?.env)
  || globalThis
) as Record<string, any>;

export default () => {
  const {
    ECOM_STORE_ID,
    ECOM_AUTHENTICATION_ID,
    ECOM_API_KEY,
    GITHUB_TOKEN,
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
  const authenticationId = ECOM_AUTHENTICATION_ID;
  const apiKey = ECOM_API_KEY;
  const githubToken = GITHUB_TOKEN;
  const env: Env = {
    storeId,
    apiAuth: {
      authenticationId,
      apiKey,
    },
    githubToken,
  };
  return env;
};

export type { Env };
