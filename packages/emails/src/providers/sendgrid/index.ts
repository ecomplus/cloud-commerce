import type {
  DataMailSendGrid,
  HeadersMail,
  TemplateData,
  Template,
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
  headersMail: HeadersMail,
  configTemplate: {
    templateData: TemplateData,
    templateId?: string,
    template?: Template,
  },
  sendGridApiKey: string,
) => {
  const { templateData, templateId, template } = configTemplate;
  let bodyMail: DataMailSendGrid | null = null;
  if (templateId) {
    bodyMail = parseDataByTemplateId(headersMail, templateData, templateId);
  } else if (template) {
    bodyMail = await parseDataForTemplate(headersMail, templateData, template);
  }

  if (!bodyMail) {
    throw new Error(`Email body for template: #${templateId || template}, not found`);
  }

  return sgAxios.post('/send', bodyMail, {
    headers: {
      Authorization: `Bearer ${sendGridApiKey}`,
    },
  });
};

export default sgSendMail;
