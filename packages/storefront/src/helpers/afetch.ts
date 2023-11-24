type FetchParams = Parameters<typeof fetch>;
type RequestInit = Exclude<FetchParams[1], undefined>;
type BodyInit = RequestInit['body'] | Record<string, any> | Array<any>;

const afetch = (
  url: FetchParams[0],
  init?: Omit<RequestInit, 'body'> & { body?: BodyInit },
  timeout = 10000,
) => {
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
