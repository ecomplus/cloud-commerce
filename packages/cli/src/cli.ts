import { fileURLToPath } from 'node:url';
import { join as joinPath } from 'node:path';
import {
  $,
  argv,
  fs,
  echo,
  chalk,
} from 'zx';
import * as dotenv from 'dotenv';
import Deepmerge from '@fastify/deepmerge';
import login from './login';
import build, { prepareCodebases } from './build';
import { siginGcloudAndSetIAM, createServiceAccountKey } from './setup-gcloud';
import createGhSecrets from './setup-gh';

if (!process.env.FIREBASE_PROJECT_ID && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  const pwd = process.cwd();
  dotenv.config();
  dotenv.config({ path: joinPath(pwd, 'functions/.env') });
}
const {
  FIREBASE_PROJECT_ID,
  GOOGLE_APPLICATION_CREDENTIALS,
  GITHUB_TOKEN,
} = process.env;

// https://github.com/google/zx/issues/124
process.env.FORCE_COLOR = '3';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const pwd = process.cwd();

let projectId = FIREBASE_PROJECT_ID;
if (projectId) {
  if (!fs.existsSync(joinPath(pwd, '.firebaserc'))) {
    fs.writeFileSync(
      joinPath(pwd, '.firebaserc'),
      JSON.stringify({ projects: { default: projectId } }, null, 2),
    );
  }
} else {
  if (GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      const gac = fs.readJSONSync(joinPath(pwd, GOOGLE_APPLICATION_CREDENTIALS));
      projectId = gac.project_id;
    } catch (e) {
      //
    }
  }
  if (!projectId) {
    try {
      const firebaserc = fs.readJSONSync(joinPath(pwd, '.firebaserc'));
      projectId = firebaserc.projects.default;
    } catch (e) {
      projectId = 'ecom2-demo';
    }
  }
}

const run = async () => {
  const baseConfigDir = joinPath(__dirname, '..', 'config');
  await fs.copy(baseConfigDir, pwd);
  const userConfigDir = joinPath(pwd, 'conf');
  if (fs.existsSync(userConfigDir) && fs.lstatSync(userConfigDir).isDirectory()) {
    await fs.copy(userConfigDir, pwd);
    const userFirebaseJsonPath = joinPath(userConfigDir, 'firebase.json');
    if (fs.existsSync(userFirebaseJsonPath)) {
      let userFirebaseConfig: Record<string, any> | undefined;
      try {
        userFirebaseConfig = JSON.parse(
          fs.readFileSync(userFirebaseJsonPath, 'utf8'),
        );
      } catch {
        //
      }
      if (userFirebaseConfig) {
        const deepmerge = Deepmerge();
        const baseFirebaseConfig = JSON.parse(
          fs.readFileSync(joinPath(baseConfigDir, 'firebase.json'), 'utf8'),
        );
        const mergedConfig = deepmerge(baseFirebaseConfig, userFirebaseConfig);
        fs.writeFileSync(
          joinPath(pwd, 'firebase.json'),
          JSON.stringify(mergedConfig, null, 2),
        );
      }
    }
  }

  const options: string[] = [];
  Object.keys(argv).forEach((key) => {
    if (key !== '_' && argv[key] !== false) {
      if (argv[key] !== true || (key !== 'codebase' && key !== 'only')) {
        options.push(`--${key}`, argv[key]);
      }
    }
  });
  const $firebase = (cmd: string) => {
    $.verbose = true;
    if (cmd === 'deploy' && !options.length) {
      return $`firebase --project=${projectId} ${cmd} --force`;
    }
    return $`firebase --project=${projectId} ${cmd} ${options}`;
  };

  if (argv._.includes('serve') || argv._.includes('preview')) {
    if (argv.build !== false) {
      await build(argv.codebase);
    }
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

  if (argv._.find((cmd) => /^(\w+:)?shell$/.test(cmd))) {
    return $firebase('functions:shell');
  }
  if (argv._.find((cmd) => /^(\w+:)?logs?$/.test(cmd))) {
    return $firebase('functions:log');
  }
  if (argv._.includes('build')) {
    $.verbose = true;
    return build(argv.codebase);
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
      joinPath(pwd, 'functions', '.env'),
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
        joinPath(pwd, 'functions', 'config.json'),
        JSON.stringify({ storeId }, null, 2),
      );

      await build(argv.codebase);
      try {
        await $`git add .firebaserc functions/config.json`;
        await $`git commit -m "Setup store [skip ci]"`;
        await $`git push`;
      } catch (e) {
        //
      }
    }
    let serviceAccountJSON: string | null = null;
    if (argv.gcloud !== false) {
      try {
        await siginGcloudAndSetIAM(projectId as string, pwd);
        serviceAccountJSON = await createServiceAccountKey(projectId as string, pwd);
      } catch (e) {
        //
      }
    }
    let hasCreatedAllSecrets = false;
    if (GITHUB_TOKEN && argv.github !== false) {
      try {
        hasCreatedAllSecrets = await createGhSecrets(
          apiKey,
          authenticationId,
          serviceAccountJSON,
          GITHUB_TOKEN,
        );
      } catch (e) {
        //
      }
    }

    if (hasCreatedAllSecrets) {
      return echo`
      ****

CloudCommerce setup completed successfully.
Your store repository on GitHub is ready, the first deploy will automatically start with GH Actions.

-- More info at https://github.com/ecomplus/store#getting-started
`;
    }
    return echo`
    ****

Finish by saving the following secrets to your GitHub repository:

  ${chalk.bold('ECOM_AUTHENTICATION_ID')} = ${chalk.bgMagenta(authenticationId)}

  ${chalk.bold('ECOM_API_KEY')} = ${chalk.bgMagenta(apiKey)}

  ${chalk.bold('FIREBASE_SERVICE_ACCOUNT')} = ${chalk.bgMagenta(serviceAccountJSON || '{YOUR_SERVICE_ACCOUNT_JSON}')}

-- More info at https://github.com/ecomplus/store#getting-started
`;
  }

  if (argv._.includes('prepare')) {
    return prepareCodebases();
  }

  if (argv._.includes('dev') || argv._.includes('start') || !argv._.length) {
    await prepareCodebases(true);
    $.verbose = true;
    const prefix = joinPath(pwd, 'functions/ssr');
    // https://docs.astro.build/en/reference/cli-reference/#astro-dev
    const host = typeof argv.host === 'string' ? argv.host : '';
    const port = typeof argv.port === 'string' || typeof argv.port === 'number' ? argv.port : '';
    return $`npm --prefix "${prefix}" run dev -- --host ${host} --port ${port}`;
  }
  return $`echo 'Hello from @cloudcommerce/cli'`;
};

export default run;
