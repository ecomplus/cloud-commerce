import type {
  // EmailHeaders,
  SmtpConfig,
  EmailAdrress,
  TemplateData,
  Template,
  // DataEmailSendGrid,
} from '../types/index';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import nodemailer from 'nodemailer';
import _config from '@cloudcommerce/firebase/lib/config';
import parseTemplateToHtml from './parse-template-to-html';
// import {
//   sendGridBodyWithTemplateId,
//   sendGridBodyWithTemplate,
//   sendGridBodyWithHtml,
// } from './providers/sendgrid/parse-to-data';

const parseEmailsToString = (emails: EmailAdrress | EmailAdrress[]) => {
  if (Array.isArray(emails)) {
    return emails.reduce((value: string, emailAdrress: EmailAdrress) => {
      return `${value}, ${emailAdrress.email}`;
    }, '');
  }
  return `"${emails.name}" <${emails.email}>`;
};

const {
  MAIL_SENDER,
  MAIL_SENDER_NAME,
  MAIL_REPLY_TO,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_TLS,
  // SENDGRID_API_KEY,
} = process.env;

console.log('>> SMTP_HOST ', process.env.SMTP_HOST);

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

  // bodyEmail: DataEmailSendGrid;

  constructor() {
    const { settingsContent } = _config.get();

    if (!MAIL_SENDER_NAME && !settingsContent.name) {
      throw new Error('Sender name not found');
    }

    this.from = {
      name: MAIL_SENDER_NAME || settingsContent.name,
      email: MAIL_SENDER || 'lojas@e-com.plus',
    };

    this.replyTo = {
      name: settingsContent.name,
      email: MAIL_REPLY_TO || settingsContent.email,
    };
  }

  setFrom(person: { email: string, name?: string }) {
    this.from = {
      name: person.name || '',
      email: person.email,
    };

    return this;
  }

  setSender(person: { email: string, name?: string }) {
    this.sender = {
      name: person.name || '',
      email: person.email,
    };

    return this;
  }

  setReplyTo(recipients: EmailAdrress | EmailAdrress[]) {
    if (Array.isArray(recipients)) {
      this.replyTo = recipients;
    } else {
      this.replyTo = [recipients];
    }

    return this;
  }

  setTo(recipients: EmailAdrress | EmailAdrress[]) {
    if (Array.isArray(recipients)) {
      this.to = recipients;
    } else {
      this.to = [recipients];
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

  setHtml(template?: Template, templateData?: TemplateData, html?:string) {
    if (!template && !html) {
      throw new Error('Template or html not found');
    }
    if (template && !templateData) {
      throw new Error('Data for template not found');
    }

    if (html) {
      this.html = html;
    } else if (template && templateData) {
      this.html = parseTemplateToHtml(templateData, template);
    }

    if (!this.html) {
      throw new Error(`Email body for template: #${template}, not found`);
    }

    return this;
  }

  setConfigSmtp(config?: SmtpConfig) {
    console.log('>> 1');
    let smtpConfig: SmtpConfig | undefined;
    if (!config && SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
      const port = parseInt(SMTP_PORT, 10);
      const secure = SMTP_TLS && SMTP_TLS.toUpperCase() === 'TRUE' ? true : port === 465;
      // secure = true for 465, false for other ports
      smtpConfig = {
        host: SMTP_HOST,
        port,
        secure,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      };
    }

    console.log('config ', config, ' ', smtpConfig, SMTP_HOST);
    if (!config && !smtpConfig) {
      throw new Error('Variables for SMTP configuration not found');
    }

    // create reusable transporter object using the default SMTP transport
    this.transporter = nodemailer.createTransport(config);
    return this;
  }

  setMailOptionsSmtp() {
    console.log('>> 2');
    if (!this.to) {
      throw new Error('Recipient not found');
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

  async sendEmail() {
    if (this.to && (this.html || this.text)) {
      this.setConfigSmtp();
      this.setMailOptionsSmtp();
    }

    if (this.transporter && this.mailOptionsSmtp) {
      const info = await this.transporter.sendMail(this.mailOptionsSmtp);
      return { status: 202, message: `messageId: #${info.messageId}` };
    }

    // TODO: other providers

    throw new Error('No email provider not configured');
  }
}

export default Email;
