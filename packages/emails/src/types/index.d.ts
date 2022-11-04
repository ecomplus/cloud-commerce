import { Stores, Orders, Carts, Products, Customers } from '@cloudcommerce/types'
import { DataEmailSendGrid } from './sendgrid'

type EmailAdrress = {
  name: string,
  email: string,
}

type EmailHeaders = {
  from: EmailAdrress,
  to: EmailAdrress | EmailAdrress[],
  subject: string,
  cc?: EmailAdrress[],
  sender?: EmailAdrress,
  replyTo?: EmailAdrress | EmailAdrress[]
  bcc?: EmailAdrress[],
}

type TemplateData = { [key: string]: any }

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
}

// https://nodemailer.com/smtp/oauth2/

type SmtpAuth = {
  user: string,
  pass: string,
}

type SmtpAuthToken = {
  type: 'OAuth2',
  user: string,
  accessToken: string,
}

type SmtpAuth3LO = {
  type: 'OAuth2',
  user: string,
  clientId: string,
  clientSecret: string,
  refreshToken: string,
  accessToken: string,
  expires: number,
}

type SmtpAuth2LO = {
  type: 'OAuth2',
  user: string,
  serviceClient: string,
  privateKey?: string,
  accessToken: string,
  expires: number,
}

type SmtpConfig = {
  host: string,
  port: number,
  secure: boolean,
  auth: SmtpAuth | SmtpAuthToken | SmtpAuth2LO | SmtpAuth3LO
}

export type {
  EmailAdrress,
  EmailHeaders,
  TemplateData,
  EmailConfig,
  DataEmailSendGrid,
  SmtpConfig,
}
