import fs from 'node:fs';
import { join as joinPath, resolve as resolvePath } from 'node:path';
import { parse as parseYaml } from 'yaml';
import config from '@cloudcommerce/config';
import './storefront.cms.js';

export default () => {
  const {
    ECOM_STORE_ID,
    VITE_ECOM_STORE_ID,
    PROD,
  } = import.meta.env || process.env;
  if (VITE_ECOM_STORE_ID) {
    config.set({ storeId: Number(VITE_ECOM_STORE_ID) });
  } else if (ECOM_STORE_ID) {
    config.set({ storeId: Number(ECOM_STORE_ID) });
  }

  const parseFrontmatter = (_markdown) => {
    let markdown = '';
    for (let i = 0; i < _markdown.length; i++) {
      // Clear invalid UTF-8 chars
      const charCode = _markdown.charCodeAt(i);
      if (charCode >= 128 && charCode <= 159) continue;
      if (charCode >= 636) continue;
      markdown += _markdown.charAt(i);
    }
    let matter = {};
    if (markdown.substring(0, 4) === '---\n') {
      const [frontmatter, _md] = markdown.substring(4).split('\n---\n');
      markdown = _md;
      const _matter = parseYaml(frontmatter);
      if (typeof _matter === 'object' && _matter && !Array.isArray(_matter)) {
        matter = _matter;
      }
    }
    return { markdown, matter };
  };
  const {
    domain,
    primaryColor,
    secondaryColor,
    settings,
    getContent,
  } = global.__storefrontCMS(fs, resolvePath, parseFrontmatter);
  config.set({ settingsContent: settings });

  let { storeId } = config.get();
  if (!storeId) {
    const configFilepath = joinPath(process.cwd(), 'config.json');
    try {
      const mergeConfig = JSON.parse(fs.readFileSync(configFilepath), 'utf8');
      if (mergeConfig.storeId) {
        storeId = mergeConfig.storeId;
      }
    } catch {
      //
    }
    if (!storeId && !PROD) {
      storeId = 1011;
      console.warn('> `storeId` is not set, using fallback 1011 for dev only\n');
    }
    if (storeId) {
      config.set({ storeId });
    }
  }
  const {
    lang,
    countryCode,
    currency,
    currencySymbol,
  } = config.get();

  return {
    storeId,
    lang,
    countryCode,
    currency,
    currencySymbol,
    domain,
    primaryColor,
    secondaryColor,
    settings,
    getContent,
  };
};
