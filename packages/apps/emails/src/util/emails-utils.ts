import type { Orders } from '@cloudcommerce/api/types';
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
    if (TRANSACTIONAL_MAILS_MODULE) {
      const moduleFirstChar = TRANSACTIONAL_MAILS_MODULE.charAt(0);
      const modulePath = moduleFirstChar === '.' || moduleFirstChar === '/'
        ? joinPath(process.cwd(), TRANSACTIONAL_MAILS_MODULE)
        : TRANSACTIONAL_MAILS_MODULE;
      try {
        customTransactionalMails = (await import(modulePath)).default;
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
