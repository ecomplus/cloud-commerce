import fs from 'fs';
import { resolve as resolvePath } from 'path';

export default () => {
  const { STOREFRONT_BASE_DIR } = process.env;
  let baseDir;
  if (STOREFRONT_BASE_DIR) {
    baseDir = resolvePath(process.cwd(), STOREFRONT_BASE_DIR);
  } else {
    baseDir = process.cwd();
  }
  process.env.STOREFRONT_BASE_DIR = baseDir;
  const dirContent = resolvePath(baseDir, 'content');

  const cms = (filename) => {
    if (filename.endsWith('/')) {
      const dirColl = resolvePath(dirContent, filename);
      return fs.readdirSync(dirColl).map((_filename) => _filename.replace('.json', ''));
    }
    const filepath = resolvePath(dirContent, `${filename}.json`);
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  };

  const settings = cms('settings');
  const { domain } = settings;
  const primaryColor = settings.primary_color || '#137c5c';
  const secondaryColor = settings.secondary_color || '#343a40';

  return {
    domain,
    primaryColor,
    secondaryColor,
    settings,
    cms,
  };
};
