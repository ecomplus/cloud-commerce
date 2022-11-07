import type { AxiosInstance } from 'axios';
import type {
  DataEmailSendGrid,
  EmailHeaders,
  TemplateData,
  Template,
} from '../../types/index';
import axios from 'axios';
import logger from 'firebase-functions/logger';
import {
  sendGridBodyWithTemplateId,
  sendGridBodyWithTemplate,
  sendGridBodyWithHtml,
} from './parse-to-data';

let sgAxios: AxiosInstance | undefined;

const setSendGridConfig = (apiKey: string) => {
  sgAxios = axios.create({
    baseURL: 'https://api.sendgrid.com/v3/mail',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  });
};

const sendEmail = async (
  emailHeaders: EmailHeaders,
  dataOptions: {
    html?: string,
    templateData?: TemplateData,
    templateId?: string,
    template?: Template,
  },
) => {
  const {
    templateData,
    templateId,
    template,
  } = dataOptions;
  const { html } = dataOptions;
  let bodyEmail: DataEmailSendGrid | null = null;
  if (templateId && templateData) {
    bodyEmail = sendGridBodyWithTemplateId(emailHeaders, templateData, templateId);
  } else if (template && templateData) {
    bodyEmail = await sendGridBodyWithTemplate(emailHeaders, templateData, template);
  } else if (html) {
    bodyEmail = sendGridBodyWithHtml(emailHeaders, html);
  }

  if (!bodyEmail) {
    return { status: 404, message: `Email body for template: #${templateId || template}, not found` };
  }
  if (sgAxios) {
    try {
      const result = await sgAxios.post('/send', bodyEmail);
      return result;
    } catch (err: any) {
      let message = 'Unexpected error';
      const { response } = err;
      const {
        status,
      } = response;
      const [errors] = response.data.errors;

      if (errors.field === 'template_id' && template && templateData) {
        bodyEmail = await sendGridBodyWithTemplate(emailHeaders, templateData, template);
        if (bodyEmail) {
          return sgAxios.post('/send', bodyEmail);
        }
        message = 'TemplateId and template not found';
      } else if (response && response.data && response.data.errors) {
        message = response.data.errors;
      } else {
        logger.error(err);
      }

      return { status: status || 400, message };
    }
  }
  return { status: 404, message: 'SendGrid API key not found' };
};

export default sendEmail;

export {
  setSendGridConfig,
};
