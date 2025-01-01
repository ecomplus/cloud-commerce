import type {
  EmailHeaders,
  SmtpConfig,
  EmailAdrress,
  TemplateData,
  Template,
} from '../../../types/index';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import nodemailer from 'nodemailer';
import axios from 'axios';
import parseTemplateToHtml from '../../parse-template-to-html';

const parseEmailAddrs = (emails: EmailAdrress | EmailAdrress[]) => {
  if (Array.isArray(emails)) {
    return emails.reduce((value: string, emailAdrress: EmailAdrress) => {
      return `${value}, ${emailAdrress.email}`;
    }, '');
  }
  if (!emails.name) return emails.email;
  return `"${emails.name.replace(/[<>"]/g, '')}" <${emails.email}>`;
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
    from: parseEmailAddrs(from),
    to: parseEmailAddrs(to),
    subject: emailHeaders.subject,
    html,
    text,
  };
  if (emailHeaders.sender) {
    mailOptions.sender = parseEmailAddrs(emailHeaders.sender);
  }
  if (emailHeaders.cc) {
    mailOptions.cc = parseEmailAddrs(emailHeaders.cc);
  }
  if (emailHeaders.bcc) {
    mailOptions.bcc = parseEmailAddrs(emailHeaders.bcc);
  }
  if (emailHeaders.replyTo) {
    mailOptions.replyTo = parseEmailAddrs(emailHeaders.replyTo);
  }
  if (!transporter && smtpConfig) {
    setConfigSmtp(smtpConfig);
  }
  if (smtpConfig?.host === 'smtp.resend.com') {
    try {
      const { data } = await axios.post(
        'https://api.resend.com/emails',
        {
          ...mailOptions,
          replyTo: undefined,
          reply_to: emailHeaders.replyTo,
        },
        {
          headers: { Authorization: `Bearer ${smtpConfig.auth.pass}` },
        },
      );
      return { status: 202, message: data.id };
    } catch (err: any) {
      if (err.response) {
        const error: any = new Error('Error sending email with Resend API');
        error.request = err.config;
        error.status = err.response.status;
        error.response = err.response.data;
        throw new Error(error);
      }
      throw err;
    }
  }
  if (transporter) {
    const info = await transporter.sendMail(mailOptions);
    return { status: 202, message: info.messageId };
  }
  throw new Error('Error configuring SMTP settings');
};

export default sendEmail;

export {
  setConfigSmtp,
};
