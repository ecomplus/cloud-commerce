import type { EmailHeaders, TemplateData, EmailAdrress } from './index';

type DataEmailSendGrid = {
  personalizations: [
    {
      to: EmailHeaders['to'],
      cc?: EmailAdrress[],
      bcc?: EmailAdrress[],
      dynamic_template_data?: TemplateData,
      substitutions?: TemplateData
    },
  ],
  from: EmailAdrress,
  reply_to?: EmailAdrress,
  reply_to_list?: EmailAdrress[],
  subject: string,
  template_id?: string,
  content?: [
    {
      type: 'text/html',
      value: string
    }
  ]
}

export type {
  DataEmailSendGrid
};
