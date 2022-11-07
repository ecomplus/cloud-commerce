import type {
  EmailHeaders,
  TemplateData,
  Template,
  DataEmailSendGrid,
} from '../../types/index';
import logger from 'firebase-functions/logger';
import parseTemplateToHtml from '../../parse-template-to.html';

const createBodySendGrid = (
  headersEmail: EmailHeaders,

) => {
  const {
    from,
    to,
    subject,
    replyTo,
    cc,
    bcc,
  } = headersEmail;

  const body: DataEmailSendGrid = {
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
  return body;
};

const sendGridBodyWithTemplateId = (
  emailHeaders: EmailHeaders,
  templateData: TemplateData,
  templateId: string,
) => {
  logger.log('>> from: ', emailHeaders.from.email, ' to: ', JSON.stringify(emailHeaders.to));
  const body = createBodySendGrid(emailHeaders);
  body.personalizations[0].dynamic_template_data = templateData;
  body.template_id = templateId;

  return body;
};

const sendGridBodyWithTemplate = async (
  emailHeaders: EmailHeaders,
  templateData: TemplateData,
  template: Template,
) => {
  logger.log('>> from: ', emailHeaders.from.email, ' to: ', JSON.stringify(emailHeaders.to));
  const body = createBodySendGrid(emailHeaders);

  const contentValue = parseTemplateToHtml(templateData, template);

  if (!contentValue) {
    return null;
  }

  body.content = [{
    type: 'text/html',
    value: contentValue,
  }];

  return body;
};

const sendGridBodyWithHtml = (
  emailHeaders: EmailHeaders,
  html: string,
) => {
  logger.log('>> from: ', emailHeaders.from.email, ' to: ', JSON.stringify(emailHeaders.to));
  const body = createBodySendGrid(emailHeaders);

  body.content = [{
    type: 'text/html',
    value: html,
  }];

  return body;
};

export {
  sendGridBodyWithTemplateId,
  sendGridBodyWithTemplate,
  sendGridBodyWithHtml,
};
