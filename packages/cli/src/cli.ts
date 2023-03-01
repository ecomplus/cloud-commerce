import url from 'node:url';
import path from 'node:path';
import {
  $,
  argv,
  fs,
  echo,
  chalk,
} from 'zx';
import login from './login';
import build from './build';
import { siginGcloudAndSetIAM, createServiceAccountKey } from './setup-gcloud';
import createGhSecrets from './setup-gh';

const {
  FIREBASE_PROJECT_ID,
  GOOGLE_APPLICATION_CREDENTIALS,
  GITHUB_TOKEN,
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
      projectId = 'ecom2-002';
    }
  }
}

export default async () => {
  await fs.copy(path.join(__dirname, '..', 'config'), pwd);

  const options: string[] = [];
  Object.keys(argv).forEach((key) => {
    if (key !== '_' && argv[key] !== false) {
      if (argv[key] !== true || (key !== 'codebase' && key !== 'only')) {
        options.push(`--${key}`, argv[key]);
      }
    }
  });
  const $firebase = (cmd: string) => {
    if (cmd === 'deploy' && !options.length) {
      return $`firebase --project=${projectId} ${cmd} --force`;
    }
    return $`firebase --project=${projectId} ${cmd} ${options}`;
  };

  if (argv._.includes('serve')) {
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

  if (argv._.find((cmd) => /^(\w+:)?(shell|start)$/.test(cmd))) {
    return $firebase('functions:shell');
  }
  if (argv._.find((cmd) => /^(\w+:)?logs?$/.test(cmd))) {
    return $firebase('functions:log');
  }
  if (argv._.includes('build')) {
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

  if (argv._.includes('dev') || !argv._.length) {
    await $`npm run build -- --codebase ssr`;
    return $`npm --prefix "${path.join(pwd, 'functions/ssr')}" run dev`;
  }
  return $`echo 'Hello from @cloudcommerce/cli'`;
};
