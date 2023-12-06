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
    .replace(/[Éé]/g, 'e')
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
