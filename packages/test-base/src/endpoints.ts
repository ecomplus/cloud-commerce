import url from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const {
  DEPLOY_REGION,
  FIREBASE_PROJECT_ID,
} = process.env;

const region = DEPLOY_REGION || 'southamerica-east1';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const dirStore = path.join(__dirname, '../../../store');

let projectId = FIREBASE_PROJECT_ID;
if (!projectId) {
  try {
    const firebaserc = JSON.parse(
      fs.readFileSync(
        path.join(dirStore, '.firebaserc'),
        { encoding: 'utf-8' },
      ),
    );
    projectId = firebaserc.projects.default;
  } catch (e) {
    projectId = 'ecom2-002';
  }
}

const modulesUrl = `http://127.0.0.1:5001/${projectId}/${region}/modules`;
const passportUrl = `http://127.0.0.1:5001/${projectId}/${region}/passport`;
// const logger = console;
// logger.log('>> ', modulesUrl);
// logger.log('>> ', passportUrl);

export {
  modulesUrl,
  passportUrl,
};
