global.__storefrontCMS = (fs, resolvePath) => {
  const { STOREFRONT_BASE_DIR } = process.env;
  let baseDir;
  if (STOREFRONT_BASE_DIR) {
    baseDir = resolvePath(process.cwd(), STOREFRONT_BASE_DIR);
  } else {
    baseDir = process.cwd();
  }
  process.env.STOREFRONT_BASE_DIR = baseDir;
  const dirContent = resolvePath(baseDir, 'content');

  const contentCache = {};
  const getContent = (filename) => {
    // MUST be sync for 'settings'
    // Async with other content to support external CMS integration
    const loadLocal = () => {
      let content = contentCache[filename];
      if (!content) {
        if (filename.endsWith('/')) {
          const dirColl = resolvePath(dirContent, filename);
          return new Promise((resolve) => {
            const slugs = fs.existsSync(dirColl)
              ? fs.readdirSync(dirColl).map((file) => file.replace('.json', ''))
              : [];
            resolve(slugs);
          });
        }
        // @TODO: Also parse Markdown with front matter
        const filepath = resolvePath(dirContent, `${filename}.json`);
        content = fs.existsSync(filepath)
          ? JSON.parse(fs.readFileSync(filepath, 'utf8'))
          : null;
        if (!filename.includes('/')) {
          // Caching root content only (not collections)
          contentCache[filename] = content;
        }
      }
      return filename === 'settings'
        ? content
        : new Promise((resolve) => { resolve(content); });
    };
    const handler = globalThis.$storefrontCmsHandler;
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
    settings = getContent('settings');
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
    getContent,
  };
};
