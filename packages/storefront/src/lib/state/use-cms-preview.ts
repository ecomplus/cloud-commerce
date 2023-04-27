import { shallowReactive } from 'vue';

type TinaClient = typeof import('~/../tina/__generated__/client')['client'];

function getTinaUpdates<T extends object>({
  data,
  query,
  variables,
  cb,
}: {
  query: string,
  variables: object,
  data: T,
  cb: (newData: T) => void,
}) {
  if (!import.meta.env.SSR) {
    const id = btoa(JSON.stringify({ query }));
    window.parent.postMessage(
      JSON.parse(JSON.stringify({
        type: 'open',
        data,
        query,
        variables,
        id,
      })),
      window.location.origin,
    );
    window.addEventListener('message', (event) => {
      if (event.data.id === id) {
        cb(event.data.data);
      }
    });
  }
}

const closeTinaConnection = ({
  query,
  id,
}: {
  query: string
  id?: string
}) => {
  if (!import.meta.env.SSR) {
    window.parent.postMessage(
      { type: 'close', id: id || btoa(JSON.stringify({ query })) },
      window.location.origin,
    );
  }
};

const useCMSPreview = <T extends {
  data: Record<string, any>,
  variables: Record<string, any>,
  query: string,
}>(fetchData: (client: TinaClient) => Promise<T>) => {
  const liveContent = shallowReactive<T['data']>({});
  if (!import.meta.env.SSR && window.isCMSPreview) {
    import('react-dom/server').then(async ({ default: ReactDOMServer }) => {
      const { TinaMarkdown } = await import('tinacms/dist/rich-text');
      const deepParseData = (data: Record<string, any>) => {
        Object.keys(data).forEach((field) => {
          if (typeof data[field] === 'object' && data[field]) {
            if (Array.isArray(data[field])) {
              data[field].forEach((nested: any) => deepParseData(nested));
            } if (data[field].type === 'root' && Array.isArray(data[field].children)) {
              data[field] = ReactDOMServer.renderToString(TinaMarkdown({
                content: data[field],
              }));
            } else {
              deepParseData(data[field]);
            }
          }
        });
        return data;
      };
      // eslint-disable-next-line import/extensions
      const { client } = await import('~/../tina/__generated__/client');
      const data = await fetchData(client);
      getTinaUpdates({
        cb: (newData) => {
          Object.assign(liveContent, deepParseData(newData));
        },
        data: data.data,
        query: data.query,
        variables: data.variables,
      });
      window.addEventListener('beforeunload', () => {
        closeTinaConnection({ query: data.query });
      }, { capture: true });
    });
  }
  return { liveContent };
};

export default useCMSPreview;

export {
  useCMSPreview,
  getTinaUpdates,
  closeTinaConnection,
};
