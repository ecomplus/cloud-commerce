import type { CmsField, CmsFields, CmsConfigExtend } from './cms-fields';
import type { ParsedCmsField, CmsCollOptions } from './collections/get-configs-coll';
import Deepmerge from '@fastify/deepmerge';
import { i18n as _i18n } from '@ecomplus/utils';
import afetch from '../helpers/afetch';
import getConfigsColl from './collections/get-configs-coll';
import getPagesColl from './collections/get-pages-coll';
import getExtraPagesColl from './collections/get-extra-pages-coll';
import getBlogColl from './collections/get-blog-coll';
import getAbExperimentsColl from './collections/get-ab-experiments-coll';

export const getCmsConfig = async (_collOptions: Partial<CmsCollOptions>) => {
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
  const {
    components,
    settingsMetafields,
    headerCustom,
    footerCustom,
    mergeConfig,
  } = await response.json() as CmsConfigExtend;
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
      ...components.sections[name],
      widget: 'object' as const,
      fields: components.sections[name].fields
        && parseNestedCmsFields(components.sections[name].fields),
    })),
  };
  const collOptions = {
    ..._collOptions,
    domain,
    baseDir,
    locale,
    heroConfig,
    sectionsConfig,
  };
  const parseCustomFields = (customFields?: CmsFields) => {
    return customFields && Object.keys(customFields).length
      ? parseNestedCmsFields(customFields)
      : undefined;
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
    collections: [
      getConfigsColl(collOptions, {
        settingsMetafields: parseCustomFields(settingsMetafields),
        headerCustom: parseCustomFields(headerCustom),
        footerCustom: parseCustomFields(footerCustom),
      }),
      getPagesColl(collOptions),
      getExtraPagesColl(collOptions),
      getBlogColl(collOptions),
      getAbExperimentsColl(collOptions),
    ],
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
  const { storeData } = collOptions;
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
      if (field.widget.startsWith('select:')) {
        if (storeData) {
          const [, resource, fieldToValue] = field.widget.split(':');
          if (resource === 'shelf-catalog') {
            field.options = ([{
              resource: 'collections',
              label: '',
            }, {
              resource: 'categories',
              label: i18n({ pt: 'Categoria: ', en: 'Category: ' }),
            }, {
              resource: 'brands',
              label: i18n({ pt: 'Marca: ', en: 'Brand: ' }),
            }] as const).reduce((options, shelf) => {
              storeData[shelf.resource]?.forEach((doc) => {
                if (doc.slug) {
                  options.push({
                    label: shelf.label + (doc.name || doc.slug),
                    value: `${doc._id}:${shelf.resource}:${doc.name}:/${doc.slug}`,
                  });
                }
              });
              return options;
            }, [] as Array<{ label: string, value: string }>);
          } else {
            const list = storeData[resource as 'categories'];
            if (list) {
              field.options = [];
              list.forEach((doc) => {
                let value: string | Record<string, string> | undefined;
                if (fieldToValue === '{}') {
                  if (doc.name && doc.slug) {
                    value = { name: doc.name, slug: doc.slug };
                  }
                } else {
                  value = fieldToValue ? doc[fieldToValue] : doc.slug;
                }
                if (value) {
                  field.options.push({ value, label: doc.name || value });
                }
              });
            }
          }
          field.widget = 'select';
        }
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
      if (!cmsColl.file?.startsWith(baseDir)) {
        cmsColl.file = baseDir + cmsColl.file;
      }
      if (cmsColl.fields && !Array.isArray(cmsColl.fields)) {
        cmsColl.fields = parseNestedCmsFields(cmsColl.fields);
      }
      setWidgetDefaults(cmsColl.fields);
    });
    if (collection.folder && !collection.folder.startsWith(baseDir)) {
      collection.folder = baseDir + collection.folder;
    }
    if (collection.fields && !Array.isArray(collection.fields)) {
      collection.fields = parseNestedCmsFields(collection.fields);
    }
    setWidgetDefaults(collection.fields);
  });
  config.collections = i18n(config.collections);
  return config;
};

export default getCmsConfig;
