import type { CmsLayout } from '@@sf/cms';
import { computed } from 'vue';
import { parseShippingPhrase } from '@@sf/state/modules-info';
import { useCMSPreview } from '@@sf/state/use-cms-preview';

export interface Props {
  slides: Array<{
    href?: string;
    target?: string;
    html: string;
  }>;
}

const parseLayoutContent = (layoutContent: CmsLayout) => {
  const pitchBar: Props = { slides: [] };
  if (layoutContent.header?.pitch_bar) {
    pitchBar.slides = layoutContent.header.pitch_bar;
  }
  return pitchBar;
};

const usePitchBar = (props: Props) => {
  const { liveContent } = useCMSPreview(async (tinaClient) => {
    return tinaClient.queries.layout({ relativePath: 'layout.json' });
  });
  const parsedContents = computed(() => {
    const slides = liveContent.layout
      // @ts-ignore
      ? parseLayoutContent(liveContent.layout).slides
      : props.slides;
    return slides.map(({ html }) => {
      return parseShippingPhrase(html).value
        .replace(/<\/?p>/g, '')
        .replace(/&lt;(\/?d-md)&gt;/g, '<$1>');
    });
  });
  const countValidSlides = computed(() => {
    return parsedContents.value.filter((html) => html).length;
  });
  return {
    parsedContents,
    countValidSlides,
  };
};

export default usePitchBar;

export {
  parseLayoutContent,
  usePitchBar,
};
