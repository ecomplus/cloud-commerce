import * as readline from 'node:readline';
import { question, echo } from 'zx';
import md5 from 'md5';
import api from '@cloudcommerce/api';
import createAuth from './create-auth';

const login = async () => {
  await echo`-- Login with your E-Com Plus store admin account.
(i) same credentials used to enter the dashboard (https://ecomplus.app/)
`;
  const username = await question('E-Com Plus username: ');
  const passMd5 = await new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    }) as any;
    rl.stdoutMuted = true;
    rl.question('Password: ', (password) => {
      rl.close();
      rl.history = rl.history.slice(1);
      resolve(md5(password));
    });
    rl._writeToOutput = function _writeToOutput(stringToWrite) {
      if (rl.stdoutMuted) {
        rl.output.write('*');
      } else {
        rl.output.write(stringToWrite);
      }
    };
  });

  const { data: credentials } = await api.post('login', {
    username,
    pass_md5_hash: passMd5,
  });
  const storeId = credentials.store_ids[0];

  const {
    data: {
      access_token: accessToken,
    },
  } = await api.post('authenticate', credentials);

  return createAuth(storeId, accessToken);
};

export default login;
