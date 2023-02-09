import path from 'node:path';
import {
  $,
  fs,
  question,
  echo,
} from 'zx';

let gcpAccessToken: string | undefined;
const serviceAccountId = 'cloud-commerce-gh-actions';
const getAccountEmail = (projectId: string) => {
  return `${serviceAccountId}@${projectId}.iam.gserviceaccount.com`;
};

const urlOAuthCloudCommerce = 'https://auth-cloud-commerce.web.app/auth';

const requestApi = async (
  options: {
    baseURL: string,
    url?: string,
    method?: string,
    body?: string,
    headers?: { [x: string]: string }
    accessToken?: string
  },
) => {
  const body = options?.body;
  let url = options.baseURL;
  url += options?.url || '';

  const headers = {
    ...options?.headers,
    Authorization: `Bearer ${options?.accessToken || gcpAccessToken}`,
    'Content-Type': 'application/json; charset=utf-8',
  };

  const data = await (await fetch(
    url,
    {
      method: options?.method || 'GET',
      headers,
      body,
    },
  )).json() as any;
  const { error } = data;
  if (error) {
    let msgErr = 'Unexpected error in request';
    msgErr = error.message ? `Code: ${error.code} - ${error.message}` : msgErr;
    const err = new Error(msgErr);
    throw err;
  }

  return data;
};

const getGcpAccessToken = async () => {
  await echo`-- Get the Google Cloud account credentials:
  1. Access ${urlOAuthCloudCommerce}
  2. Copy and paste the generated token
`;

  const credencialsBase64 = await question('Google Cloud access token: ');
  const credentials = JSON.parse(Buffer.from(credencialsBase64, 'base64').toString());
  return credentials.access_token;
};

const checkServiceAccountExists = async (projectId: string) => {
  const baseURL = `https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts`;
  let hasServiceAccount: boolean;
  try {
    if (!gcpAccessToken) {
      const { stderr } = await $`gcloud iam service-accounts describe ${getAccountEmail(projectId)}`;
      hasServiceAccount = !/not_?found/i.test(stderr);
    } else {
      // https://cloud.google.com/iam/docs/creating-managing-service-accounts?hl=pt-br#listing
      const { accounts: listAccounts } = await requestApi({ baseURL });
      const accountFound = listAccounts
        && listAccounts.find(({ email }) => email === getAccountEmail(projectId));
      hasServiceAccount = Boolean(accountFound);
    }
  } catch {
    return null;
  }
  return hasServiceAccount;
};

