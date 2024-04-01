process.env.STOREFRONT_BASE_DIR = './packages/storefront';

// eslint-disable-next-line import/first, import/no-relative-packages
import { genTailwindConfig } from './packages/storefront/config/storefront.tailwind.mjs';

export default genTailwindConfig();
