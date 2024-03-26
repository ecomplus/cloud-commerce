import transactionalMails from '@ecomplus/transactional-mails';

const getMailRender = (templateName: string): ((...args: any[]) => Promise<string>) => {
  const $render = global.$transactionalMails?.[templateName];
  if (typeof $render === 'function') return $render;
  return transactionalMails[templateName];
};

export default getMailRender;
