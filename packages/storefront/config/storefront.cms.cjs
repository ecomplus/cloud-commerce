const fs = require('fs');
const { resolve: resolvePath } = require('path');

module.exports = () => {
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
    // MUST be sync for 'settings'
    // Async with other content to support external CMS integration
    const loadLocal = () => {
      if (filename.endsWith('/')) {
        const dirColl = resolvePath(dirContent, filename);
        return new Promise((resolve) => {
          resolve(fs.readdirSync(dirColl).map((file) => file.replace('.json', '')));
        });
      }
      const filepath = resolvePath(dirContent, `${filename}.json`);
      const content = fs.existsSync(filepath)
        ? JSON.parse(fs.readFileSync(filepath, 'utf8'))
        : null;
      return filename === 'settings'
        ? content
        : new Promise((resolve) => { resolve(content); });
    };
    const handler = globalThis.storefront_cms_handler;
    if (typeof handler === 'function') {
      try {
        const content = handler({ dirContent, filename, loadLocal });
        if (content) {
          return content;
        }
      } catch {
        //
      }
    }
    return loadLocal();
  };

  let settings;
  try {
    settings = cms('settings');
  } catch (e) {
    settings = {};
  }
  const { domain } = settings;
  const primaryColor = settings.primary_color || '#137c5c';
  const secondaryColor = settings.secondary_color || primaryColor;

  return {
    domain,
    primaryColor,
    secondaryColor,
    settings,
    cms,
  };
};
