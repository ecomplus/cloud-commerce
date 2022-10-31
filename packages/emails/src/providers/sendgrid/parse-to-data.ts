import type {
  HeadersMail,
  TemplateData,
  DataMailSendGrid,
  Template,
} from '../../types/index';
import logger from 'firebase-functions/logger';
import parseDataToTransactionalMails from '../../parse-data-to-transactional-mails';

const parseDataByTemplateId = (
  headersMail: HeadersMail,
  templateData: TemplateData,
  templateId: string,
) => {
  const {
    from,
    to,
    subject,
    replyTo,
    cc,
    bcc,
  } = headersMail;

  logger.log('>> from: ', from.email, ' to: ', JSON.stringify(to));
  const body: DataMailSendGrid = {
    personalizations: [
      {
        to,
        cc,
        bcc,
        dynamic_template_data: templateData,
      },
    ],
    from,
    subject,
    template_id: templateId,
  };

  if (replyTo) {
    if (Array.isArray(replyTo)) {
      body.reply_to_list = replyTo;
    } else {
      body.reply_to = replyTo;
    }
  }
  return body;
};

const parseDataForTemplate = async (
  headersMail: HeadersMail,
  templateData: TemplateData,
  template: Template,
) => {
  const {
    from,
    to,
    subject,
    replyTo,
    cc,
    bcc,
  } = headersMail;

  logger.log('>> from: ', from.email, ' to: ', JSON.stringify(to));
  const body: DataMailSendGrid = {
    personalizations: [
      {
        to,
        cc,
        bcc,
      },
    ],
    from,
    subject,
  };

  if (replyTo) {
    if (Array.isArray(replyTo)) {
      body.reply_to_list = replyTo;
    } else {
      body.reply_to = replyTo;
    }
  }

  const contentValue = await parseDataToTransactionalMails(templateData, template);

  if (!contentValue) {
    return null;
  }

  body.content = [{
    type: 'text/html',
    value: contentValue,
  }];
  return body;
};

export {
  parseDataByTemplateId,
  parseDataForTemplate,
};
