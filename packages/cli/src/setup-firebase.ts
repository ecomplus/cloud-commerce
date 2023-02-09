import { getAcessTokenGCP, requestApi } from './setup-gcloud';

const baseURL = 'https://cloudresourcemanager.googleapis.com/v3/';

const isProjectExists = async (accessToken: string, projectId: string) => {
  let isExists = false;
  try {
    await requestApi({
      baseURL,
      url: `projects/${projectId}`,
      accessToken,
    });
    isExists = true;
  } catch (e) {
    //
  }
  return isExists;
};

const createProject = async (accessToken: string, projectId: string) => {
  const body = JSON.stringify({
    projectId,
  });

  const data = await requestApi({
    baseURL,
    url: 'projects/',
    method: 'POST',
    body,
    accessToken,
  });

  // log(`>${data}`);
  return data && data.name;
};

const addFirebaseInProject = async (accessToken: string, projectId: string) => {
  // GET https://firebase.googleapis.com/v1beta1/{name=projects/*}
  const baseURLFirebase = `https://firebase.googleapis.com/v1beta1/projects/${projectId}`;
  const headers = { 'x-goog-user-project': projectId };

  let haveProject = false;
  try {
    await requestApi({
      baseURL: baseURLFirebase,
      headers,
      accessToken,
    });
    haveProject = true;
  } catch (e) {
    //
  }

  if (!haveProject) {
    try {
      // POST https://firebase.googleapis.com/v1beta1/{project=projects/*}:addFirebase
      await requestApi({
        baseURL: baseURLFirebase,
        url: ':addFirebase',
        method: 'POST',
        headers,
        accessToken,
      });
      haveProject = true;
    } catch (e) {
      //
    }
  }

  return haveProject;
};

const listBillingAccounts = async (accessToken: string) => {
  return requestApi({
    baseURL: 'https://cloudbilling.googleapis.com/v1/billingAccounts',
    accessToken,
  });
};

const projectBillingAccounts = async (accessToken: string, projectId: string) => {
  let data = await requestApi({
    baseURL: `https://cloudbilling.googleapis.com/v1/projects/${projectId}/billingInfo`,
    accessToken,
  });

  // log(`>${data}`);
  if (data.billingAccountName === '') {
    const billings = (await listBillingAccounts(accessToken)).billingAccounts;
    if (!billings || !billings.length) {
      // log(`> Need to create a billing account.
      // Visit: https://console.cloud.google.com/billing`);
    } else {
      // log(`>${billings}`);
      data = await requestApi({
        baseURL: `https://cloudbilling.googleapis.com/v1/projects/${projectId}/billingInfo`,
        method: 'PUT',
        body: JSON.stringify({
          name: `projects/${projectId}/billingInfo.`,
          projectId,
          billingAccountName: billings[0].name,
          billingEnabled: billings[0].open,
        }),
        accessToken,
      });
      // log(`> Set ', ${data.billingAccountName}`);
    }
    return null;
  }
  // log(`>> Account ', ${data.billingAccountName}`);
  return null;
};

// check And Enable Firebase Management API
const checkAndEnableFirebaseAPI = async (accessToken: string, projectId: string) => {
  const baseURLServices = `https://serviceusage.googleapis.com/v1/projects/${projectId}/services`;
  const { services } = await requestApi({
    baseURL: baseURLServices,
    url: '?filter=state:ENABLED',
    accessToken,
  });

  const firebaseApiEnable = services.find((service) => service.name.endsWith('firebase.googleapis.com'));
  if (!firebaseApiEnable) {
    await requestApi({
      baseURL: baseURLServices,
      url: '/firebase.googleapis.com:enable',
      method: 'POST',
      accessToken,
    });

    // log('>> ', data ? 'Firebase Management API enable' : '');
  } else {
    // log('>> Firebase Management API enable :D');
  }
};

const createFirestore = async (accessToken: string, projectId: string) => {
  // POST https://appengine.googleapis.com/v1/apps HTTP/1.1
  const baseURLAppEngine = 'https://appengine.googleapis.com/v1/apps';

  const body = JSON.stringify({
    databaseType: 'CLOUD_FIRESTORE',
    id: projectId,
    locationId: 'us-central',
  });

  await requestApi({
    baseURL: baseURLAppEngine,
    method: 'POST',
    body,
    accessToken,
  });

  // log('>> ', data);
};

const run = async () => {
  const accessToken = await getAcessTokenGCP();
  // console.log('>> ', client);
  const projectId = 'store-wis-test1';
  if (!await isProjectExists(accessToken, projectId)) {
    await createProject(accessToken, projectId);
    // log(`>>${projectName}`);
  }

  await projectBillingAccounts(accessToken, projectId);
  await checkAndEnableFirebaseAPI(accessToken, projectId);
  await addFirebaseInProject(accessToken, projectId);
  await createFirestore(accessToken, projectId);

  // log('>> OK');

  return null;
};

export default run;
