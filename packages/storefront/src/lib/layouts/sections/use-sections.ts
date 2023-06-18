import type { RouteContext } from '@@sf/ssr-context';
import type { Props as UseProductShelf } from '@@sf/composables/use-product-shelf';

export type ProductShelfProps = UseProductShelf;

export interface Props {
  routeContext: RouteContext;
}

const useSections = async ({ routeContext }: Props) => {
  const sectionsContent = routeContext.cmsContent?.sections;
  const sections: Array<
    { type: 'product-shelf', props: ProductShelfProps }
  > = [];
  if (sectionsContent) {
    sectionsContent.forEach(({ type, ...sectionContent }) => {
      if (type === 'product-shelf') {
        const {
          collection_id: collectionId,
          sort,
          title,
          headless: isHeadless,
          shuffle: isShuffle,
          ...rest
        } = sectionContent;
        sections.push({
          type,
          props: {
            ...rest,
            collectionId,
            sort: sort as 'views',
            title: isHeadless ? null : title,
            isShuffle,
          },
        });
      }
    });
  }
  return {
    sections,
  };
};

export default useSections;

export { useSections };
