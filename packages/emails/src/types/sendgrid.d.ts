import type {
  Carts,
  Orders,
  Customers,
  Stores,
} from '@cloudcommerce/types';
import type { HeadersMail, TemplateData, EmailAdrress } from '../../types/index';

type DataMailSendGrid = {
  personalizations: [
    {
      to: HeadersMail['to'],
      cc?:EmailAdrress[],
      bcc?:EmailAdrress[],
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
  DataMailSendGrid
};
