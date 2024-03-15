/* eslint-disable no-restricted-syntax */
const waitIntersection = (el) => new Promise((resolve) => {
  const ioOptions = { /* rootMargin: 0 */ };
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      io.disconnect();
      resolve();
      break;
    }
  }, ioOptions);
  for (const child of el.children) {
    io.observe(child);
  }
});

const firstInteraction = new Promise((resolve) => {
  const controller = new AbortController();
  [
    'keydown',
    'mousemove',
    'pointerdown',
    'touchstart',
    'scroll',
  ].forEach((evName) => {
    document.addEventListener(
      evName,
      () => {
        resolve();
        controller.abort();
        window.dispatchEvent(new Event('firstInteraction'));
      },
      { once: true, passive: true, signal: controller.signal },
    );
  });
});
window.$firstInteraction = firstInteraction;

/**
 * Hydrate on context script executed (`$storefront.apiContext` ready)
 * Check event emits at BaseHead.astro and use-shared-data.ts
 * @type {import('astro').ClientDirective}
 */
export default (load, opts, el) => {
  const arrOpts = (Array.isArray(opts.value) ? opts.value : [opts.value])
    .reduce((arr, opt) => {
      if (typeof opt === 'string') {
        opt.split(',').forEach((hs) => {
          arr.push(hs);
        });
      }
      return arr;
    }, []);
  const isLazy = !arrOpts.length || arrOpts.includes('lazy');
  const isEager = !isLazy && arrOpts.includes('eager');
  const hy = async () => {
    if (arrOpts.includes('interaction')) await firstInteraction;
    const hydrate = await load();
    await hydrate();
  };
  const next = async () => {
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
    if (isLazy) await waitIntersection(el);
    if (isLazy || arrOpts.includes('idle')) {
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(hy);
        return;
      }
      setTimeout(hy, 100);
      return;
    }
    hy();
  };
  if (isEager) {
    next();
    return;
  }
  const id = window.$storefront?.apiContext?.doc._id || null;
  if (window._firstLoadContextId === id && window._emitedContextId === id) {
    next();
    return;
  }
  window.addEventListener('storefront:apiContext', next, { once: true });
};
