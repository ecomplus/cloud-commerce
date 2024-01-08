/**
 * Hydrate on context script executed (`$storefront.apiContext` ready)
 * Check event emits at BaseHead.astro and use-shared-data.ts
 * @type {import('astro').ClientDirective}
 */
export default (load, opts) => {
  const hy = async () => {
    const hydrate = await load();
    await hydrate();
  };
  const next = () => {
    const arrOpts = Array.isArray(opts.value) ? opts.value : [opts.value];
    for (let i = 0; i < arrOpts.length; i++) {
      if (typeof arrOpts[i] === 'string' && arrOpts[i].startsWith('data:')) {
        const field = arrOpts[i].substring(5);
        if (!window.$storefront?.data?.[field]) {
          window.addEventListener(
            `storefront:data:${field}`,
            next,
            { once: true },
          );
          return;
        }
      }
    }
    if (arrOpts.includes('idle')) {
      if (typeof window.requestIdleCallback === 'function') {
        setTimeout(() => window.requestIdleCallback(hy), 9);
        return;
      }
      setTimeout(hy, 200);
      return;
    }
    hy();
  };
  const id = window.$storefront?.apiContext?.doc._id || null;
  if (window._firstLoadContextId === id && window._emitedContextId === id) {
    console.log('[ctx] first load');
    next();
    document.addEventListener('astro:beforeload', () => {
      delete window._firstLoadContextId;
    }, { once: true });
    return;
  }
  window.addEventListener('storefront:apiContext', next, { once: true });
};
