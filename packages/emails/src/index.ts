import type {
  HeadersEmail,
  TemplateConfig,
  SmtpConfig,
} from './types/index';
import sendgrid from './providers/sendgrid/index';
import sendEmailSmpt from './providers/smtp/index';

// https://docs.adonisjs.com/guides/mailer

const sendEmail = (
  headersEmail: HeadersEmail,
  templateConfig: TemplateConfig,
  smtpAuthOptions?: SmtpConfig['auth'],
) => {
  const { templateData, templateId, template } = templateConfig;

  if (!templateId && !template) {
    throw new Error('TemplateId or template not found');
  }

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_TLS,
    SENDGRID_API_KEY,
  } = process.env;

  if ((templateId || template) && SENDGRID_API_KEY) {
    return sendgrid(
      headersEmail,
      templateConfig,
      SENDGRID_API_KEY,
    );
  }

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    const port = parseInt(SMTP_PORT, 10);

    const smtpConfig: SmtpConfig = {
      host: SMTP_HOST,
      port,
      // secure = true for 465, false for other ports
      secure: SMTP_TLS && SMTP_TLS.toUpperCase() === 'TRUE' ? true : port === 465,
      auth: smtpAuthOptions || { user: SMTP_USER, pass: SMTP_PASS },
    };

    if (template) {
      return sendEmailSmpt(
        headersEmail,
        { templateData, template },
        smtpConfig,
      );
    }
  }
  return { status: 404, message: 'Provider settings or smtp not found' };
};

sendEmail.sendgrid = sendgrid;
sendEmail.smpt = sendEmailSmpt;

export default sendEmail;
