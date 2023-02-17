type FetchParams = Parameters<typeof fetch>;

const afetch = (url: FetchParams[0], init?: FetchParams[1], timeout = 10000) => {
  let abortController: AbortController | undefined;
  let timer;
  if (timeout) {
    abortController = new AbortController();
    timer = setTimeout(() => {
      abortController.abort();
    }, timeout);
  }
  if (init?.body && typeof init.body === 'object') {
    init.body = JSON.stringify(init.body);
    init.headers = {
      ...init.headers,
      'Content-Type': 'application/json',
      'Content-Length': init.body.length.toString(),
    };
  }
  const promise = fetch(url, {
    ...init,
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
