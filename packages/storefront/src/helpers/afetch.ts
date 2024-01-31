type FetchParams = Parameters<typeof fetch>;
type RequestInit = Exclude<FetchParams[1], undefined>;
type BodyInit = RequestInit['body'] | Record<string, any> | Array<any>;
type AFetchInit = Omit<RequestInit, 'body'> & {
  body?: BodyInit,
  params?: Record<string, string | number | (string | number)[]>,
};

const afetch = (url: FetchParams[0], init?: AFetchInit, timeout = 10000) => {
  let abortController: AbortController | undefined;
  let timer: NodeJS.Timeout | undefined;
  if (timeout) {
    abortController = new AbortController();
    timer = setTimeout(() => {
      (abortController as AbortController).abort();
    }, timeout);
  }
  let body: RequestInit['body'];
  if (init?.body) {
    if (typeof init.body === 'object') {
      body = JSON.stringify(init.body);
      init.headers = {
        ...init.headers,
        'Content-Type': 'application/json',
        'Content-Length': body.length.toString(),
      };
    } else {
      body = init.body;
    }
  }
  if (init?.params && typeof url === 'string') {
    let query = '';
    Object.keys(init.params).forEach((key) => {
      const value: string | number | (string | number)[] = init.params![key];
      if (Array.isArray(value)) {
        value.forEach((val) => {
          query += `&${key}=${val}`;
        });
        return;
      }
      query += `&${key}=${value}`;
    });
    if (query) {
      if (!url.includes('?')) url += `?${query.slice(1)}`;
      else url += query;
    }
  }
  const promise = fetch(url, {
    ...init,
    body,
    signal: abortController?.signal,
  });
  promise.finally(() => {
    if (timer) {
      clearTimeout(timer);
    }
  });
  return promise;
};

export default afetch;
