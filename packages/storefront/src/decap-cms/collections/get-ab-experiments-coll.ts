import type { CmsCollOptions } from './get-configs-coll';

const getBlogColl = ({ baseDir }: CmsCollOptions) => {
  return {
    name: 'ab-experiments',
    label: {
      en: 'A/B experiments',
      pt: 'Experimentos A/B',
    },
    description: {
      en: 'A/B experiments default to "A" or "B" IDs enabled with 50% probability each. Additional IDs can be configured in Firebase Remote Config.',
      pt: 'Experimentos A/B, por padrão com IDs "A" ou "B" habilitados com 50% de probabilidade cada um. IDs adicionais podem ser configurados no Firebase Remote Config.',
    },
    folder: `${baseDir}content/ab-experiments`,
    create: true,
    slug: '{{experimentId}}',
    extension: 'json',
    editor: {
      preview: false,
    },
    fields: [
      {
        name: 'experimentId',
        label: {
          en: 'Experiment ID',
          pt: 'ID do experimento',
        },
        widget: 'string',
        default: 'A',
      },
      {
        name: 'colors',
        label: {
          en: 'Color fields',
          pt: 'Campos de cor',
        },
        widget: 'list',
        collapsed: false,
        summary: '{{fields.name}}',
        fields: [
          {
            name: 'name',
            label: {
              en: 'Name',
              pt: 'Nome',
            },
            widget: 'string',
          },
          {
            name: 'value',
            label: {
              en: 'Value',
              pt: 'Valor',
            },
            widget: 'color',
            required: false,
          },
        ],
      },
      {
        name: 'strings',
        label: {
          en: 'String fields',
          pt: 'Campos de string',
        },
        widget: 'list',
        collapsed: false,
        summary: '{{fields.name}}',
        fields: [
          {
            name: 'name',
            label: {
              en: 'Name',
              pt: 'Nome',
            },
            widget: 'string',
          },
          {
            name: 'value',
            label: {
              en: 'Value',
              pt: 'Valor',
            },
            widget: 'string',
            required: false,
          },
        ],
      },
      {
        name: 'booleans',
        label: {
          en: 'Boolean fields',
          pt: 'Campos booleanos',
        },
        widget: 'list',
        collapsed: false,
        summary: '{{fields.name}}',
        fields: [
          {
            name: 'name',
            label: {
              en: 'Name',
              pt: 'Nome',
            },
            widget: 'string',
          },
          {
            name: 'value',
            label: {
              en: 'Value',
              pt: 'Valor',
            },
            widget: 'boolean',
            required: false,
          },
        ],
      },
      {
        name: 'numbers',
        label: {
          en: 'Number fields',
          pt: 'Campos numéricos',
        },
        widget: 'list',
        collapsed: false,
        summary: '{{fields.name}}',
        fields: [
          {
            name: 'name',
            label: {
              en: 'Name',
              pt: 'Nome',
            },
            widget: 'string',
          },
          {
            name: 'value',
            label: {
              en: 'Value',
              pt: 'Valor',
            },
            widget: 'number',
            value_type: 'int',
            required: false,
          },
        ],
      },
    ],
  };
};

export default getBlogColl;
