import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { resolve as resolvePath } from 'path';
import config from '@cloudcommerce/config';

const {
  STOREFRONT_BASE_DIR,
  VITE_ECOM_STORE_ID,
  // @ts-ignore
}: Record<string, string | undefined> = import.meta.env;

let baseDir: string;
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

const settings: typeof import('../../../store/functions/ssr/content/settings.json') = JSON.parse(
  readFileSync(resolvePath(dirContent, 'settings.json'), 'utf8'),
);
const primaryColor = settings.primary_color || '#20c997';
const secondaryColor = settings.secondary_color || '#343a40';

export default () => {
  const { storeId, lang } = config.get();
  return {
    settings,
    lang,
    storeId,
    primaryColor,
    secondaryColor,
  };
};
