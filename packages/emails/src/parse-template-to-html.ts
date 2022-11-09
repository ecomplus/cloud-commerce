import type { TemplateData, Template } from '../types/index';
import ejs from 'ejs';

const parseTemplateToHtml = (
  templateData: TemplateData,
  template: Template,
) => {
  if (typeof template === 'string') {
    const html = ejs.render(template, templateData);
    return html;
  }
  /*
      TODO: if in the future the template is an object and
      it is necessary to identify the type of the template
    */
  throw new Error('Template type is not a string');
};

export default parseTemplateToHtml;
