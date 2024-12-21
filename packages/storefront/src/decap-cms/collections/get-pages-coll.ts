import type { CmsCollOptions } from './get-configs-coll';

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
      ],
    },
    {
      name: 'search',
      label: {
        en: 'Search page',
        pt: 'Página de busca',
      },
      file: `${baseDir}content/pages/search.json`,
      fields: [
        sectionsConfig,
      ],
    },
  ],
});

export default getPagesColl;
