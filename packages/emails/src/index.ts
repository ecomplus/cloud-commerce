import type {
  EmailAdrress,
  TemplateData,
  Template,
  SmtpConfig,
  EmailHeaders,
} from '../types/index';
import config from '@cloudcommerce/firebase/lib/config';
import sendEmailSmpt, { setConfigSmtp } from './providers/smtp/index';
import sendEmailSendGrid from './providers/sendgrid/index';

// https://docs.adonisjs.com/guides/mailer
let smtpConfig: SmtpConfig | undefined;

const setApiKeySendGrid = (apiKey: string) => {
  process.env.SENDGRID_API_KEY = apiKey;
};

const sendEmail = (
  emailData: {
    to: EmailAdrress[],
    subject: string,
    cc?: EmailAdrress[],
    sender?: EmailAdrress,
    bcc?: EmailAdrress[],
    text?: string,
    html?: string,
    templateData?: TemplateData,
    templateId?: string,
    template?: Template,
  },
) => {
  const {
    MAIL_SENDER,
    MAIL_SENDER_NAME,
    MAIL_REPLY_TO,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_TLS,
    GCLOUD_PROJECT,
    SENDGRID_API_KEY,
  } = process.env;
  const { settingsContent } = config.get();
  const {
    templateData,
    templateId,
    template,
    to,
    subject,
    cc,
    sender,
    bcc,
    text,
    html,
  } = emailData;
  if (!templateId && !template && !html) {
    throw new Error('TemplateId, template or html not found');
  }
  const emailHeaders: EmailHeaders = {
    to,
    subject,
    cc,
    sender,
    bcc,
    from: {
      name: MAIL_SENDER_NAME || settingsContent.name,
      email: MAIL_SENDER
        || `${(GCLOUD_PROJECT?.replace('ecom2', '') || 'lojas')}@e-com.plus`,
    },
    replyTo: {
      name: settingsContent.name,
      email: MAIL_REPLY_TO || settingsContent.email,
    },
  };
  if (!MAIL_SENDER && !emailHeaders.sender) {
    emailHeaders.sender = {
      email: 'noreply@e-com.plus',
      name: settingsContent.name,
    };
  }
  if ((templateId || template || html) && SENDGRID_API_KEY) {
    return sendEmailSendGrid(
      emailHeaders,
      {
        templateData,
        templateId,
        template,
        html,
      },
    );
  }
  if (!smtpConfig && SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    const port = parseInt(SMTP_PORT, 10);
    const secure = SMTP_TLS && SMTP_TLS.toUpperCase() === 'TRUE' ? true : port === 465;
    // secure = true for 465, false for other ports
    smtpConfig = {
      host: SMTP_HOST,
      port,
      secure,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    };
    setConfigSmtp(smtpConfig);
  }
  if ((template || html) && smtpConfig) {
    return sendEmailSmpt(
      emailHeaders,
      {
        text,
        html,
        templateData,
        template,
      },
    );
  }
  throw new Error('Provider settings or SMTP not found');
};

const sendGrid = {
  send: sendEmailSendGrid,
  setConfig: setApiKeySendGrid,

};

const smtp = {
  send: sendEmailSmpt,
  setConfig: setConfigSmtp,
};

export default { send: sendEmail };

export {
  sendEmail,
  sendGrid,
  smtp,
};
