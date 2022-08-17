import path from 'path';
import {
  $,
  echo,
  fs,
} from 'zx';

const checkServiceAccountExists = async (projectId: string) => {
  try {
    const descibeAccount = await $`gcloud iam service-accounts describe cloud-commerce-gh-actions@${projectId}.iam.gserviceaccount.com`;
    return descibeAccount;
  } catch (e) {
    return null;
  }
};

const siginGcloudAndSetIAM = async (
  projectId: string,
  pwd: string,
) => {
  await $`gcloud auth login`;
  await $`gcloud config set project ${projectId} `;
  const roles = [
    'roles/cloudconfig.admin',
    'roles/appengine.appAdmin',
    'roles/appengine.appCreator',
    'roles/artifactregistry.admin',
    'roles/cloudfunctions.admin',
    'roles/cloudscheduler.admin',
    'roles/iam.serviceAccountUser',
    'roles/run.viewer',
    'roles/serviceusage.apiKeysViewer',
  ];
  const serviceAccount = await checkServiceAccountExists(projectId);
  if (!serviceAccount) {
    await $`gcloud iam service-accounts create cloud-commerce-gh-actions \
        --description="A service account with permission to deploy Cloud Commerce from the GitHub repository to Firebase" \
        --display-name="Cloud Commerce GH Actions"`;
  }
  const pathPolicyIAM = path.join(pwd, 'policyIAM.json');
  await $`gcloud projects get-iam-policy ${projectId} --format json > ${pathPolicyIAM}`;
  const policyIAM = fs.readJSONSync(pathPolicyIAM);
  const { bindings } = policyIAM;
  let updatePolicy = false;

  roles.forEach((role) => {
    const roleFound = bindings.find(
      (binding: { [key: string]: string | string[] }) => binding.role === role,
    );
    const memberServiceAccount = `serviceAccount:cloud-commerce-gh-actions@${projectId}.iam.gserviceaccount.com`;
    if (!roleFound) {
      const newBinding = {
        members: [
          memberServiceAccount,
        ],
        role,
      };
      bindings.push(newBinding);
      updatePolicy = true;
    } else {
      const serviceAccountHavePermission = roleFound.members.find(
        (account: string) => account === memberServiceAccount,
      );
      if (!serviceAccountHavePermission) {
        roleFound.members.push(memberServiceAccount);
        updatePolicy = true;
      }
    }
  });
  if (updatePolicy) {
    fs.writeJSONSync(pathPolicyIAM, policyIAM);
    return $`gcloud projects set-iam-policy ${projectId} ${pathPolicyIAM}`;
  }
  return echo``;
};

const createKeyServiceAccount = async (projectId: string, pwd: string) => {
  try {
    const pathFileKey = path.join(pwd, 'service-account-file.json');
    await $`gcloud iam service-accounts keys create ${pathFileKey} \
      --iam-account=cloud-commerce-gh-actions@${projectId}.iam.gserviceaccount.com`;
    return JSON.stringify(fs.readJSONSync(pathFileKey));
  } catch (e) {
    return null;
  }
};

export default siginGcloudAndSetIAM;

export {
  createKeyServiceAccount,
};
