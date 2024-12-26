import type { CmsField, CmsFields, CmsConfigExtend } from './cms-fields';
import type { ParsedCmsField } from './collections/get-configs-coll';
import Deepmerge from '@fastify/deepmerge';
import { i18n as _i18n } from '@ecomplus/utils';
import afetch from '../helpers/afetch';
import getConfigsColl from './collections/get-configs-coll';
import getPagesColl from './collections/get-pages-coll';
import getExtraPagesColl from './collections/get-extra-pages-coll';
import getBlogColl from './collections/get-blog-coll';

export const getCmsConfig = async () => {
  const {
    GCLOUD_PROJECT,
    CMS_REPO_BASE_DIR,
    CMS_LANG,
    CMS_MAX_FILE_SIZE,
    CMS,
  } = window;
  if (!CMS) throw Error('Missing global CMS');
  const { domain } = window.$storefront?.settings || {};
  const baseDir = CMS_REPO_BASE_DIR || 'functions/ssr/';
  const locale = CMS_LANG || 'pt';
  const i18n = <T>(d: T) => _i18n(d as any, locale) as T;
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
  const response = await afetch('/admin/config.json');
  const { components, mergeConfig } = await response.json() as CmsConfigExtend;
  const parseNestedCmsFields = (cmsFields: CmsFields) => {
    return Object.keys(cmsFields).map((name) => {
      delete cmsFields[name]._dropped;
      delete cmsFields[name]._nullable;
      if (!cmsFields[name].label) {
        cmsFields[name].widget = 'hidden';
      }
      const nestedFields = cmsFields[name].fields;
      return {
        required: false,
        ...cmsFields[name],
        name,
        fields: nestedFields ? parseNestedCmsFields(nestedFields) : undefined,
      };
    }) as Exclude<ParsedCmsField['fields'], undefined>;
  };
  const heroConfig = {
    name: 'hero',
    label: 'Hero slider',
    ...(components.hero as any),
    widget: 'object' as const,
    fields: components.hero.fields
      && parseNestedCmsFields(components.hero.fields),
  };
  const sectionsConfig = {
    name: 'sections',
    label: {
      en: 'Sections',
      pt: 'Seções',
    },
    label_singular: {
      en: 'Section',
      pt: 'Seção',
    },
    widget: 'list' as const,
    types: Object.keys(components.sections).map((name) => ({
      name,
      ...components.sections,
      widget: 'object' as const,
      fields: components.sections[name].fields
        && parseNestedCmsFields(components.sections[name].fields),
    })),
  };
  const collOptions = {
    domain,
    baseDir,
    locale,
    heroConfig,
    sectionsConfig,
  };
  let config = {
    locale,
    load_config_file: false,
    media_folder: `${baseDir}public/img/uploads`,
    public_folder: '/img/uploads',
    site_url: GCLOUD_PROJECT
      ? `https://${GCLOUD_PROJECT}.web.app/~preview/`
      : `https://${domain}/~preview/`,
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
      getPagesColl(collOptions),
      getExtraPagesColl(collOptions),
      getBlogColl(collOptions),
    ]),
  };
  if (mergeConfig) {
    if (Array.isArray(mergeConfig.collections)) {
      /* eslint-disable  no-use-before-define */
      const mergeNestedConfig = (originalColl: any, mergeColl: any) => {
        if (Array.isArray(originalColl.files)) {
          if (Array.isArray(mergeColl.files)) {
            upsertFields(originalColl, mergeColl, 'files');
          }
        } else if (Array.isArray(mergeColl.fields)) {
          upsertFields(originalColl, mergeColl, 'fields');
        } else if (Array.isArray(mergeColl.types)) {
          upsertFields(originalColl, mergeColl, 'types');
        }
        Object.assign(originalColl, mergeColl);
      };
      const upsertFields = (_config: any, _mergeConfig: any, key: string) => {
        _mergeConfig[key].forEach((mergeColl: any) => {
          if (mergeColl.name) {
            const originalColl = _config[key].find(({ name }) => {
              return name === mergeColl.name;
            });
            if (originalColl) {
              mergeNestedConfig(originalColl, mergeColl);
            } else {
              _config[key].push(mergeColl);
            }
          } else {
            _config[key].forEach((_originalColl: any) => {
              mergeNestedConfig(_originalColl, mergeColl);
            });
          }
        });
        delete _mergeConfig[key];
      };
      upsertFields(config, mergeConfig, 'collections');
    }
    delete mergeConfig.collections;
    config = deepmerge(config, mergeConfig) as any;
  }
  const maxFileSize = Math.max(CMS_MAX_FILE_SIZE || 0, 1000000);
  const setWidgetDefaults = (fields?: Array<Record<string, any> &
    { widget: CmsField['widget'] }
  >) => {
    fields?.forEach((field) => {
      if (field.types) {
        // Sections
        setWidgetDefaults(field.types);
        return;
      }
      setWidgetDefaults(field.fields);
      if (field.widget === 'image') {
        const mediaLibrary = {
          config: { max_file_size: maxFileSize },
        };
        if (field.media_library) {
          field.media_library = deepmerge(mediaLibrary, field.media_library);
        } else {
          field.media_library = mediaLibrary;
        }
        return;
      }
      if (field.widget === 'code') {
        Object.assign(field, {
          default_language: 'html',
          allow_language_selection: false,
          output_code_only: true,
          ...field,
        });
        return;
      }
      if (field.widget === 'markdown') {
        Object.assign(field, {
          buttons: [
            'bold', 'italic', 'link', 'code',
            'heading-three', 'heading-four', 'heading-five',
            'quote', 'bulleted-list', 'numbered-list',
          ],
          editor_components: ['image'],
          modes: ['rich_text'],
          ...field,
        });
        return;
      }
      if (field.widget === 'object' || field.widget === 'list') {
        if (field.collapsed === undefined) field.collapsed = true;
      }
      if (field.widget === 'list') {
        if (!field.summary && field.minimize_collapsed === undefined) {
          field.minimize_collapsed = true;
        }
      }
    });
  };
  config.collections.forEach((collection: Record<string, any>) => {
    collection.files?.forEach((cmsColl: any) => {
      setWidgetDefaults(cmsColl.fields);
    });
    setWidgetDefaults(collection.fields);
  });
  return config;
};

export default getCmsConfig;
