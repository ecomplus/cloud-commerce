type Env = {
  apiAuth: {
    authenticationId: string;
    apiKey: string;
  },
  githubToken?: string;
};

export default () => {
  const {
    ECOM_AUTHENTICATION_ID,
    ECOM_API_KEY,
    GITHUB_TOKEN,
  } = process.env;
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
    apiAuth: {
      authenticationId,
      apiKey,
    },
    githubToken,
  };
  return env;
};

export type { Env };
