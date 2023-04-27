import { defineConfig } from 'tinacms';

const {
  GIT_BRANCH,
  TINA_CLIENT_ID,
  TINA_TOKEN,
} = process.env;

/* eslint-disable consistent-return */

export default defineConfig({
  clientId: TINA_CLIENT_ID || null, // Get this from tina.io
  token: TINA_TOKEN || null, // Get this from tina.io
  branch: GIT_BRANCH || 'main',
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'img/uploads',
      publicFolder: 'public',
    },
  },
  schema: {
    collections: [
      {
        label: 'Layout',
        name: 'layout',
        path: 'src/content',
        match: {
          include: 'layout',
        },
        format: 'json',
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        fields: [
          {
            label: 'Cabeçalho',
            name: 'header',
            type: 'object',
            fields: [
              {
                label: 'Pitch bar',
                name: 'pitch_bar',
                type: 'object',
                list: true,
                fields: [
                  {
                    label: 'Link',
                    name: 'href',
                    type: 'string',
                    ui: {
                      validate: (val: string) => {
                        if (val && !val.startsWith('/') && !/^https?:\/\//.test(val)) {
                          return 'Preencha com um URL válido, '
                            + 'links para páginas da loja devem começar com /';
                        }
                      },
                    },
                  },
                  {
                    label: 'Conteúdo',
                    name: 'html',
                    type: 'rich-text',
                  },
                ],
                ui: {
                  itemProps: (item) => {
                    return {
                      label: item?.href
                        ? `Slide ${item?.href}`
                        : 'Slide sem link',
                    };
                  },
                },
              },
            ],
          },
        ],
      },
      {
        name: 'post',
        label: 'Posts',
        path: 'src/content/posts',
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Title',
            isTitle: true,
            required: true,
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body',
            isBody: true,
          },
        ],
        ui: {
          router: (/* { document } */) => {
            // navigate to the post that was clicked
            return '/~preview/';
          },
        },
      },
    ],
  },
});
