/**
 * Hydrate on context script executed (`$storefront.apiContext` ready)
 * Check event emits at BaseHead.astro
 * @type {import('astro').ClientDirective}
 */
export default (load, opts) => {
  const hy = async () => {
    const hydrate = await load();
    await hydrate();
  };
  const next = () => {
    if (opts.value === 'idle') {
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
    setTimeout(() => {
      delete window._firstLoadContextId;
    }, 49);
    return;
  }
  window.addEventListener('storefront:apiContext', next, { once: true });
};
