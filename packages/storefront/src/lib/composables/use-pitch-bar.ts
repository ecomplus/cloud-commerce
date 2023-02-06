import { computed } from 'vue';
import { parseShippingPhrase } from '@@sf/state/modules-info';

export interface Props {
  slides: Array<{
    href?: string;
    target?: string;
    html: string;
  }>;
}

const usePitchBar = (props: Props) => {
  const parsedContents = computed(() => {
    return props.slides.map(({ html }) => {
      return parseShippingPhrase(html).value;
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
