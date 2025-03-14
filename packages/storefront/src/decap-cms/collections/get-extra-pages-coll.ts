import type { CmsCollOptions } from './get-configs-coll';
import { pageMetaFields } from './get-pages-coll';

const getExtraPagesColl = ({
  baseDir,
  heroConfig,
  sectionsConfig,
}: CmsCollOptions) => ({
  name: 'extra-pages',
  label: {
    en: 'Extra pages',
    pt: 'Páginas extra',
  },
  description: {
    en: 'Institutional pages, rules and website information',
    pt: 'Páginas institucionais, regras e informações do site',
  },
  folder: `${baseDir}content/extra-pages`,
  preview_path: 'p/{{slug}}',
  create: true,
  extension: 'md',
  format: 'frontmatter',
  editor: {
    preview: import.meta.env.DEV,
  },
  fields: [
    {
      name: 'title',
      label: {
        en: 'Title',
        pt: 'Título',
      },
      widget: 'string',
    },
    {
      label: {
        en: 'Body',
        pt: 'Corpo',
      },
      name: 'body',
      widget: 'markdown',
      required: false,
    },
    {
      ...heroConfig,
      required: false,
    },
    {
      ...sectionsConfig,
      required: false,
    },
    ...pageMetaFields,
  ],
});

export default getExtraPagesColl;
