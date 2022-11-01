import type {
  DataEmailSendGrid,
  HeadersEmail,
  TemplateConfig,
} from '../../types/index';
import axios from 'axios';
import { parseDataByTemplateId, parseDataForTemplate } from './parse-to-data';

const sgAxios = axios.create({
  baseURL: 'https://api.sendgrid.com/v3/mail',
  headers: {
    'Content-Type': 'application/json',
  },
});

const sgSendMail = async (
  headersEmail: HeadersEmail,
  templateConfig: TemplateConfig,
  sendGridApiKey: string,
) => {
  const { templateData, templateId, template } = templateConfig;
  let bodyEmail: DataEmailSendGrid | null = null;
  if (templateId) {
    bodyEmail = parseDataByTemplateId(headersEmail, templateData, templateId);
  } else if (template) {
    bodyEmail = await parseDataForTemplate(headersEmail, templateData, template);
  }

  if (!bodyEmail) {
    throw new Error(`Email body for template: #${templateId || template}, not found`);
  }

  return sgAxios.post('/send', bodyEmail, {
    headers: {
      Authorization: `Bearer ${sendGridApiKey}`,
    },
  });
};

export default sgSendMail;
