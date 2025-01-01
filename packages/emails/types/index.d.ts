import { Stores, Orders, Carts, Products, Customers } from '@cloudcommerce/types'
import { DataEmailSendGrid } from './sendgrid'

type EmailAdrress = {
  name: string,
  email: string,
};

type EmailHeaders = {
  from: EmailAdrress,
  to: EmailAdrress[],
  subject: string,
  cc?: EmailAdrress[],
  sender?: EmailAdrress,
  replyTo?: EmailAdrress | EmailAdrress[]
  bcc?: EmailAdrress[],
};

type TemplateData = { [key: string]: any };

// TODO: in the future the template can be an object, to accept other types of template besides EJS
type Template = string

type EmailConfig = {
  to: EmailAdrress[]
  subject: string,
  cc?: EmailAdrress[],
  sender?: EmailAdrress,
  bcc?: EmailAdrress[],
  text?: string,
  html?: string,
  templateData?: TemplateData,
  templateId?: string,
  template?: string,
};

// https://nodemailer.com/smtp/oauth2/
type SmtpConfig = {
  host: string,
  port: number,
  secure: boolean,
  auth: {
    user: string,
    pass: string,
  },
};

export type {
  EmailAdrress,
  EmailHeaders,
  TemplateData,
  Template,
  EmailConfig,
  DataEmailSendGrid,
  SmtpConfig,
}
