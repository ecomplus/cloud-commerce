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
import { logger } from '@cloudcommerce/firebase/lib/config';
import parseTemplateToHtml from '../../parse-template-to-html';

const parseEmailAddrs = <OneOnly extends boolean = false>(
  emails: EmailAdrress | EmailAdrress[],
  isOneOnly = false as OneOnly,
): OneOnly extends true ? string : string | string[] => {
  if (Array.isArray(emails)) {
    if (!isOneOnly && emails.length > 1) {
      return emails.map(({ name, email }: EmailAdrress) => {
        if (!name) return email;
        return `"${name.replace(/[<>"]/g, '')}" <${email}>`;
      }) as OneOnly extends true ? never : string[];
    }
    emails = emails[0];
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
    from: parseEmailAddrs(from, true),
    to: parseEmailAddrs(to),
    subject: emailHeaders.subject,
    html,
    text,
  };
  if (emailHeaders.sender) {
    mailOptions.sender = parseEmailAddrs(emailHeaders.sender, true);
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
          reply_to: mailOptions.replyTo,
        },
        {
          headers: { Authorization: `Bearer ${smtpConfig.auth.pass}` },
        },
      );
      return { status: 202, message: data.id };
    } catch (err: any) {
      logger.warn(`Error ${err.response?.status} sending email with Resend API`, {
        mailOptions,
        message: err.message,
        request: err.config,
        status: err.response?.status,
        response: err.response?.data,
      });
      throw err;
    }
  }
  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      return { status: 202, message: info.messageId };
    } catch (err: any) {
      logger.warn('Error sending email with SMTP', {
        mailOptions,
        message: err.message,
      });
      throw err;
    }
  }
  throw new Error('Error configuring SMTP settings');
};

export default sendEmail;

export {
  setConfigSmtp,
};
