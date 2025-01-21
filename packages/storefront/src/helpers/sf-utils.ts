// See ssr-context.ts and BaseHead.astro
if (!globalThis.__sfIds) globalThis.__sfIds = {};

export const useId = (prefix = '_') => {
  if (typeof globalThis.__sfIds[prefix] !== 'number') globalThis.__sfIds[prefix] = -1;
  /* eslint-disable-next-line no-plusplus */
  return `${prefix}${++globalThis.__sfIds[prefix]}`;
};

export const requestIdleCallback = (fn: (...args: any[]) => any, fallbackMs = 300) => {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(fn);
  } else {
    setTimeout(fn, fallbackMs);
  }
};

export const clearAccents = (str: string) => {
  return str
    .replace(/[ÁáÃãÂâÀà]/g, 'a')
    .replace(/[ÉéÊê]/g, 'e')
    .replace(/[Íí]/g, 'i')
    .replace(/[ÕõÓóÔô]/g, 'o')
    .replace(/[Úú]/g, 'u')
    .replace(/[Çç]/g, 'c');
};

export const slugify = (str: string) => {
  return clearAccents(str.trim())
    .toLowerCase()
    .replace(/[\W\r\n]/gm, '-')
    .replace(/-{2,}/g, '-')
    .replace(/(^-)|(-$)/g, '');
};

export const toLowerCaseAccents = (str: string) => {
  return str
    .toLowerCase()
    .replace(/Á/g, 'á')
    .replace(/Ã/g, 'ã')
    .replace(/Â/g, 'â')
    .replace(/À/g, 'à')
    .replace(/É/g, 'é')
    .replace(/Ê/g, 'ê')
    .replace(/Í/g, 'í')
    .replace(/Õ/g, 'õ')
    .replace(/Ó/g, 'ó')
    .replace(/Ô/g, 'ô')
    .replace(/Ú/g, 'ú')
    .replace(/Ç/g, 'ç');
};

export const termify = (str: string) => {
  return toLowerCaseAccents(str.trim())
    .replace(/[\r\n]/gm, ' ')
    .replace(/[^\w-&%áãâàéêíõóôúç]/g, ' ')
    .replace(/\s{2,}/g, ' ');
};

export const getSearchUrl = (term: string, baseUrl = '/s/') => {
  return `${baseUrl}${encodeURIComponent(termify(term))}`;
};

export const scrollToEl = (el: HTMLElement, top = 0) => {
  while (el.offsetParent) {
    top += el.offsetTop;
    el = el.offsetParent as HTMLElement;
  }
  return window.scroll({
    top,
    behavior: 'smooth',
  });
};

export const getDigestHex = async (message: string) => {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
};

export const setCookie = (cname: string, cvalue: string, exdays = 1) => {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  const expires = 'expires=' + d.toUTCString();
  const updatedCookie = cname + '=' + cvalue + '; ' + expires
    + '; path=/; samesite=strict';
  if (!import.meta.env.SSR) {
    document.cookie = updatedCookie;
  }
  return updatedCookie;
};
