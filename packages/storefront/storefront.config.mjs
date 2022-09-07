import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { resolve as resolvePath } from 'path';
import config from '@cloudcommerce/config';

export default () => {
  const {
    STOREFRONT_BASE_DIR,
    VITE_ECOM_STORE_ID,
  } = import.meta.env || process.env;

  const { storeId, lang } = config.get();

  let baseDir;
  if (STOREFRONT_BASE_DIR) {
    const currentDir = fileURLToPath(new URL('.', import.meta.url));
    baseDir = resolvePath(currentDir, STOREFRONT_BASE_DIR);
  } else {
    baseDir = process.cwd();
  }
  const dirContent = resolvePath(baseDir, 'content');
  if (VITE_ECOM_STORE_ID) {
    config.set({ storeId: Number(VITE_ECOM_STORE_ID) });
  }

  const settings = JSON.parse(
    readFileSync(resolvePath(dirContent, 'settings.json'), 'utf8'),
  );
  const { domain } = settings;
  const primaryColor = settings.primary_color || '#20c997';
  const secondaryColor = settings.secondary_color || '#343a40';

  return {
    storeId,
    lang,
    domain,
    primaryColor,
    secondaryColor,
    settings,
  };
};
