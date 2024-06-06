import { join as joinPath } from 'node:path';
import {
  existsSync,
  writeFileSync,
  mkdirSync,
  readFileSync,
} from 'node:fs';
import * as ecomUtils from '@ecomplus/utils';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as dotenv from 'dotenv';
import { Message } from 'firebase-functions/v1/pubsub';
import contentSettings from './content-settings';

const getContextToCreatePubSub = (
  resourceName = '',
  serviceName = '',
  params = {},
) => ({
  eventId: `${Date.now()}`,
  eventType: 'google.pubsub.topic.publish',
  timestamp: `${Date.now()}`,
  resource: {
    name: resourceName,
    service: serviceName,
  },
  params,
});

const getMessageToCreatePubSub = (data = {}) => new Message(data);

const setupForTests = () => {
  let dirSettingsContentFile = joinPath(process.cwd());
  const settingsContentFile = joinPath(process.cwd(), 'functions/ssr/content/settings.json');
  const gitIgnoreFile = joinPath(process.cwd(), '.gitignore');

  if (!existsSync(settingsContentFile)) {
    const directories = ['functions', 'ssr', 'content'];
    directories.forEach((dir) => {
      dirSettingsContentFile += `/${dir}`;
      if (!existsSync(dirSettingsContentFile)) {
        mkdirSync(dirSettingsContentFile);
      }
    });
    writeFileSync(settingsContentFile, JSON.stringify(contentSettings), { encoding: 'utf-8' });
  }
  if (!existsSync(gitIgnoreFile)) {
    writeFileSync(gitIgnoreFile, 'functions/ssr/content/settings.json', { encoding: 'utf-8' });
  } else {
    let gitIgnore = readFileSync(gitIgnoreFile, { encoding: 'utf-8' });
    if (!gitIgnore.includes('functions/ssr/content/settings.json')) {
      gitIgnore += '\nfunctions/ssr/content/settings.json';
      writeFileSync(gitIgnoreFile, gitIgnore, { encoding: 'utf-8' });
    }
  }
};

setupForTests();

export {
  dotenv,
  ecomUtils,
  setupForTests,
  getContextToCreatePubSub,
  getMessageToCreatePubSub,
};
