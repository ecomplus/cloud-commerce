import type NReact from 'react';
import { ref, shallowRef, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';

const checkEquals = (
  data: Record<string, any>,
  oldData: Record<string, any>,
  field: string,
  subfield?: string | number,
) => {
  const val = subfield ? data[field]?.[subfield] : data[field];
  const oldVal = subfield ? oldData[field]?.[subfield] : oldData[field];
  if (typeof val !== typeof oldVal) return false;
  if (typeof val === 'object' && val && oldVal) {
    const keys = Object.keys(val);
    if (keys.length !== Object.keys(oldVal).length) return false;
    return keys.every((key) => {
      return checkEquals(val, oldVal, key);
    });
  }
  return val === oldVal;
};

const getDataDiffs = (
  data: Record<string, any>,
  oldData: Record<string, any>,
) => {
  const diffFields: Array<[field: string, subfield?: string | number]> = [];
  Object.keys(data).forEach((field) => {
    if (typeof data[field] === 'object' && data[field]) {
      Object.keys(data[field]).forEach((subfield: string | number) => {
        if (Array.isArray(data[field])) {
          subfield = Number(subfield);
        }
        if (!checkEquals(data, oldData, field, subfield)) {
          diffFields.push([field, subfield]);
        }
      });
      return;
    }
    if (!checkEquals(data, oldData, field)) {
      diffFields.push([field]);
    }
  });
  return diffFields;
};

export const createPreviewComponent = ({ createClass, h }: {
  createClass: <P>(o: P) => NReact.Component<P>,
  h: typeof NReact.createElement,
  cmsConfig: Record<string, any>,
}) => {
  const { host } = window.location;
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  const previewUrl = ref<URL | null>(null);
  const dataRef = shallowRef<Record<string, any>>({});
  const setPreviewUrl = useDebounceFn((
    slug: string,
    contents: { filename: string, data: Record<string, any> }[],
  ) => {
    previewUrl.value = new URL(`http${isLocal ? '' : 's'}://${host}/~preview/${slug}`);
    contents.forEach(({ filename, data: _data }) => {
      previewUrl.value!.searchParams
        .append(`content:${filename}`, JSON.stringify(_data));
    });
  }, 100);

  // https://decapcms.org/docs/customization/#react-components-inline-interaction
  // https://github.com/decaporg/decap-cms/issues/2183#issuecomment-997373169
  const previewIframeId = 'pagePreview';
  return createClass({
    render() {
      const entry = (this as any).props.entry;
      dataRef.value = entry.toJS().data;
      // console.debug?.('preview', { filename, data });
      const html = `
      <iframe
        id="${previewIframeId}"
        border="0"
        width="100%"
        height="100%"
        style="border: 1px solid #EEE; height: calc(100dvh - 12px)"
      ></iframe>`;
      return h('div', {
        dangerouslySetInnerHTML: { __html: html },
      });
    },
    componentDidMount() {
      const filename = window.location.hash.split('/entries/').pop() || '';
      const slug = '';
      const paneIframe = document.getElementById('preview-pane') as HTMLIFrameElement;
      const paneWindow = paneIframe.contentWindow!;
      const previewIframe = paneWindow.document
        .getElementById(previewIframeId) as HTMLIFrameElement;
      const previewWindow = previewIframe.contentWindow;
      const liveFields: Array<[field: string, subfield?: string | number]> = [];
      paneWindow.addEventListener('message', (ev) => {
        if (ev.data.type === 'open' && ev.data.filename === filename) {
          if (ev.data.field) {
            liveFields.push([ev.data.field, ev.data.subfield]);
          }
          previewWindow?.postMessage(({
            id: ev.data.id,
            data: dataRef.value,
          }));
        }
      });
      const updateUrl = () => setPreviewUrl(slug, [{
        filename,
        data: dataRef.value,
      }]);
      watch(dataRef, (data, oldData) => {
        if (previewUrl.value && oldData) {
          const diffs = getDataDiffs(data, oldData);
          const isLiveWatchingAll = diffs.every((diff) => {
            return liveFields.some(([field, subfield]) => {
              return field === diff[0] && subfield === diff[1];
            });
          });
          if (isLiveWatchingAll) return;
        }
        updateUrl();
      }, {
        immediate: true,
      });
      watch(previewUrl, (url) => {
        if (url) previewIframe.src = url.toString();
      }, {
        immediate: true,
      });
    },
  });
};

export default createPreviewComponent;
