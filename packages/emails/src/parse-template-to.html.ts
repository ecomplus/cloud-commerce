import type { TemplateData, Template } from './types';
import ejs from 'ejs';
import logger from 'firebase-functions/logger';

const parseTemplateToHtml = (
  templateData: TemplateData,
  template: Template,
) => {
  try {
    if (typeof template === 'string') {
      const html = ejs.render(template, templateData);
      return html;
    }
    /*
      TODO: if in the future the template is an object and
      it is necessary to identify the type of the template
    */
    return null;
  } catch (err) {
    logger.error(err);
    return null;
  }
};

export default parseTemplateToHtml;
