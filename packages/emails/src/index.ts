import type {
  // EmailHeaders,
  SmtpConfig,
  EmailAdrress,
  TemplateData,
  Template,
  // DataEmailSendGrid,
} from '../types/index';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import type { SettingsContent } from '@cloudcommerce/types';
import cloudCommerceConfig from '@cloudcommerce/firebase/lib/config';
import nodemailer from 'nodemailer';
import axios, { AxiosInstance } from 'axios';
import parseTemplateToHtml from './parse-template-to-html';
// import {
//   sendGridBodyWithTemplateId,
//   sendGridBodyWithTemplate,
//   sendGridBodyWithHtml,
// } from './providers/sendgrid/parse-to-data';

const parseEmailsToString = (emails: EmailAdrress | EmailAdrress[]) => {
  if (Array.isArray(emails)) {
    return emails.reduce((value: string, emailAdrress: EmailAdrress) => {
      if (emailAdrress.email) {
        return `${value}, ${emailAdrress.email}`;
      }
      return value;
    }, '');
  }
  if (emails.email) {
    return `"${emails.name}" <${emails.email}>`;
  }
  return '';
};

class Email {
  from: EmailAdrress;
  to?: EmailAdrress[];
  subject?: string;
  cc?: EmailAdrress[];
  sender?: EmailAdrress;
  replyTo?: EmailAdrress | EmailAdrress[];
  bcc?: EmailAdrress[];

  text?: string;
  html?: string;
  templateData?: TemplateData;
  template?: Template;

  transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | undefined;
  mailOptionsSmtp: SMTPTransport.MailOptions | undefined;

  settingsContent: SettingsContent | undefined;

  // bodyEmail: DataEmailSendGrid | undefined;
  templateId: string | undefined;
  sendGridApi: AxiosInstance | undefined;

  mailSander = process.env.MAIL_SENDER;
  mailSanderName = process.env.MAIL_SENDER_NAME;
  mailReplyTo = process.env.MAIL_REPLY_TO;
  smtpHost = process.env.SMTP_HOST;
  smtpPort = process.env.SMTP_PORT;
  smtpUser = process.env.SMTP_USER;
  smtpPass = process.env.SMTP_PASS;
  smtpTls = process.env.SMTP_TLS;
  gcloudProject = process.env.GCLOUD_PROJECT;

  constructor() {
    const { settingsContent } = cloudCommerceConfig.get();

    if (settingsContent) {
      this.settingsContent = settingsContent;
    }

    if (!this.mailSanderName && !settingsContent.name) {
      throw new Error('Sender name not found');
    }

    this.from = {
      name: this.mailSanderName || settingsContent.name,
      email: this.mailSander
        || `${(this.gcloudProject?.replace('ecom2', '') || 'lojas')}@e-com.plus`,
    };

    this.replyTo = {
      name: settingsContent.name,
      email: this.mailReplyTo || settingsContent.email,
    };
  }

  setFrom(person: { email: string, name?: string }) {
    if (!person.email) {
      throw new Error('Sender (from) are not of type EmailAddress');
    }

    this.from = {
      name: person.name || this.mailSanderName
        || this.settingsContent?.name || '',
      email: person.email,
    };

    return this;
  }

  setSender(person: { email: string, name?: string }) {
    if (!person.email) {
      throw new Error('Sender are not of type EmailAddress');
    }

    this.sender = {
      name: person.name || '',
      email: person.email,
    };

    return this;
  }

  setReplyTo(senders: EmailAdrress | EmailAdrress[]) {
    if (Array.isArray(senders)) {
      senders.forEach((sender) => {
        if (!sender.email) {
          throw new Error('Senders (replyTo) are not of type EmailAddress');
        }
      });
      this.replyTo = senders;
    } else if (senders.email) {
      this.replyTo = [senders];
    } else {
      throw new Error('Sender (replyTo) are not of type EmailAddress');
    }

    return this;
  }

  setTo(recipients: EmailAdrress | EmailAdrress[]) {
    if (Array.isArray(recipients)) {
      recipients.forEach((recipient) => {
        if (!recipient.email) {
          throw new Error('Recipients are not of type EmailAddress');
        }
      });
      this.to = recipients;
    } else if (recipients.email) {
      this.to = [recipients];
    } else {
      throw new Error('Recipient are not of type EmailAddress');
    }

    return this;
  }

