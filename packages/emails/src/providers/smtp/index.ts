import type {
  EmailHeaders,
  SmtpConfig,
  EmailAdrress,
  TemplateData,
  Template,
} from '../../../types/index';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import nodemailer from 'nodemailer';
import parseTemplateToHtml from '../../parse-template-to-html';

const parseEmailsToString = (emails: EmailAdrress | EmailAdrress[]) => {
  if (Array.isArray(emails)) {
    return emails.reduce((value: string, emailAdrress: EmailAdrress) => {
      return `${value}, ${emailAdrress.email}`;
    }, '');
  }
  return `"${emails.name}" <${emails.email}>`;
};

let smtpConfig: SmtpConfig | undefined;

let transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | undefined;

const setConfigSmtp = (config: SmtpConfig) => {
  smtpConfig = config;
  // create reusable transporter object using the default SMTP transport
  transporter = nodemailer.createTransport(config);
};

const sendEmail = async (
  emailHeaders: EmailHeaders,
  dataOptions: {
    text?: string,
    html?: string,
    templateData?: TemplateData,
    template?: Template,
  },
) => {
  const {
    text,
    templateData,
    template,
  } = dataOptions;
  let { html } = dataOptions;
  const { from, to } = emailHeaders;
  if (!template && !html) {
    throw new Error('Template or html not found');
  }
  if (template && !templateData) {
    throw new Error('Data for template not found');
  }
  if (template && templateData) {
    html = parseTemplateToHtml(templateData, template);
  }
  if (!html) {
    throw new Error(`Email body for template: #${template}, not found`);
  }
  const mailOptions: SMTPTransport.MailOptions = {
    from: `"${from.name}" <${from.email}>`,
    to: parseEmailsToString(to),
    subject: emailHeaders.subject,
    html,
    text,
  };
  if (emailHeaders.sender) {
    mailOptions.sender = `"${emailHeaders.sender.name}" <${emailHeaders.sender.email}>`;
  }
  if (emailHeaders.cc) {
    mailOptions.cc = parseEmailsToString(emailHeaders.cc);
  }
  if (emailHeaders.bcc) {
    mailOptions.bcc = parseEmailsToString(emailHeaders.bcc);
  }
  if (emailHeaders.replyTo) {
    mailOptions.replyTo = parseEmailsToString(emailHeaders.replyTo);
  }
  if (!transporter && smtpConfig) {
    setConfigSmtp(smtpConfig);
  }
  if (transporter) {
    const info = await transporter.sendMail(mailOptions);
    return { status: 202, message: `messageId: #${info.messageId}` };
  }
  throw new Error('Error configuring SMTP settings');
};

export default sendEmail;

export {
  setConfigSmtp,
};
