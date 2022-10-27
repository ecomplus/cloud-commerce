
import { DataMailSendGrid } from './sendgrid'
type EmailAdrress ={
    name: string
    email: string
  }

type HeadersMail = {
  from: EmailAdrress,
  to: EmailAdrress []
  subject: string,
  cc?: EmailAdrress[],
  sender?: EmailAdrress,
  replyTo?: EmailAdrress | EmailAdrress[]
  bcc?: EmailAdrress[],
}

type TemplateData = {[x:string]: any} & {
  store: Stores,
  customer?: Customers,
}


export type {
  EmailAdrress,
  HeadersMail,
  TemplateData,
  DataMailSendGrid
}
