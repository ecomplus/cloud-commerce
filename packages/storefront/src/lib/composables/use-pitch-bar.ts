import type { LayoutContent } from '@@sf/content';
import { computed } from 'vue';
import { parseShippingPhrase } from '@@sf/state/modules-info';
import { useCmsPreview } from '@@sf/state/use-cms-preview';

export type Props = {
  slides: LayoutContent['header']['pitchBar'];
}

const parseLayoutContent = (layoutContent: LayoutContent) => {
  const pitchBar: Props = { slides: [] };
  if (layoutContent.header?.pitchBar) {
    pitchBar.slides = layoutContent.header.pitchBar;
  }
  return pitchBar;
};

const usePitchBar = (props: Props) => {
  const { liveContent } = useCmsPreview(['layout', 'header', 'pitchBar']);
  const parsedContents = computed(() => {
    const slides = liveContent.value || props.slides;
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
