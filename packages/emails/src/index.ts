import type {
  HeadersMail,
  TemplateData,
  Template,
  SmtpConfig,
} from './types/index';
import sendgrid from './providers/sendgrid/index';
import sendEmailSmpt from './providers/smtp/index';

const sendEmail = (
  headersMail: HeadersMail,
  configTemplate: {
    templateData: TemplateData,
    templateId?: string,
    template?: Template,
  },
) => {
  const { templateData, templateId, template } = configTemplate;

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
      headersMail,
      configTemplate,
      SENDGRID_API_KEY,
    );
  }

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    // send nodemailer
    const port = parseInt(SMTP_PORT, 10);
    // secure = true for 465, false for other ports
    const secure = SMTP_TLS && SMTP_TLS.toUpperCase() === 'TRUE' ? true : port === 465;
    const smtpConfig: SmtpConfig = {
      host: SMTP_HOST,
      port,
      secure,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },

    };

    if (template) {
      return sendEmailSmpt(
        headersMail,
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
