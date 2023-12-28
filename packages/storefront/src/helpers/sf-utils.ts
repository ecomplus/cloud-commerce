let id = -1;

/* eslint-disable-next-line no-plusplus */
export const useId = () => String(++id);

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
