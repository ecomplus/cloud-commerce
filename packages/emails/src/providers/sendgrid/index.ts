import type {
  DataEmailSendGrid,
  EmailHeaders,
  TemplateData,
  Template,
} from '../../../types/index';
import axios from 'axios';
import {
  sendGridBodyWithTemplateId,
  sendGridBodyWithTemplate,
  sendGridBodyWithHtml,
} from './parse-to-data';

const sgAxios = axios.create({
  baseURL: 'https://api.sendgrid.com/v3/mail',
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    throw new Error(`Email body for template: #${templateId || template}, not found`);
  }

  try {
    const result = await sgAxios.post('/send', bodyEmail, {
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
    });
    return result;
  } catch (err: any) {
    const { response } = err;
    const [errors] = response.data.errors;
    if (errors.field === 'template_id' && template && templateData) {
      bodyEmail = await sendGridBodyWithTemplate(emailHeaders, templateData, template);
      if (bodyEmail) {
        return sgAxios.post('/send', bodyEmail, {
          headers: {
            Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          },
        });
      }
      throw new Error('TemplateId and template not found');
    }
    throw err;
  }
};

export default sendEmail;
