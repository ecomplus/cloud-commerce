import type {
  HeadersMail,
  TemplateData,
  DataMailSendGrid,
} from '../../types/index';
import logger from 'firebase-functions/logger';

const addTotalPriceItem = (templateData: TemplateData) => {
  templateData.items?.forEach((item: any) => {
    if (typeof item === 'object' && item.quantity && (item.final_price || item.price)) {
      item.total_price = item.quantity * (item.final_price || item.price);
    }
  });
};

const parseToData = (
  templateData: TemplateData,
  templateId: string,
  from: HeadersMail['from'],
  to: HeadersMail['to'],
) => {
  if (templateData.items && Array.isArray(templateData.items)) {
    // Sendgrid does not perform calculations
    addTotalPriceItem(templateData);
  }

  logger.log('>> from: ', from.email, ' to: ', JSON.stringify(to));
  const body: DataMailSendGrid = {
    from,
    personalizations: [
      {
        to,
        dynamic_template_data: templateData,
      },
    ],
    template_id: templateId,
  };
  return body;
};

export default parseToData;
