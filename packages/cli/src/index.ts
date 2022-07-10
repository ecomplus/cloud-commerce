import url from 'url';
import path from 'path';
import { $, argv, fs } from 'zx';

const {
  FIREBASE_PROJECT_ID,
  GOOGLE_APPLICATION_CREDENTIALS,
} = process.env;

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const pwd = process.cwd();

let projectId = FIREBASE_PROJECT_ID;
if (projectId) {
  if (!fs.existsSync(path.join(pwd, '.firebaserc'))) {
    fs.writeFileSync(
      path.join(pwd, '.firebaserc'),
      JSON.stringify({ projects: { default: projectId } }, null, 2),
    );
  }
} else {
  if (GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      const gac = fs.readJSONSync(path.join(pwd, GOOGLE_APPLICATION_CREDENTIALS));
      projectId = gac.project_id;
    } catch (e) {
      //
    }
  }
  if (!projectId) {
    try {
      const firebaserc = fs.readJSONSync(path.join(pwd, '.firebaserc'));
      projectId = firebaserc.projects.default;
    } catch (e) {
      projectId = 'ecom2-hello';
    }
  }
}

export default async () => {
  fs.copySync(path.join(__dirname, '..', 'config'), pwd);

  const options = Object.keys(argv).reduce((opts, key) => {
    if (key !== '_') {
      // eslint-disable-next-line no-param-reassign
      opts += ` --${key} ${argv[key]}`;
    }
    return opts;
  }, '');
  const $firebase = async (cmd: string) => {
    return $`firebase --project=${projectId} ${cmd}${options}`;
  };

  if (argv._.includes('serve')) {
    return $firebase('emulators:start');
  }
  if (argv._.find((cmd) => /^(\w+:)?(shell|start)$/.test(cmd))) {
    return $firebase('functions:shell');
  }
  if (argv._.find((cmd) => /^(\w+:)?logs?$/.test(cmd))) {
    return $firebase('functions:log');
  }
  if (argv._.includes('deploy')) {
    return $firebase('deploy');
  }
  return $`echo 'Hello from @cloudcommerce/cli'`;
};
