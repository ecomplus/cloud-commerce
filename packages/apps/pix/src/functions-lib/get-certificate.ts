import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
// eslint-disable-next-line import/no-unresolved
import { getStorage } from 'firebase-admin/storage';

export default async (certificate: string) => {
  const fileName = `${certificate}.p12`;

  const bucket = getStorage().bucket();

  const tempFilePath = path.join(os.tmpdir(), fileName);

  await bucket.file(fileName).download({ destination: tempFilePath });

  return new Promise((resolve, reject) => {
    try {
      const file = fs.readFileSync(tempFilePath);
      resolve(file);
    } catch (err) {
      reject(err);
    }
  });
};
