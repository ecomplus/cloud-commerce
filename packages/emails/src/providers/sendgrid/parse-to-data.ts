import type {
  EmailHeaders,
  TemplateData,
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
  headersEmail: EmailHeaders,
  templateData: TemplateData,
  templateId: string,
) => {
  logger.log('>> from: ', headersEmail.from.email, ' to: ', JSON.stringify(headersEmail.to));
  const body = createBodySendGrid(headersEmail);
  body.personalizations[0].dynamic_template_data = templateData;
  body.template_id = templateId;

  return body;
};

const sendGridBodyWithTemplate = async (
  headersEmail: EmailHeaders,
  templateData: TemplateData,
  template: string,
) => {
  logger.log('>> from: ', headersEmail.from.email, ' to: ', JSON.stringify(headersEmail.to));
  const body = createBodySendGrid(headersEmail);

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
  headersEmail: EmailHeaders,
  html: string,
) => {
  logger.log('>> from: ', headersEmail.from.email, ' to: ', JSON.stringify(headersEmail.to));
  const body = createBodySendGrid(headersEmail);

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
