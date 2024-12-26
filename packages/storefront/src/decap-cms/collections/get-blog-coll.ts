import type { CmsCollOptions } from './get-configs-coll';
import getExtraPagesColl from './get-extra-pages-coll';

const getBlogColl = (collOptions: CmsCollOptions) => {
  const { baseDir } = collOptions;
  const { fields: extraPageFields } = getExtraPagesColl(collOptions);
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
      ...extraPageFields,
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
          en: 'Description',
          pt: 'Descrição',
        },
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
    ],
  };
};

export default getBlogColl;
