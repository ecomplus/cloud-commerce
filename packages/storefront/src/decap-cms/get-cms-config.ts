import Deepmerge from '@fastify/deepmerge';
import { i18n as _i18n } from '@ecomplus/utils';
import getConfigsColl from './collections/get-configs-coll';

export const getCmsConfig = async () => {
  const {
    CMS_REPO_BASE_DIR,
    CMS_LANG,
    CMS_MAX_FILE_SIZE,
    CMS,
  } = window;
  if (!CMS) throw Error('Missing global CMS');
  const { domain } = window.$storefront?.settings || {};
  const baseDir = CMS_REPO_BASE_DIR || 'functions/ssr/';
  const locale = CMS_LANG || 'pt';
  const i18n = (d: any) => _i18n(d, locale);
  const deepmerge = Deepmerge();
  CMS.registerLocale(locale, deepmerge(CMS.getLocale(locale), {
    editor: {
      editorWidgets: {
        image: {
          chooseDifferent: i18n({ en: 'Change image', pt: 'Mudar imagem' }),
          remove: i18n({ en: 'Remove', pt: 'Remover' }),
        },
      },
    },
  }));
  const collOptions = {
    domain,
    baseDir,
    locale,
    maxFileSize: Math.max(CMS_MAX_FILE_SIZE || 0, 1000000),
    markdownOptions: {
      buttons: [
        'bold', 'italic', 'link',
        'heading-three', 'heading-four', 'heading-five',
        'quote', 'bulleted-list', 'numbered-list',
      ],
      editor_components: ['image'],
      modes: ['rich_text'],
    },
  };
  const config: Record<string, any> = {
    locale,
    load_config_file: false,
    publish_mode: 'editorial_workflow',
    media_folder: `${baseDir}public/img/uploads`,
    public_folder: '/img/uploads',
    site_url: `https://${domain}/~preview`,
    display_url: `https://${domain}`,
    logo_url: 'https://ecom.nyc3.digitaloceanspaces.com/storefront/cms.png',
    show_preview_links: true,
    search: false,
    slug: {
      encoding: 'ascii',
      clean_accents: true,
      sanitize_replacement: '-',
    },
    collections: i18n([
      getConfigsColl(collOptions),
    ]),
  };
  return config;
};

export default getCmsConfig;
