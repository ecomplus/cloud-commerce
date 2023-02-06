import path from 'node:path';
import { fetch, $, fs } from 'zx';
import getGoogleAcessToken from './auth-gcp';

const serviceAccountId = 'cloud-commerce-gh-actions';
const getAccountEmail = (projectId: string) => {
  return `${serviceAccountId}@${projectId}.iam.gserviceaccount.com`;
};

// https://console.cloud.google.com/apis/library/iam.googleapis.com?hl=pt-br&cloudshell=true

const requestApi = async (
  projectId: string,
  accessToken: string,
  options?: {
    baseURL?: string,
    url?: string,
    method: string,
    body?: string,
  },
) => {
  const body = options?.body;
  let url = options?.baseURL || `https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts`;
  url += options?.url || '';

  const data = await (await fetch(
    url,
    {
      method: options?.method || 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body,
    },
  )).json() as any;
  const { error } = data;
  if (error) {
    let msgErr = 'Unexpected error in request';
    msgErr = error.message ? `code: ${error.code} - ${error.message}` : msgErr;
    const err = new Error(msgErr);
    throw err;
  }

  return data;
};

const createServiceAccount = async (projectId: string, accessToken: string) => {
  const body = JSON.stringify({
    accountId: serviceAccountId,
    serviceAccount: {
      description: 'A service account with permission to deploy Cloud Commerce from the GitHub repository to Firebase',
      displayName: 'Cloud Commerce GH Actions',
    },
  });

  const { uniqueId } = await requestApi(
    projectId,
    accessToken,
    { method: 'POST', body },
  );
  return uniqueId;
};

const checkServiceAccountExists = async (projectId: string, accessToken: string) => {
  // https://cloud.google.com/iam/docs/creating-managing-service-accounts?hl=pt-br#listing
  const { accounts: listAccounts } = await requestApi(projectId, accessToken);

  const account = listAccounts
    && listAccounts.find(({ email }) => email === getAccountEmail(projectId));

  return account?.uniqueId;
};

const checkAllAccountPolicy = async (projectId: string, accessToken: string) => {
  // https://cloud.google.com/iam/docs/granting-changing-revoking-access?hl=pt-br#view-access
  // POST https://cloudresourcemanager.googleapis.com/API_VERSION/RESOURCE_TYPE/RESOURCE_ID:getIamPolicy

  const version = 3; // according to the reference use the most recent
  const baseURL = `https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}`;

  const data = await requestApi(
    projectId,
    accessToken,
    {
      baseURL,
      url: ':getIamPolicy',
      method: 'POST',
      body: JSON.stringify({ options: { requestedPolicyVersion: version } }),
    },
  );

  let { bindings } = data;

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

  let mustUpdatePolicy = false;
  const memberServiceAccount = `serviceAccount:${getAccountEmail(projectId)}`;

  const addNewBinding = (role: string) => {
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

    return newBinding;
  };

  if (bindings) {
    roles.forEach((role) => {
      const roleFound = bindings.find((binding) => binding.role === role);
      if (!roleFound) {
        bindings.push(addNewBinding(role));
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
  } else {
    bindings = [];
    roles.forEach((role) => {
      bindings.push(addNewBinding(role));
    });
    mustUpdatePolicy = true;
  }

  if (mustUpdatePolicy) {
    Object.assign(data, { version, bindings });
    // POST https://cloudresourcemanager.googleapis.com/API_VERSION/RESOURCE_TYPE/RESOURCE_ID:setIamPolicy
    await requestApi(
      projectId,
      accessToken,
      {
        baseURL,
        url: ':setIamPolicy',
        method: 'POST',
        body: JSON.stringify({ policy: data }),
      },
    );
  }
};
// https://cloud.google.com/iam/docs/creating-managing-service-account-keys?hl=pt-br#creating

const createServiceAccountKey = async (
  projectId: string,
  accessToken: string,
  pwd: string,
) => {
  const { privateKeyData } = await requestApi(
    projectId,
    accessToken,
    {
      url: `/${getAccountEmail(projectId)}/keys`,
      method: 'POST',
    },
  );
  const pathFileKey = path.join(pwd, '.cloudcommerce', 'serviceAccountKey.json');

  await $`echo '${privateKeyData}' | base64 --decode > ${pathFileKey}`;
  return JSON.stringify(fs.readJSONSync(pathFileKey));
};

const getAccessTokenGCPAndSetIAM = async (projectId: string, pwd: string) => {
  try {
    const accessToken = await getGoogleAcessToken(projectId, pwd);
    if (accessToken) {
      let accountId: string = await checkServiceAccountExists(projectId, accessToken);
      if (!accountId) {
        accountId = await createServiceAccount(projectId, accessToken);
      }
      await checkAllAccountPolicy(projectId, accessToken);
    }
    return accessToken;
  } catch (e) {
    return null;
  }
};

export default getAccessTokenGCPAndSetIAM;

export {
  getAccessTokenGCPAndSetIAM,
  createServiceAccountKey,
};
