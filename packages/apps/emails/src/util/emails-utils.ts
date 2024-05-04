import type { Orders } from '@cloudcommerce/api/types';
import config from '@cloudcommerce/firebase/lib/config';
import transactionalMails from '@ecomplus/transactional-mails';

export type PaymentHistoryEntry = Exclude<Orders['payments_history'], undefined>[0];

export type FulfillmentsEntry = Exclude<Orders['fulfillments'], undefined>[0];

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

export const getMailRender = (templateName: string): ((...args: any[]) => Promise<string>) => {
  const $render = global.$transactionalMails?.[templateName];
  if (typeof $render === 'function') return $render;
  return transactionalMails[templateName];
};
