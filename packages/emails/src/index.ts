import type {
  EmailAdrress,
  TemplateData,
  SmtpConfig,
  EmailHeaders,
} from './types/index';
import sendgrid from './providers/sendgrid/index';
import sendEmailSmpt from './providers/smtp/index';

// https://docs.adonisjs.com/guides/mailer

const sendEmail = (
  config: {
    to: EmailAdrress | EmailAdrress[],
    subject: string,
    cc?: EmailAdrress[],
    sender?: EmailAdrress,
    bcc?: EmailAdrress[],
    text?: string,
    html?: string,
    templateData?: TemplateData,
    templateId?: string,
    template?: string,
  },
) => {
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
  } = config;

  if (!templateId && !template && !html) {
    return { status: 404, message: 'TemplateId, template or html not found' };
  }

  const {
    MAIL_SENDER,
    MAIL_SENDER_NAME,
    MAIL_REPLY_TO,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_TLS,
    SENDGRID_API_KEY,
  } = process.env;

  if (!MAIL_SENDER) {
    return { status: 404, message: 'Sender email not configured' };
  }

  const emailHeaders: EmailHeaders = {
    to,
    subject,
    cc,
    sender,
    bcc,
    from: {
      name: MAIL_SENDER_NAME || '',
      email: MAIL_SENDER,
    },
  };

  if (MAIL_REPLY_TO) {
    emailHeaders.replyTo = {
      name: MAIL_SENDER_NAME || '',
      email: MAIL_REPLY_TO,
    };
  }

  if ((templateId || template) && SENDGRID_API_KEY) {
    return sendgrid(
      emailHeaders,
      SENDGRID_API_KEY,
      templateData,
      templateId,
      template,
      html,
    );
  }

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    const port = parseInt(SMTP_PORT, 10);

    const smtpConfig: SmtpConfig = {
      host: SMTP_HOST,
      port,
      // secure = true for 465, false for other ports
      secure: SMTP_TLS && SMTP_TLS.toUpperCase() === 'TRUE' ? true : port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    };

    if (template) {
      return sendEmailSmpt(
        emailHeaders,
        smtpConfig,
        text,
        html,
        templateData,
        template,
      );
    }
  }

  return { status: 404, message: 'Provider settings or smtp not found' };
};

sendEmail.sendgrid = sendgrid;
sendEmail.smpt = sendEmailSmpt;

export default sendEmail;
