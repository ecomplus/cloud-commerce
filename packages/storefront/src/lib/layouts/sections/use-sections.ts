import type { ResourceId } from '@cloudcommerce/types';
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
          collection_id: collectionIdAndInfo,
          headless: isHeadless,
          shuffle: isShuffle,
          ...rest
        } = sectionContent;
        let { sort, title } = sectionContent;
        switch (sort) {
          case 'offers':
            sort = '-price_discount';
            break;
          case 'news':
            sort = '-_id';
            break;
          case 'lowest_price':
            sort = 'price';
            break;
          case 'highest_price':
            sort = '-price';
            break;
          default:
        }
        let collectionId: ResourceId | null = null;
        let searchQuery: `&${string}` | undefined;
        let titleLink: string | undefined;
        if (collectionIdAndInfo) {
          const [_id, resource, name, path] = (collectionIdAndInfo as string)
            .split(':') as [
              ResourceId,
              string | undefined,
              string | undefined,
              string | undefined,
            ];
          collectionId = _id;
          if (resource === 'categories') {
            searchQuery = `&categories._id=${_id}`;
          } else if (resource === 'brands') {
            searchQuery = `&brands._id=${_id}`;
          }
          if (!title && title !== null && name) {
            title = name;
          }
          titleLink = path;
        }
        sections.push({
          type,
          props: {
            ...rest,
            collectionId,
            searchQuery,
            sort,
            title: isHeadless ? null : title,
            titleLink,
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
