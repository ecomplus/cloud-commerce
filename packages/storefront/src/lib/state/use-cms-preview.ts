import type { Ref, ShallowRef, ShallowReactive } from 'vue';
import type { ContentFilename, ContentData as _ContentData } from '@@sf/content';
import { watch, shallowRef } from 'vue';

type ContentData<T extends ContentFilename> = NonNullable<_ContentData<T>>;

type SubfieldContentKeys<
  T extends ContentFilename,
  F extends undefined | keyof ContentData<T>,
> = F extends keyof ContentData<T> ? keyof ContentData<T>[F] : undefined;

type NestedContentData<
  T extends ContentFilename,
  F extends undefined | keyof ContentData<T>,
  S extends SubfieldContentKeys<T, F>,
> = F extends keyof ContentData<T>
  ? S extends keyof ContentData<T>[F]
    ? ContentData<T>[F][S] : ContentData<T>[F]
  : ContentData<T>;

export function useCmsPreview<
  T extends ContentFilename,
  F extends keyof ContentData<T>,
  S extends SubfieldContentKeys<T, F>,
>(filename: T | [T] | [T, F] | [T, F, S]) {
  let field: F | undefined;
  let subfield: S | undefined;
  if (Array.isArray(filename)) {
    field = filename[1];
    subfield = filename[2];
    filename = filename[0];
  }
  const liveContent = shallowRef<NestedContentData<T, F, S> | undefined>();
  if (!import.meta.env.SSR && window.$isCmsPreview) {
    const id = btoa(JSON.stringify({ filename }));
    const openMessage = {
      type: 'open',
      filename,
      field,
      subfield,
      id,
    };
    window.parent.postMessage(openMessage, window.location.origin);
    window.addEventListener('message', (event) => {
      if (event.data.id !== id) return;
      if (!event.data.data) {
        console.log('Unexpected CMS preview message', event.data);
        return;
      }
      if (field) {
        liveContent.value = subfield
          ? event.data.data[field][subfield]
          : event.data.data[field];
      } else {
        liveContent.value = event.data.data;
      }
    });
  }
  return { liveContent };
}

export default useCmsPreview;

export type SectionPreviewProps = {
  cmsPreview?: {
    contentFilename: `${string}/${string}`;
    sectionIndex: number;
  };
}

export const useSectionPreview = (
  { cmsPreview }: SectionPreviewProps,
  refs?: Record<string, Ref<any> | ShallowRef<any> | ShallowReactive<any>>,
) => {
  if (cmsPreview) {
    const { contentFilename, sectionIndex } = cmsPreview;
    const {
      liveContent,
    } = useCmsPreview([contentFilename, 'sections', sectionIndex]);
    if (refs) {
      watch(liveContent, (data) => {
        if (!data) return;
        Object.keys(refs).forEach((key) => {
          if (refs[key].value !== undefined) {
            if (data[key] === undefined) return;
            refs[key].value = data[key];
            return;
          }
          if (!data[key]) return;
          if (Array.isArray(refs[key])) {
            refs[key].splice(0);
            data[key].forEach((v: any) => refs[key].push(v));
            return;
          }
          Object.assign(refs[key], data[key]);
        });
      });
    }
    return { liveContent };
  }
  return null;
};
