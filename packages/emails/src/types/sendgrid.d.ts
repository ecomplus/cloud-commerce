import type {
  Carts,
  Orders,
  Customers,
  Stores,
} from '@cloudcommerce/types';
import type { HeadersMail, TemplateData } from '../../types/index';

type DataMailSendGrid = {
  from: {
  email: string,
  name: string,
},
personalizations: [
  {
    to: HeadersMail['to'],
    dynamic_template_data: TemplateData,
  },
],
template_id: string,
}

export type {
  DataMailSendGrid
};
