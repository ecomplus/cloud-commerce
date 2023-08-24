import url from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const {
  DEPLOY_REGION,
  FIREBASE_PROJECT_ID,
} = process.env;

const region = DEPLOY_REGION || 'us-east4';
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
    projectId = 'ecom2-demo';
  }
}

const baseUrl = `http://127.0.0.1:5001/${projectId}/${region}`;
const modulesUrl = `${baseUrl}/modules`;
const passportUrl = `${baseUrl}/passport`;

export {
  baseUrl,
  modulesUrl,
  passportUrl,
};
