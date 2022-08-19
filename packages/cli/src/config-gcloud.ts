import path from 'path';
import { $, fs } from 'zx';

const serviceAccountId = 'cloud-commerce-gh-actions';
const getAccountEmail = (projectId: string) => {
  return `${serviceAccountId}@${projectId}.iam.gserviceaccount.com`;
};

const checkServiceAccountExists = async (projectId: string) => {
  let hasServiceAccount: boolean;
  try {
    const { stderr } = await $`gcloud iam service-accounts describe ${getAccountEmail(projectId)}`;
    hasServiceAccount = !/not_?found/i.test(stderr);
  } catch (e) {
    return null;
  }
  return hasServiceAccount;
};

const siginGcloudAndSetIAM = async (projectId: string, pwd: string) => {
  if (/no credential/i.test((await $`gcloud auth list`).stderr)) {
    await $`gcloud auth login`;
  }
  await $`gcloud config set project ${projectId}`;
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
  const serviceAccount = await checkServiceAccountExists(projectId);
  if (!serviceAccount) {
    await $`gcloud iam service-accounts create ${serviceAccountId} \
      --description="A service account with permission to deploy Cloud Commerce from the GitHub repository to Firebase" \
      --display-name="Cloud Commerce GH Actions"`;
  }
  await fs.ensureDir(path.join(pwd, '.cloudcommerce'));
  const pathPolicyIAM = path.join(pwd, '.cloudcommerce', 'policyIAM.json');
  await $`gcloud projects get-iam-policy ${projectId} --format json > ${pathPolicyIAM}`;
  const policyIAM = fs.readJSONSync(pathPolicyIAM);
  const { bindings } = policyIAM;

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
    fs.writeJSONSync(pathPolicyIAM, policyIAM);
    return $`gcloud projects set-iam-policy ${projectId} ${pathPolicyIAM}`;
  }
  return null;
};

const createKeyServiceAccount = async (projectId: string, pwd: string) => {
  try {
    const pathFileKey = path.join(pwd, '.cloudcommerce', 'serviceAccountKey.json');
    await $`gcloud iam service-accounts keys create ${pathFileKey} \
      --iam-account=${getAccountEmail(projectId)}`;
    return JSON.stringify(fs.readJSONSync(pathFileKey));
  } catch (e) {
    return null;
  }
};

export default siginGcloudAndSetIAM;

export {
  siginGcloudAndSetIAM,
  createKeyServiceAccount,
};
