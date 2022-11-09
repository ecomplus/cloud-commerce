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
