import { DataMailSendGrid } from './sendgrid'

type EmailAdrress = {
  name: string
  email: string
}

type HeadersMail = {
  from: EmailAdrress,
  to: EmailAdrress[]
  subject: string,
  cc?: EmailAdrress[],
  sender?: EmailAdrress,
  replyTo?: EmailAdrress | EmailAdrress[]
  bcc?: EmailAdrress[],
}

type TemplateData = { [key: string]: any }

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

type SmtpConfig = {
  host: string,
  port: number,
  secure: boolean,
  auth: {
    user: string,
    pass: string,
  }
}

export type {
  EmailAdrress,
  HeadersMail,
  TemplateData,
  Template,
  DataMailSendGrid,
  SmtpConfig
}
