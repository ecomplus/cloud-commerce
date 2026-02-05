import { isMobile, looksLikeBot, requestIdleCallback } from '@@sf/sf-lib';

const raceAndLoadScripts = async () => {
  if (
    window.CMS || window.$isCmsPreview
    || window.location.pathname.startsWith('/admin/')
  ) {
    return;
  }
  const loadDelayedScripts = (scripts = window.$delayedAsyncScripts) => {
    scripts?.forEach((src) => {
      let delayMs: number | undefined;
      if (typeof src !== 'string') {
        delayMs = src.delay;
        src = src.src;
      }
      if (!src) return;
      const script = document.createElement('script');
      script.async = true;
      script.src = src;
      if (!delayMs) {
        document.body.appendChild(script);
        return;
      }
      setTimeout(() => document.body.appendChild(script), delayMs);
    });
  };
  const { $delayedAsyncScripts } = window;
  if ($delayedAsyncScripts) {
    for (let i = $delayedAsyncScripts.length - 1; i >= 0; i--) {
      const src = $delayedAsyncScripts[i];
      if (typeof src === 'string') continue;
      if (!src.isEager) continue;
      requestIdleCallback(() => loadDelayedScripts([src]), 200);
      $delayedAsyncScripts.splice(i, 1);
    }
  }
  await Promise.race([
    window.$firstInteraction,
    new Promise((resolve) => {
      const maxWait = window.$delayedScriptsMaxWait || (isMobile ? 4000 : 2500);
      setTimeout(resolve, maxWait);
    }),
  ]);
  setTimeout(() => {
    requestIdleCallback(() => loadDelayedScripts(), 100);
  }, 500);
};
if (!looksLikeBot) {
  if (document.readyState !== 'loading') {
    raceAndLoadScripts();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(raceAndLoadScripts, 50);
    });
  }
}
