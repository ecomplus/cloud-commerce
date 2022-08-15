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
import build from './build';
import siginGcloudAndSetIAM from './config-gcloud';

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
  await fs.copy(path.join(__dirname, '..', 'config'), pwd);

  const options = Object.keys(argv).reduce((opts, key) => {
    if (key !== '_' && key !== 'deploy' && key !== 'commit') {
      // eslint-disable-next-line no-param-reassign
      opts += ` --${key} ${argv[key]}`;
    }
    return opts;
  }, '');
  const $firebase = (cmd: string) => {
    if (cmd === 'deploy') {
      return $`firebase --project=${projectId} ${cmd}${options} --force`;
    }
    return $`firebase --project=${projectId} ${cmd}${options}`;
  };

  if (argv._.includes('serve')) {
    await build();
    return $firebase('emulators:start').catch(async (err: any) => {
      await echo`
Try killing open emulators with: 
${chalk.bold('npx kill-port 4000 9099 5001 8080 5000 8085 9199 4400 4500')}
`;
      if (err.stdout.includes('port taken')) {
        return process.exit(1);
      }
      throw err;
    });
  }

  if (argv._.find((cmd) => /^(\w+:)?(shell|start)$/.test(cmd))) {
    return $firebase('functions:shell');
  }
  if (argv._.find((cmd) => /^(\w+:)?logs?$/.test(cmd))) {
    return $firebase('functions:log');
  }
  if (argv._.includes('build')) {
    return build();
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
    await fs.writeFile(
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
      await fs.writeFile(
        path.join(pwd, 'functions', 'config.json'),
        JSON.stringify({ storeId }, null, 2),
      );
      await build();
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
  if (argv._.includes('predeploy')) {
    const resp = await siginGcloudAndSetIAM(projectId, pwd);
    return resp;
  }

  return $`echo 'Hello from @cloudcommerce/cli'`;
};
