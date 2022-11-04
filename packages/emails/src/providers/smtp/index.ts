import type {
  EmailHeaders,
  SmtpConfig,
  EmailAdrress,
  TemplateData,
} from '../../types/index';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import nodemailer from 'nodemailer';
import parseTemplateToHtml from '../../parse-template-to.html';

const parseEmailsToString = (emails: EmailAdrress | EmailAdrress[]) => {
  if (Array.isArray(emails)) {
    return emails.reduce((value: string, emailAdrress: EmailAdrress) => {
      return `${value}, ${emailAdrress.email}`;
    }, '');
  }
  return `"${emails.name}" <${emails.email}>`;
};
let smtp: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | undefined;
const setSmtpConfig = (smtpConfig: SmtpConfig) => {
  // create reusable transporter object using the default SMTP transport
  smtp = nodemailer.createTransport(smtpConfig);
};

const sendEmailSmtp = async (
  emailHeaders: EmailHeaders,
  smtpConfig: SmtpConfig,
  text?: string,
  html?: string,
  templateData?: TemplateData,
  template?: string,
) => {
  const { from, to } = emailHeaders;
  if (!template && !html) {
    return { status: 404, message: 'Template or html not found' };
  }

  if (template && !templateData) {
    return { status: 404, message: 'Data for template not found' };
  }

  if (template && templateData) {
    html = parseTemplateToHtml(templateData, template) || html;
  }

  if (!html) {
    return { status: 404, message: `Email body for template: #${template}, not found` };
  }

  // send mail with defined transport object
  const dataEmail = {
    from: `"${from.name}" <${from.email}>`,
    to: parseEmailsToString(to),
    subject: emailHeaders.subject,
    html,
  };
  if (text) {
    Object.assign(dataEmail, text);
  }

  if (emailHeaders.sender) {
    Object.assign(dataEmail, {
      sender: `"${emailHeaders.sender.name}" <${emailHeaders.sender.email}>`,
    });
  }

  if (emailHeaders.cc) {
    Object.assign(dataEmail, {
      cc: parseEmailsToString(emailHeaders.cc),
    });
  }

  if (emailHeaders.bcc) {
    Object.assign(dataEmail, {
      bcc: parseEmailsToString(emailHeaders.bcc),
    });
  }

  if (emailHeaders.replyTo) {
    const replyTo = parseEmailsToString(emailHeaders.replyTo);
    Object.assign(dataEmail, {
      replyTo,
    });
  }

  if (!smtp) {
    setSmtpConfig(smtpConfig);
  }

  if (smtp) {
    const info = await smtp.sendMail(dataEmail);
    return { status: 202, message: `messageId: #${info.messageId}` };
  }
  return { status: 404, message: 'Error configuring SMTP settings' };
};

export default sendEmailSmtp;
