import type { CmsCollOptions } from './get-configs-coll';

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
      label: 'Meta title',
      name: 'meta_title',
      widget: 'string',
      hint: {
        en: 'Title displayed in browser tab and search engine results, relevant for SEO',
        pt: 'Título exibido na aba do navegador e nos resultados de motores de busca, relevante para SEO',
      },
      required: false,
    },
    {
      label: 'Meta description',
      name: 'meta_description',
      widget: 'text',
      hint: {
        en: 'Description displayed in search engine results, relevant for SEO',
        pt: 'Descrição exibida nos resultados de motores de busca, relevante para SEO',
      },
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
  ],
});

export default getExtraPagesColl;
