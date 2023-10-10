/**
 * Hydrate on context script executed (`$storefront.apiContext` ready)
 * Check event emits at BaseHead.astro
 * @type {import('astro').ClientDirective}
 */
export default (load) => {
  const hy = async () => {
    const hydrate = await load();
    await hydrate();
  };
  const id = window.$storefront?.apiContext?.doc._id || null;
  if (window._firstLoadContextId === id && window._emitedContextId === id) {
    console.log('[ctx] first load');
    hy();
    setTimeout(() => {
      delete window._firstLoadContextId;
    }, 49);
    return;
  }
  window.addEventListener('storefront:apiContext', hy, { once: true });
};
