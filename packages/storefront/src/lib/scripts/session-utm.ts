// eslint-disable-next-line import/no-mutable-exports
let utm: { [k: string]: string } = {};

if (!import.meta.env.SSR) {
  const storageKey = 'ecomUtm';
  const storedValue = sessionStorage.getItem(storageKey);
  try {
    utm = (storedValue && JSON.parse(storedValue)) || {};
  } catch {
    utm = {};
  }

  let isCurrentUrl;
  const urlParams = new URLSearchParams(window.location.search);
  ['source', 'medium', 'campaign', 'term', 'content'].forEach((utmParam) => {
    const value = urlParams.get(`utm_${utmParam}`);
    if (typeof value === 'string') {
      utm[utmParam] = value;
      isCurrentUrl = true;
    }
  });
  if (isCurrentUrl) {
    sessionStorage.setItem(storageKey, JSON.stringify(utm));
  }
}

export default utm;
