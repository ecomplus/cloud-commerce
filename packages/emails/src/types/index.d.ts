import { Stores, Orders, Carts, Products, Customers } from '@cloudcommerce/types'
import { DataEmailSendGrid } from './sendgrid'

type EmailAdrress = {
  name: string
  email: string
}

type HeadersEmail = {
  from: EmailAdrress,
  to: EmailAdrress[]
  subject: string,
  cc?: EmailAdrress[],
  sender?: EmailAdrress,
  replyTo?: EmailAdrress | EmailAdrress[]
  bcc?: EmailAdrress[],
}

type TemplateData = {
  store: Stores,
  customer: Customers,
  cart?: Carts,
  order?: Orders,
  product?: Products
  lang?: 'pt_br' | 'en_us',
  customMessage?: string
}

type Template = 'welcome'
  | 'abandonedCart'
  | 'authorized'
  | 'delivered'
  | 'inDispute'
  | 'inProduction'
  | 'inSeparation'
  | 'invoiceIssued'
  | 'new_order'
  | 'paid'
  | 'partiallyDelivered'
  | 'partiallyPaid'
  | 'partiallyRefunded'
  | 'partiallyShipped'
  | 'pending'
  | 'readyForShipping'
  | 'receivedForExchange'
  | 'refunded'
  | 'returned'
  | 'returnedForExchange'
  | 'shipped'
  | 'unauthorized'
  | 'underAnalysis'
  | 'voided'
  | 'promo'
  | 'stock';


type TemplateConfig = {
  templateData: TemplateData,
  templateId?: string,
  template?: Template,
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
  HeadersEmail,
  TemplateData,
  Template,
  TemplateConfig,
  DataEmailSendGrid,
  SmtpConfig
}
