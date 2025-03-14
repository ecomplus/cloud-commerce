import type { CmsCollOptions } from './get-configs-coll';
import { pageMetaFields } from './get-pages-coll';

const getBlogColl = ({
  baseDir,
  heroConfig,
  sectionsConfig,
}: CmsCollOptions) => {
  return {
    name: 'blog',
    label: {
      en: 'Blog posts',
      pt: 'Posts do blog',
    },
    description: {
      en: 'Posts for blog included in the store',
      pt: 'Posts para o blog incluso na loja',
    },
    folder: `${baseDir}content/blog`,
    preview_path: 'posts/{{slug}}',
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
        name: 'thumbnail',
        widget: 'image',
        label: 'Thumbnail',
        required: false,
      },
      {
        name: 'description',
        widget: 'text',
        label: {
          en: 'Short description',
          pt: 'Descrição curta',
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
      {
        name: 'author',
        widget: 'string',
        label: {
          en: 'Author',
          pt: 'Autor',
        },
        required: false,
      },
      {
        name: 'date',
        widget: 'datetime',
        label: {
          en: 'Publication date',
          pt: 'Data de publicação',
        },
        required: false,
        default: '{{now}}',
      },
      ...pageMetaFields,
    ],
  };
};

export default getBlogColl;
