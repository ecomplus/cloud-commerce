import type {
  HeadersEmail,
  Template,
  TemplateConfig,
  SmtpConfig,
  EmailAdrress,
} from '../../types/index';
import nodemailer from 'nodemailer';
import parseDataToTransactionalMails from '../../parse-data-to-transactional-mails';

const parseArrayEmailsToString = (emails: EmailAdrress[]) => {
  return emails.reduce((value: string, emailAdrress: EmailAdrress) => {
    return `${value}, ${emailAdrress.email}`;
  }, '');
};

const sendEmailSmtp = async (
  headersEmail: HeadersEmail,
  configTemplate: Omit<TemplateConfig, 'template'> & { template: Template},
  smtpConfig: SmtpConfig,
) => {
  const { from, to } = headersEmail;
  const { templateData, template } = configTemplate;
  const bodyEmail = await parseDataToTransactionalMails(templateData, template);

  if (!bodyEmail) {
    throw new Error(`Email body for template: #${template}, not found`);
  }

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport(smtpConfig);

  // send mail with defined transport object
  const dataEmail = {
    from: `"${from.name}" <${from.email}>`,
    to: parseArrayEmailsToString(to),
    subject: headersEmail.subject,
    html: bodyEmail,
  };

  if (headersEmail.sender) {
    Object.assign(dataEmail, {
      sender: `"${headersEmail.sender.name}" <${headersEmail.sender.email}>`,
    });
  }

  if (headersEmail.cc) {
    Object.assign(dataEmail, {
      cc: parseArrayEmailsToString(headersEmail.cc),
    });
  }

  if (headersEmail.bcc) {
    Object.assign(dataEmail, {
      bcc: parseArrayEmailsToString(headersEmail.bcc),
    });
  }

  if (headersEmail.replyTo) {
    const replyTo = Array.isArray(headersEmail.replyTo)
      ? parseArrayEmailsToString(headersEmail.replyTo)
      : `"${headersEmail.replyTo.name}" <${headersEmail.replyTo.email}>`;

    Object.assign(dataEmail, {
      replyTo,
    });
  }

  const info = await transporter.sendMail(dataEmail);

  return { status: 202, message: `messageId: #${info.messageId}` };
};

export default sendEmailSmtp;
