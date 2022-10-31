import type {
  HeadersMail,
  TemplateData,
  Template,
  SmtpConfig,
  EmailAdrress,
} from '../../types/index';
import nodemailer from 'nodemailer';
import parseDataToTransactionalMails from '../../parse-data-to-transactional-mails';

const sendEmailSmtp = async (
  headersMail: HeadersMail,
  configTemplate: {
    templateData: TemplateData,
    template: Template,
  },
  smtpConfig: SmtpConfig,
) => {
  const { from, to } = headersMail;
  const { templateData, template } = configTemplate;
  const bodyMail = await parseDataToTransactionalMails(templateData, template);

  if (!bodyMail) {
    throw new Error(`Email body for template: #${template}, not found`);
  }

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport(smtpConfig);

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: `"${from.name}" <${from.email}>`,
    to: to.reduce((value: string, emailAdrress: EmailAdrress) => {
      return `${value}, ${emailAdrress.email}`;
    }, ''),
    subject: headersMail.subject,
    html: bodyMail,
  });

  return { status: 202, message: `messageId: #${info.messageId}` };
};

export default sendEmailSmtp;
