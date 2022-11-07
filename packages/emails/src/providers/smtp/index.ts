import type {
  EmailHeaders,
  SmtpConfig,
  EmailAdrress,
  TemplateData,
  Template,
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
let transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | undefined;
const setConfig = (smtpConfig: SmtpConfig) => {
  // create reusable transporter object using the default SMTP transport
  transporter = nodemailer.createTransport(smtpConfig);
};

const sendEmail = async (
  emailHeaders: EmailHeaders,
  smtpConfig: SmtpConfig,
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
  const mailOptions = {
    from: `"${from.name}" <${from.email}>`,
    to: parseEmailsToString(to),
    subject: emailHeaders.subject,
    html,
  };
  if (text) {
    Object.assign(mailOptions, text);
  }

  if (emailHeaders.sender) {
    Object.assign(mailOptions, {
      sender: `"${emailHeaders.sender.name}" <${emailHeaders.sender.email}>`,
    });
  }

  if (emailHeaders.cc) {
    Object.assign(mailOptions, {
      cc: parseEmailsToString(emailHeaders.cc),
    });
  }

  if (emailHeaders.bcc) {
    Object.assign(mailOptions, {
      bcc: parseEmailsToString(emailHeaders.bcc),
    });
  }

  if (emailHeaders.replyTo) {
    const replyTo = parseEmailsToString(emailHeaders.replyTo);
    Object.assign(mailOptions, {
      replyTo,
    });
  }

  if (!transporter) {
    setConfig(smtpConfig);
  }

  if (transporter) {
    const info = await transporter.sendMail(mailOptions);
    return { status: 202, message: `messageId: #${info.messageId}` };
  }
  return { status: 404, message: 'Error configuring SMTP settings' };
};

export default sendEmail;
