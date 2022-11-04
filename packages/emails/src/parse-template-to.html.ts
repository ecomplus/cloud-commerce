import type { TemplateData } from './types';
import ejs from 'ejs';
import logger from 'firebase-functions/logger';

const parseEjsToHtml = (
  templateData: TemplateData,
  template: string,
) => {
  try {
    const html = ejs.render(template, templateData);
    return html;
  } catch (err) {
    logger.error(err);
    return null;
  }
};

export default parseEjsToHtml;
