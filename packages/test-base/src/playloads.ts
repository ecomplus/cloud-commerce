import url from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const getPayload = (pathFile: string) => {
  return JSON.parse(
    fs.readFileSync(
      path.join(__dirname, pathFile),
      { encoding: 'utf-8' },
    ),
  );
};

const bodyCalculateShipping = getPayload('../payloads/calculate-shipping.json');
const bodyListPayments = getPayload('../payloads/list-payments.json');
const bodyCreateTransaction = getPayload('../payloads/create-transaction.json');

export {
  bodyCalculateShipping,
  bodyListPayments,
  bodyCreateTransaction,
};
