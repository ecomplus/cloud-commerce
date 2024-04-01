import Deepmerge from '@fastify/deepmerge';
import { i18n as _i18n } from '@ecomplus/utils';

export const getCmsConfig = () => {
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
  const maxFileSize = Math.max(CMS_MAX_FILE_SIZE || 0, 1000000);
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
      {
        name: 'config',
        label: {
          en: 'Settings',
          pt: 'Configurações',
        },
        description: {
          en: 'General settings for site identity and metadata',
          pt: 'Configurações gerais para identidade e metadados do site',
        },
        delete: false,
        editor: {
          preview: false,
        },
        files: [
          {
            name: 'settings',
            label: {
              en: 'General config',
              pt: 'Configurações gerais',
            },
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
                label: 'Repository',
                name: 'repository',
                widget: 'hidden',
              },
              {
                label: {
                  en: 'Domain name',
                  pt: 'Domínio',
                },
                name: 'domain',
                widget: 'string',
              },
              {
                label: {
                  en: 'Store name',
                  pt: 'Nome da loja',
                },
                name: 'name',
                widget: 'string',
              },
              {
                label: {
                  en: 'Short description',
                  pt: 'Descrição curta',
                },
                name: 'description',
                widget: 'text',
              },
              {
                label: {
                  en: 'Logo',
                  pt: 'Logomarca',
                },
                name: 'logo',
                widget: 'image',
                media_library: {
                  config: {
                    max_file_size: maxFileSize,
                  },
                },
              },
              {
                label: {
                  en: 'Icon',
                  pt: 'Ícone',
                },
                name: 'icon',
                widget: 'image',
                media_library: {
                  config: {
                    max_file_size: maxFileSize,
                  },
                },
              },
              {
                label: {
                  en: 'Primary color',
                  pt: 'Cor primária',
                },
                name: 'primaryColor',
                widget: 'color',
              },
              {
                label: {
                  en: 'Secondary color',
                  pt: 'Cor secundária',
                },
                name: 'secondaryColor',
                widget: 'color',
                required: false,
              },
              {
                label: {
                  en: 'Contact email',
                  pt: 'E-mail de contato',
                },
                name: 'email',
                widget: 'string',
                required: false,
              },
              {
                label: {
                  en: 'Service telephone',
                  pt: 'Telefone de atendimento',
                },
                name: 'phone',
                widget: 'string',
                required: false,
              },
              {
                label: {
                  en: 'Store address',
                  pt: 'Endereço da loja',
                },
                name: 'address',
                widget: 'string',
                required: false,
              },
              {
                label: {
                  en: 'Corporate name',
                  pt: 'Razão social da empresa',
                },
                name: 'corporateName',
                widget: 'string',
              },
              {
                label: {
                  en: 'Store document number',
                  pt: 'CNPJ',
                },
                name: 'docNumber',
                widget: 'string',
              },
              {
                label: {
                  en: 'Service links',
                  pt: 'Links de atendimento',
                },
                name: 'serviceLinks',
                widget: 'list',
                summary: '{{fields.title}}',
                fields: [
                  {
                    label: {
                      en: 'Title',
                      pt: 'Título',
                    },
                    name: 'title',
                    widget: 'string',
                  },
                  {
                    label: 'Link',
                    name: 'href',
                    widget: 'string',
                  },
                ],
              },
              {
                label: {
                  en: 'Payment methods',
                  pt: 'Formas de pagamento',
                },
                name: 'paymentMethods',
                widget: 'select',
                multiple: true,
                options: [
                  'pix',
                  'visa',
                  'mastercard',
                  'elo',
                  'amex',
                  'hipercard',
                  'boleto',
                  'diners',
                  'discover',
                ],
              },
              {
                label: 'WhatsApp',
                name: 'whatsapp',
                widget: 'string',
                required: false,
              },
              {
                label: 'Instagram',
                name: 'instagram',
                widget: 'string',
                required: false,
              },
              {
                label: 'Facebook',
                name: 'facebook',
                widget: 'string',
                required: false,
              },
              {
                label: 'X / Twitter',
                name: 'twitter',
                widget: 'string',
                required: false,
              },
              {
                label: 'YouTube',
                name: 'youtube',
                widget: 'string',
                required: false,
              },
              {
                label: 'TikTok',
                name: 'tiktok',
                widget: 'string',
                required: false,
              },
              {
                label: 'Pinterest',
                name: 'pinterest',
                widget: 'string',
                required: false,
              },
              {
                label: 'Threads',
                name: 'threads',
                widget: 'string',
                required: false,
              },
              {
                label: {
                  en: 'Default locale',
                  pt: 'Língua padrão',
                },
                name: 'lang',
                widget: 'select',
                options: [
                  {
                    label: 'Português',
                    value: 'pt_br',
                  },
                  {
                    label: 'Inglês',
                    value: 'en_us',
                  },
                ],
                default: 'pt_br',
              },
              {
                label: {
                  en: 'Currency code',
                  pt: 'Código da moeda',
                },
                name: 'currency',
                widget: 'hidden',
                default: 'BRL',
              },
              {
                label: {
                  en: 'Currency symbol',
                  pt: 'Símbolo da moeda',
                },
                name: 'currencySymbol',
                widget: 'hidden',
                default: 'R$',
              },
              {
                label: {
                  en: 'Country code',
                  pt: 'Código do país',
                },
                name: 'countryCode',
                widget: 'hidden',
                default: 'BR',
              },
              {
                name: 'modules',
                widget: 'hidden',
              },
              {
                name: 'cartUrl',
                widget: 'hidden',
              },
              {
                name: 'checkoutUrl',
                widget: 'hidden',
              },
              {
                name: 'accountUrl',
                widget: 'hidden',
              },
              {
                name: 'ordersUrl',
                widget: 'hidden',
              },
              {
                name: 'favoritesUrl',
                widget: 'hidden',
              },
              {
                name: 'metafields',
                widget: 'hidden',
              },
            ],
          },
        ],
      },
    ]),
  };
  return config;
};

export default getCmsConfig;