const siginGcloudAndSetIAM = async (projectId: string, pwd: string) => {
  const baseURL = `https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts`;
  let hasGcloud: boolean;
  try {
    hasGcloud = Boolean(await $`command -v gcloud`);
  } catch {
    hasGcloud = false;
  }
  if (hasGcloud) {
    if (/no credential/i.test((await $`gcloud auth list`).stderr)) {
      await $`gcloud auth login`;
    }
    await $`gcloud config set project ${projectId}`;
  } else {
    gcpAccessToken = await getGcpAccessToken();
  }

  const serviceAccount = await checkServiceAccountExists(projectId);
  if (!serviceAccount) {
    const description = 'A service account with permission to deploy Cloud Commerce'
      + ' from the GitHub repository to Firebase';
    const displayName = 'Cloud Commerce GH Actions';
    if (hasGcloud) {
      await $`gcloud iam service-accounts create ${serviceAccountId} \
        --description=${description} --display-name=${displayName}`;
    } else if (gcpAccessToken) {
      const body = JSON.stringify({
        accountId: serviceAccountId,
        serviceAccount: {
          description,
          displayName,
        },
      });
      await requestApi({ baseURL, method: 'POST', body });
    }
  }
  await fs.ensureDir(path.join(pwd, '.cloudcommerce'));
  const pathPolicyIAM = path.join(pwd, '.cloudcommerce', 'policyIAM.json');
  let policyIAM: Record<string, any> = {};
  const version = 3; // most recent
  if (hasGcloud) {
    await $`gcloud projects get-iam-policy ${projectId} --format json > ${pathPolicyIAM}`;
    policyIAM = fs.readJSONSync(pathPolicyIAM);
  } else if (gcpAccessToken) {
    // https://cloud.google.com/iam/docs/granting-changing-revoking-access?hl=pt-br#view-access
    // POST https://cloudresourcemanager.googleapis.com/API_VERSION/RESOURCE_TYPE/RESOURCE_ID:getIamPolicy
    policyIAM = await requestApi(
      {
        baseURL: `https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}`,
        url: ':getIamPolicy',
        method: 'POST',
        body: JSON.stringify({ options: { requestedPolicyVersion: version } }),
      },
    );
  }

  const roles = [
    'roles/firebase.admin',
    'roles/appengine.appAdmin',
    'roles/appengine.appCreator',
    'roles/artifactregistry.admin',
    'roles/cloudfunctions.admin',
    'roles/cloudscheduler.admin',
    'roles/iam.serviceAccountUser',
    'roles/run.viewer',
    'roles/serviceusage.apiKeysViewer',
    'roles/serviceusage.serviceUsageAdmin',
  ];
  let { bindings } = policyIAM;
  if (!bindings) {
    bindings = [];
  }
  let mustUpdatePolicy = false;
  roles.forEach((role) => {
    const roleFound = bindings.find((binding) => binding.role === role);
    const memberServiceAccount = `serviceAccount:${getAccountEmail(projectId)}`;
    if (!roleFound) {
      const newBinding: { [key: string]: any } = {
        members: [
          memberServiceAccount,
        ],
        role,
      };
      if (role === 'roles/serviceusage.serviceUsageAdmin') {
        const roleExpiration = Date.now() + 1000 * 60 * 60 * 12;
        newBinding.condition = {
          expression: `request.time < timestamp("${new Date(roleExpiration).toISOString()}")`,
          title: 'Enable APIs on first deploy',
          description: null,
        };
      }
      bindings.push(newBinding);
      mustUpdatePolicy = true;
    } else {
      const serviceAccountHavePermission = roleFound.members.find(
        (account: string) => account === memberServiceAccount,
      );
      if (!serviceAccountHavePermission) {
        roleFound.members.push(memberServiceAccount);
        mustUpdatePolicy = true;
      }
    }
  });
  if (mustUpdatePolicy) {
    if (hasGcloud) {
      fs.writeJSONSync(pathPolicyIAM, policyIAM);
      return $`gcloud projects set-iam-policy ${projectId} ${pathPolicyIAM}`;
    } if (gcpAccessToken) {
      Object.assign(policyIAM, { version, bindings });
      // POST https://cloudresourcemanager.googleapis.com/API_VERSION/RESOURCE_TYPE/RESOURCE_ID:setIamPolicy
      return requestApi(
        {
          baseURL: `https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}`,
          url: ':setIamPolicy',
          method: 'POST',
          body: JSON.stringify({ policy: policyIAM }),
        },
      );
    }
  }
  return null;
};

const createServiceAccountKey = async (projectId: string, pwd: string) => {
  const baseURL = `https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts`;
  try {
    const pathFileKey = path.join(pwd, '.cloudcommerce', 'serviceAccountKey.json');
    if (!gcpAccessToken) {
      await $`gcloud iam service-accounts keys create ${pathFileKey} \
      --iam-account=${getAccountEmail(projectId)}`;
    } else {
      const { privateKeyData } = await requestApi(
        {
          baseURL,
          url: `/${getAccountEmail(projectId)}/keys`,
          method: 'POST',
        },
      );
      await $`echo '${privateKeyData}' | base64 --decode > ${pathFileKey}`;
    }
    return JSON.stringify(fs.readJSONSync(pathFileKey));
  } catch (e) {
    return null;
  }
};

export default siginGcloudAndSetIAM;

export {
  siginGcloudAndSetIAM,
  createServiceAccountKey,
};