  setCc(recipients: EmailAdrress[]) {
    if (Array.isArray(recipients)) {
      this.cc = recipients;
    }

    return this;
  }

  setBcc(recipients: EmailAdrress[]) {
    if (Array.isArray(recipients)) {
      this.bcc = recipients;
    }

    return this;
  }

  setSubject(subject: string) {
    this.subject = subject;
    return this;
  }

  // Config to SMTP
  setConfigSmtp(config?: SmtpConfig) {
    let smtpConfig: SmtpConfig | undefined;
    if (
      !config && this.smtpHost && this.smtpPort
        && this.smtpUser && this.smtpPass
    ) {
      const port = parseInt(this.smtpPort, 10);
      const secure = this.smtpTls && this.smtpTls.toUpperCase() === 'TRUE' ? true : port === 465;
      // secure = true for 465, false for other ports
      smtpConfig = {
        host: this.smtpHost,
        port,
        secure,
        auth: { user: this.smtpUser, pass: this.smtpPass },
      };
    }

    if (!config && !smtpConfig) {
      throw new Error('Variables for SMTP configuration not found');
    }

    // create reusable transporter object using the default SMTP transport
    this.transporter = nodemailer.createTransport(config || smtpConfig);
    return this;
  }

  setMailOptionsSmtp() {
    if (!this.to) {
      return new Error('Recipient not found');
    }
    const mailOptions: SMTPTransport.MailOptions = {
      from: `"${this.from.name}" <${this.from.email}>`,
      to: parseEmailsToString(this.to),
      subject: this.subject || '',
      html: this.html,
      text: this.text,
    };
    if (this.sender) {
      mailOptions.sender = `"${this.sender.name}" <${this.sender.email}>`;
    }
    if (this.cc) {
      mailOptions.cc = parseEmailsToString(this.cc);
    }
    if (this.bcc) {
      mailOptions.bcc = parseEmailsToString(this.bcc);
    }
    if (this.replyTo) {
      mailOptions.replyTo = parseEmailsToString(this.replyTo);
    }

    this.mailOptionsSmtp = mailOptions;

    return this;
  }

  async setHtml(
    template?: Template,
    templateData?: TemplateData,
    html?:string,
    templateId?: string,
  ) {
    const isSendGid = process.env.SENDGRID_API_KEY
     && process.env.SENDGRID_API_KEY !== '';

    if (isSendGid && !templateId && !templateData) {
      throw new Error('Template or templateId not found');
    } else if (!template && !html) {
      throw new Error('Template or html not found');
    } else if (template && !templateData) {
      throw new Error('Data for template not found');
    }

    if (isSendGid && templateId && templateData) {
      // sendGridBodyWithTemplateId(emailHeaders, templateData, templateId);
    } else if (html) {
      this.html = html;
      // sendGridBodyWithHtml(emailHeaders, html);
    } else if (template && templateData) {
      this.html = !isSendGid
        ? parseTemplateToHtml(templateData, template)
        : '';
      // await sendGridBodyWithTemplate(emailHeaders, templateData, template);
    }

    if (!this.html) {
      throw new Error('Email body for template, not found');
    }

    return this;
  }

  // Config to SendGrid
  setSendGridApi() {
    if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === '') {
      throw new Error('Variable SENDGRID_API_KEY not configured');
    }

    this.sendGridApi = axios.create({
      baseURL: 'https://api.sendgrid.com/v3',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
    });
    return this;
  }

  async setTemplateId(templateId: string) {
    if (!this.sendGridApi) {
      this.setSendGridApi();
    }
    const data = await this.sendGridApi?.get(`/templates/${templateId}`);
    if (data?.status === 200) {
      this.templateId = templateId;
    }

    return this;
  }

  async sendEmail() {
    if (this.to && (this.html || this.text)) {
      this.setConfigSmtp();
      this.setMailOptionsSmtp();
    }
    if (!this.to) {
      return new Error('Recipient not configured');
    }

    if (this.transporter && this.mailOptionsSmtp) {
      const info = await this.transporter.sendMail(this.mailOptionsSmtp);
      return { status: 202, message: `messageId: #${info.messageId}` };
    }

    // TODO: SendGrid
    // sendGridApi, body = parse html

    // TODO: other providers

    return new Error('No email provider not configured');
  }
}

export default Email;
