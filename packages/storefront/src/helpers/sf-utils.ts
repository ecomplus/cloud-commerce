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
