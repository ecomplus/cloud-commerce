import url from 'url';
import path from 'path';
import {
  $,
  argv,
  fs,
  echo,
  chalk,
} from 'zx';
import login from './login';

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
    if (key !== '_' && key !== 'deploy' && key !== 'commit') {
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

  if (argv._.includes('login')) {
    await $firebase('login');
    return login();
  }

  if (argv._.includes('setup')) {
    const { storeId, authenticationId, apiKey } = await login();
    fs.writeFileSync(
      path.join(pwd, 'functions', '.env'),
      `ECOM_AUTHENTICATION_ID=${authenticationId}
ECOM_API_KEY=${apiKey}
ECOM_STORE_ID=${storeId}
`,
    );
    if (argv.deploy !== false) {
      await $firebase('deploy');
    }
    if (argv.commit !== false) {
      fs.writeFileSync(
        path.join(pwd, 'functions', 'config.json'),
        JSON.stringify({ storeId }, null, 2),
      );
      try {
        await $`git add .firebaserc functions/config.json`;
        await $`git commit -m "Setup store [skip ci]"`;
        await $`git push`;
      } catch (e) {
        //
      }
    }
    return echo`
    ****

Finish by saving the following secrets to your GitHub repository:

  ${chalk.bold('ECOM_AUTHENTICATION_ID')} = ${chalk.bgMagenta(authenticationId)}

  ${chalk.bold('ECOM_API_KEY')} = ${chalk.bgMagenta(apiKey)}

  ${chalk.bold('FIREBASE_SERVICE_ACCOUNT')} = {YOUR_SERVICE_ACCOUNT_JSON}

-- More info at https://github.com/ecomplus/store#getting-started
`;
  }

  return $`echo 'Hello from @cloudcommerce/cli'`;
};
