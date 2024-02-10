export const getCmsConfig = () => {
  const baseDir = window.CMS_REPO_BASE_DIR || 'functions/ssr/';
  const config: Record<string, any> = {
    load_config_file: false,
    media_folder: `${baseDir}template/public/img/uploads`,
    public_folder: '/img/uploads',
    slug: {
      encoding: 'ascii',
      clean_accents: true,
      sanitize_replacement: '-',
    },
    collections: [
      {
        name: 'settings',
        label: 'Configurações',
        description: 'Configurações gerais para identidade e metadados do site',
        delete: false,
        editor: {
          preview: false,
        },
        files: [
          {
            name: 'general',
            label: 'Configurações gerais',
            file: `${baseDir}content/settings.json`,
            editor: {
              preview: true,
            },
            fields: [
              {
                label: 'e-com.plus Store ID',
                name: 'storeId',
                widget: 'hidden',
              },
              {
                label: 'Repositório',
                name: 'repository',
                widget: 'hidden',
              },
              {
                label: 'Domínio',
                name: 'domain',
                widget: 'string',
              },
              {
                label: 'Nome da loja',
                name: 'name',
                widget: 'string',
              },
            ],
          },
        ],
      },
    ],
  };
  return config;
};

export default getCmsConfig;
