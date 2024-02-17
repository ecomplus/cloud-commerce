global.__storefrontCMS = (fs, resolvePath, _parseMatter) => {
  const { STOREFRONT_BASE_DIR } = process.env;
  let baseDir;
  if (STOREFRONT_BASE_DIR) {
    baseDir = resolvePath(process.cwd(), STOREFRONT_BASE_DIR);
  } else {
    baseDir = process.cwd();
  }
  process.env.STOREFRONT_BASE_DIR = baseDir;
  const contentDir = resolvePath(baseDir, 'content');
  const resolveContent = (filename) => resolvePath(contentDir, filename);

  const contentCache = {};
  const getContent = (filename) => {
    // MUST be sync for 'settings'
    // Async with other content to support external CMS integration
    const loadLocal = () => {
      let content = contentCache[filename];
      if (!content) {
        if (filename.endsWith('/')) {
          const dirColl = resolveContent(filename);
          return new Promise((resolve) => {
            const slugs = fs.existsSync(dirColl)
              ? fs.readdirSync(dirColl)
                .filter((file) => file.charAt(0) !== '.')
                .map((file) => file.replace(/\.[^.]{0,5}$/, ''))
              : [];
            resolve(slugs);
          });
        }
        const jsonFilepath = resolveContent(`${filename}.json`);
        if (fs.existsSync(jsonFilepath)) {
          content = JSON.parse(fs.readFileSync(jsonFilepath, 'utf8'));
        } else if (_parseMatter && fs.existsSync(resolveContent(`${filename}.md`))) {
          const rawMd = fs.readFileSync(resolveContent(`${filename}.md`), 'utf8');
          const { markdown, matter } = _parseMatter(rawMd);
          content = { ...matter, markdown };
        } else {
          content = null;
        }
        if (!filename.includes('/')) {
          // Caching root content only (not collections)
          contentCache[filename] = content;
        }
      }
      if (typeof content.then === 'function') return content;
      return filename === 'settings'
        ? content
        : new Promise((resolve) => { resolve(content); });
    };
    const handler = globalThis.$storefrontCmsHandler;
    if (typeof handler === 'function') {
      try {
        const content = handler({ contentDir, filename, loadLocal });
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
    settings = getContent('settings') || {};
  } catch (e) {
    settings = {};
  }
  const { domain } = settings;
  const primaryColor = settings.primaryColor || '#137c5c';
  const secondaryColor = settings.secondaryColor || primaryColor;

  return {
    domain,
    primaryColor,
    secondaryColor,
    settings,
    getContent,
  };
};
