import { requestIdleCallback } from '@@sf/sf-lib';

export type GtagConfigKey = 'client_id' | 'session_id' | 'gclid';

export const loadGtagSession = (
  trackingId: string,
  cb?: (key: GtagConfigKey, id: string) => any,
) => {
  const gtagConfig: Record<GtagConfigKey, string> = {
    client_id: '',
    session_id: '',
    gclid: '',
  };
  const storageKey = `gtag_conf_${trackingId}`;
  const storedValue = sessionStorage.getItem(storageKey);
  if (storedValue) {
    try {
      const storedConfig: typeof gtagConfig = JSON.parse(storedValue);
      if (storedConfig) {
        Object.keys(storedConfig).forEach((key) => {
          const id = storedConfig[key];
          if (typeof id === 'string') cb?.(key as GtagConfigKey, id);
        });
        return;
      }
    } catch {
      //
    }
  }
  requestIdleCallback(() => {
    const gtagScript = document.createElement('script');
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    gtagScript.async = true;
    gtagScript.onload = () => {
      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag() { (window as any).dataLayer.push(arguments); }
      const _gtag = gtag as Gtag.Gtag;
      _gtag('js', new Date());
      _gtag('config', trackingId, { send_page_view: false });
      Object.keys(gtagConfig).forEach((key) => {
        _gtag('get', trackingId, key, (id) => {
          if (typeof id === 'string') {
            cb?.(key as GtagConfigKey, id);
            gtagConfig[key] = id;
            sessionStorage.setItem(storageKey, JSON.stringify(gtagConfig));
          }
        });
      });
    };
    document.body.appendChild(gtagScript);
  });
};

export default loadGtagSession;
