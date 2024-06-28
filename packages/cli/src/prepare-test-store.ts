import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { join as joinPath } from 'node:path';
import { fs, $ } from 'zx';

const execFunctionShell = (
  functionName: string,
):Promise<ChildProcessWithoutNullStreams> => new Promise((resolve) => {
  const firebaseShell = spawn('firebase', ['functions:shell'], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'pipe',
  });

  process.stdout.write('\n> Starting firabese \'functions:shell\' \n');
  let commandSent = false;

  firebaseShell.stdout.on('data', (data) => {
    const output = data.toString();

    if (output.includes('firebase >') && !commandSent) {
      process.stdout.write(`\n $firebase > ${functionName}()\n`);
      firebaseShell.stdin.write(`${functionName}()\n`);
      commandSent = true;
    }

    if (commandSent) {
      resolve(firebaseShell);
    }
  });

  firebaseShell.stderr.on('data', (data) => {
    process.stderr.write(data.toString());
  });
});

const createServe = (
  projectId: string,
): Promise<ChildProcessWithoutNullStreams> => new Promise((resolve) => {
  const firebaseEmulators = spawn('firebase', [`--project=${projectId}`, 'emulators:start'], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'pipe',
  });

  process.stdout.write(`\n> Starting firabese --project=${projectId} emulators:start \n`);
  let commandSent = false;

  firebaseEmulators.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Issues? Report') && !commandSent) {
      process.stdout.write(`${output}`);
      commandSent = true;
    }

    if (commandSent) {
      resolve(firebaseEmulators);
    }
  });

  firebaseEmulators.stderr.on('data', (data) => {
    process.stderr.write(data.toString());
  });
});

const checkDirTest = async () => {
  const testsDir = joinPath(process.cwd(), 'tests');
  const nodeModulesTests = joinPath(
    process.cwd(),
    'node_modules',
    '@cloudcommerce',
    'cli',
    'tests',
  );

  if (!fs.existsSync(testsDir) || !fs.existsSync(joinPath(testsDir, 'store.test.ts'))) {
    return $`ln -s ${nodeModulesTests} ${testsDir}`;
  }
  return null;
};

export {
  execFunctionShell,
  createServe,
  checkDirTest,
};
