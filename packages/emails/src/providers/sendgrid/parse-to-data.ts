import type {
  EmailHeaders,
  TemplateData,
  Template,
  DataEmailSendGrid,
} from '../../../types/index';
import parseTemplateToHtml from '../../parse-template-to-html';

const createBodySendGrid = (emailHeaders: EmailHeaders) => {
  const {
    from,
    to,
    subject,
    replyTo,
    cc,
    bcc,
  } = emailHeaders;

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
