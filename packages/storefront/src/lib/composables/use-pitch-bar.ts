import type { LayoutContent } from '@@sf/content';
import { computed } from 'vue';
import { parseShippingPhrase } from '@@sf/state/modules-info';
import { useCmsPreview } from '@@sf/state/use-cms-preview';

export interface Props {
  slides: Array<{
    href?: string;
    target?: string;
    html: string;
  }>;
}

const parseLayoutContent = (layoutContent: LayoutContent) => {
  const pitchBar: Props = { slides: [] };
  if (layoutContent.header?.pitch_bar) {
    pitchBar.slides = layoutContent.header.pitch_bar;
  }
  return pitchBar;
};

const usePitchBar = (props: Props) => {
  const { liveContent } = useCmsPreview('layout');
  const parsedContents = computed(() => {
    const slides = liveContent.value
      ? parseLayoutContent(liveContent.value).slides
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
