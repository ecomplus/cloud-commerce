import type { Orders } from '@cloudcommerce/api/types';
import { existsSync } from 'node:fs';
import { join as joinPath } from 'node:path';
import { info, warn } from 'firebase-functions/logger';
import config from '@cloudcommerce/firebase/lib/config';
import transactionalMails from '@ecomplus/transactional-mails';

export type PaymentHistoryEntry = Exclude<Orders['payments_history'], undefined>[0];

export type FulfillmentsEntry = Exclude<Orders['fulfillments'], undefined>[0];

type TemplateRender = ((...args: any[]) => Promise<string>);

export const getStore = () => {
  const { settingsContent } = config.get();
  return {
    lang: settingsContent.lang,
    domain: settingsContent.domain,
    name: settingsContent.name,
    corporate_name: settingsContent.corporateName || settingsContent.name,
    contact_email: settingsContent.email,
    logo: {
      url: `https://${settingsContent.domain}${settingsContent.logo}`,
    },
    address: settingsContent.address,
  };
};

let customTransactionalMails: Record<string, TemplateRender> | undefined;

export const getMailRender = async (templateName: string) => {
  if (!customTransactionalMails) {
    const { TRANSACTIONAL_MAILS_MODULE } = process.env;
    let customMailsModulePath: string | undefined;
    if (TRANSACTIONAL_MAILS_MODULE) {
      const moduleFirstChar = TRANSACTIONAL_MAILS_MODULE.charAt(0);
      customMailsModulePath = moduleFirstChar === '.' || moduleFirstChar === '/'
        ? joinPath(process.cwd(), TRANSACTIONAL_MAILS_MODULE)
        : TRANSACTIONAL_MAILS_MODULE;
    } else {
      const moduleInjectPath = joinPath(process.cwd(), '@inject/transactional-mails.js');
      if (existsSync(moduleInjectPath)) {
        customMailsModulePath = moduleInjectPath;
      }
    }
    if (customMailsModulePath) {
      try {
        customTransactionalMails = (await import(customMailsModulePath)).default;
      } catch (err) {
        warn(err);
      }
    }
  }
  const customRender = customTransactionalMails?.[templateName];
  if (typeof customRender === 'function') {
    info(`Custom render function for ${templateName}`);
    return customRender;
  }
  return transactionalMails[templateName] as TemplateRender;
};
