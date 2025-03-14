import type { CmsCollOptions } from './get-configs-coll';

export const pageMetaFields = [
  {
    label: 'Meta title',
    name: 'metaTitle',
    widget: 'string',
    hint: {
      en: 'Title displayed in browser tab and search engine results, relevant for SEO',
      pt: 'Título exibido na aba do navegador e nos resultados de motores de busca, relevante para SEO',
    },
    required: false,
  },
  {
    label: 'Meta description',
    name: 'metaDescription',
    widget: 'text',
    hint: {
      en: 'Description displayed in search engine results, relevant for SEO',
      pt: 'Descrição exibida nos resultados de motores de busca, relevante para SEO',
    },
    required: false,
  },
];

const getPagesColl = ({
  baseDir,
  heroConfig,
  sectionsConfig,
}: CmsCollOptions) => ({
  name: 'pages',
  label: {
    en: 'Default pages',
    pt: 'Páginas padrão',
  },
  description: {
    en: 'Store main pages and catalog',
    pt: 'Páginas principais e catálogo da loja',
  },
  delete: false,
  editor: {
    preview: import.meta.env.DEV,
  },
  files: [
    {
      name: 'home',
      label: {
        en: 'Homepage',
        pt: 'Página inicial',
      },
      file: `${baseDir}content/pages/home.json`,
      fields: [
        heroConfig,
        sectionsConfig,
        ...pageMetaFields,
      ],
    },
    {
      name: 'products',
      label: {
        en: 'Product pages',
        pt: 'Páginas de produto',
      },
      file: `${baseDir}content/pages/products.json`,
      fields: [
        sectionsConfig,
        ...pageMetaFields,
      ],
    },
    {
      name: 'categories',
      label: {
        en: 'Category pages',
        pt: 'Páginas de categoria',
      },
      file: `${baseDir}content/pages/categories.json`,
      fields: [
        sectionsConfig,
        ...pageMetaFields,
      ],
    },
    {
      name: 'brands',
      label: {
        en: 'Brands pages',
        pt: 'Páginas de marca',
      },
      file: `${baseDir}content/pages/brands.json`,
      fields: [
        sectionsConfig,
        ...pageMetaFields,
      ],
    },
    {
      name: 'collections',
      label: {
        en: 'Collection pages',
        pt: 'Páginas de coleção',
      },
      file: `${baseDir}content/pages/collections.json`,
      fields: [
        sectionsConfig,
        ...pageMetaFields,
      ],
    },
    {
      name: 'search',
      label: {
        en: 'Search page',
        pt: 'Página de busca',
      },
      file: `${baseDir}content/pages/search.json`,
      preview_path: 's/',
      fields: [
        sectionsConfig,
        ...pageMetaFields,
      ],
    },
  ],
});

export default getPagesColl;
