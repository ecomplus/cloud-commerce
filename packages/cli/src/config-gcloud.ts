import path from 'path';
import {
  $,
  fs,
} from 'zx';

const siginGcloudAndSetIAM = async (projectId: string | undefined, pwd: string) => {
  await $`gcloud auth login`;
  if (projectId && projectId !== 'ecom2-hello') {
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
    try {
      await $`gcloud iam service-accounts create cloud-commerce-gh-actions \
        --description="A service account with permission to deploy Cloud Commerce from the GitHub repository to Firebase" \
        --display-name="Cloud Commerce GH Actions"`;
    } catch (e) {
    //
    }
    const pathPolicyIAM = path.join(pwd, 'config/policyIAM.json');
    await $`gcloud projects get-iam-policy ${projectId} --format json > ${pathPolicyIAM}`;
    const policyIAM = fs.readJSONSync(pathPolicyIAM);
    const { bindings } = policyIAM;
    roles.forEach((role) => {
      const roleFind = bindings.find(
        (binding: { [key:string ]: string | string []}) => binding.role === role,
      );
      const serviceAccount = `serviceAccount:cloud-commerce-gh-actions@${projectId}.iam.gserviceaccount.com`;
      if (!roleFind) {
        const newBinding = {
          members: [
            serviceAccount,
          ],
          role,
        };
        bindings.push(newBinding);
      } else {
        const serviceAccountHavePermission = roleFind.members.find(
          (account: string) => account === serviceAccount,
        );
        if (!serviceAccountHavePermission) {
          roleFind.members.push(serviceAccount);
        }
      }
    });
    fs.writeJSONSync(pathPolicyIAM, policyIAM);
    await $`gcloud projects set-iam-policy ${projectId} ${pathPolicyIAM}`;
    return $`echo 'Success create account service Cloud Commerce GH Actions'`;
  }
  return $`echo 'PROJECT_ID not found'`;
};

const createKeyServiceAccount = async (projectId: string | undefined, pwd: string) => {
  if (projectId && projectId !== 'ecom2-hello') {
    const pathFileKey = path.join(pwd, 'service-account-file.json');
    await $`gcloud iam service-accounts keys create ${pathFileKey} \
      --iam-account=cloud-commerce-gh-actions@${projectId}.iam.gserviceaccount.com`;

    const keyServiceAccount = JSON.stringify(fs.readJSONSync(pathFileKey));

    await $`export FIREBASE_SERVICE_ACCOUNT=${keyServiceAccount}`;
  }
  return $`echo 'PROJECT_ID not found'`;
};

export default siginGcloudAndSetIAM;

export {
  createKeyServiceAccount,
};
