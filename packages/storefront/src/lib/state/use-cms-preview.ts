import type { ContentFilename, ContentData } from '../content';
import { shallowRef } from 'vue';

function getCmsUpdates<T extends ContentFilename>(
  filename: T,
  cb: (newData: NonNullable<ContentData<T>>) => void,
) {
  if (!import.meta.env.SSR) {
    const id = btoa(JSON.stringify({ filename }));
    window.parent.postMessage(
      JSON.parse(JSON.stringify({
        type: 'open',
        filename,
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

const useCmsPreview = <T extends ContentFilename>(filename: T) => {
  const liveContent = shallowRef<NonNullable<ContentData<T>> | null>(null);
  if (!import.meta.env.SSR && window.$isCmsPreview) {
    getCmsUpdates(filename, (newData) => {
      liveContent.value = newData;
    });
  }
  return { liveContent };
};

export default useCmsPreview;

export { useCmsPreview, getCmsUpdates };
