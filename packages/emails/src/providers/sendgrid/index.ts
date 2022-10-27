import type { HeadersMail, TemplateData } from '../../types/index';
import axios from 'axios';
import parseToData from './parse-to-data';

const sgAxios = axios.create({
  baseURL: 'https://api.sendgrid.com/v3/mail',
  headers: {
    'Content-Type': 'application/json',
  },
});

const sgSendMail = (
  sendGridApiKey: string,
  headersMail: HeadersMail,
  templateData: TemplateData,
  templateId?: string,
  template?: {[x:string]: any},
) => {
  let bodyMail = {};
  if (templateId) {
    const { from, to } = headersMail;
    bodyMail = parseToData(templateData, templateId, from, to);
  } else if (template) {
    // TODO: apply data to the template
    bodyMail = template;
  }

  return sgAxios.post('/send', bodyMail, {
    headers: {
      Authorization: `Bearer ${sendGridApiKey}`,
    },
  });
};

export default sgSendMail;
