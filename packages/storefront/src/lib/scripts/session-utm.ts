// eslint-disable-next-line import/no-mutable-exports
let utm: {
  source?: string,
  medium?: string,
  campaign?: string,
  term?: string,
  content?: string,
} = {};

if (!import.meta.env.SSR) {
  const storageKey = 'ecomUtm';
  const storedValue = localStorage.getItem(storageKey);
  const at = Date.now();
  try {
    const data = (storedValue && JSON.parse(storedValue)) || {};
    if (new Date(data.at + 1000 * 60 * 60 * 24 * 7).getTime() >= at) {
      utm = data.utm || {};
    }
  } catch {
    utm = {};
  }

  let isCurrentUrl = false;
  const urlParams = new URLSearchParams(window.location.search);
  ['source', 'medium', 'campaign', 'term', 'content'].forEach((utmParam) => {
    const value = urlParams.get(`utm_${utmParam}`);
    if (value) {
      utm[utmParam] = value;
      isCurrentUrl = true;
    }
  });
  if (isCurrentUrl) {
    localStorage.setItem(storageKey, JSON.stringify({ at, utm }));
  }
}

export default utm;
