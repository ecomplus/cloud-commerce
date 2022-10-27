import type { HeadersMail, TemplateData } from './types/index';
import getEnv from '@cloudcommerce/firebase/lib/env';
import sendgrid from './providers/sendgrid/index';

export default (
  headersMail: HeadersMail,
  templateData: TemplateData,
  templateId?: string,
  template?: {[x:string]: any},
) => {
  if (!templateId || template) {
    return new Error('TemplateId or template not found');
  }
  const { emailProvider } = getEnv();
  switch (emailProvider.providerMailId) {
    default:
      return sendgrid(
        emailProvider.password, // password in sendGrid is ApiKey
        headersMail,
        templateData,
        templateId,
        template,
      );
  }
};
