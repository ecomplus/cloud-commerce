import type { ResourceId, Collections } from '@cloudcommerce/types';
import type { CmsFields, PageContent } from '@@sf/content';
import type { RouteContext } from '@@sf/ssr-context';
import type { Props as UseBannerProps } from '@@sf/composables/use-banner';
import type { Props as UseProductShelfProps } from '@@sf/composables/use-product-shelf';
import type { Props as UseSearchShowcaseProps } from '@@sf/composables/use-search-showcase';
import { bannerListCmsField } from '@@sf/composables/use-banner';
import { useSharedData } from '@@sf/composables/use-shared-data';
import { useProductShelf } from '@@sf/composables/use-product-shelf';
import { useSearchShowcase } from '@@sf/composables/use-search-showcase';

export type Props = {
  routeContext: RouteContext;
  handleCustomSection?: (type: `${string}:${string}`, content: Record<string, any>) =>
    Promise<{ props: Record<string, any> }>;
  searchEngine?: UseSearchShowcaseProps['searchEngine'];
}

export const pageHeroCmsFields = ({
  autoplay: {
    widget: 'number',
    value_type: 'int',
    label: 'Autoplay',
    hint: { pt: 'Milissegundos', en: 'Milliseconds' },
  },
  slides: {
    ...bannerListCmsField,
    required: true,
  },
}) as const satisfies CmsFields;

type PageContentHero = Exclude<PageContent['hero'], undefined>;
const now = Date.now();
const parseBanners = (banners: PageContentHero['slides']) => {
  const validBanners: UseBannerProps[] = [];
  banners.forEach(({
    startsAt,
    endsAt,
    ...bannerProps
  }) => {
    if (startsAt && new Date(startsAt).getTime() < now) return;
    if (endsAt && new Date(endsAt).getTime() > now) return;
    validBanners.push(bannerProps);
  });
  return validBanners;
};

export const usePageHero = async ({ routeContext }: Props) => {
  const { cmsContent } = routeContext;
  const heroSlider: Omit<PageContentHero, 'slides'>
    & { slides: UseBannerProps[] } = { slides: [] };
  const heroContent = cmsContent?.hero;
  if (heroContent) {
    Object.assign(heroSlider, heroContent);
    if (heroContent.slides) {
      heroSlider.slides = parseBanners(heroContent.slides);
    }
  }
  return { heroSlider };
};

type CustomSection = { type: `${string}:${string}`, props: any };
type ProductDetailsProps = Record<string, any> & {
  hasDescription?: boolean,
  hasSpecifications?: boolean,
};
type BlogGridProps = {
  title?: string,
  limit?: number,
  posts?: string[],
};
type AboutUsProps = {
  title?: string,
  subtitle?: string,
  text?: string,
  buttonLink?: string,
  buttonText?: string,
};

export const usePageSections = async <T extends CustomSection = CustomSection>
({ routeContext, handleCustomSection, searchEngine }: Props) => {
  const { cmsContent } = routeContext;
  let sectionsContent = cmsContent?.sections;
  if (
    cmsContent?.markdown
    && !sectionsContent?.find(({ type }) => type === 'content-entry')
  ) {
    if (!sectionsContent) sectionsContent = [];
    sectionsContent.push({ type: 'content-entry' });
  }
  const sections: Array<
    T
    | { type: 'product-shelf', props: UseProductShelfProps }
    | { type: 'banners-grid', props: { banners: UseBannerProps[] } }
    | { type: 'product-details', props: ProductDetailsProps }
    | { type: 'breadcrumbs', props: {} }
    | { type: 'related-products', props: UseProductShelfProps }
    | { type: 'doc-description', props: {} }
    | { type: 'doc-banners', props: {} }
    | { type: 'product-specifications', props: {} }
    | { type: 'search-showcase' | 'context-showcase', props: UseSearchShowcaseProps }
    | { type: 'page-title', props: {} }
    | { type: 'content-entry', props: { title: string, markdown: string } }
    | { type: 'blog-grid', props: BlogGridProps }
    | { type: 'about-us', props: AboutUsProps }
    | { type: 'custom-html', props: { html: string } }
  > = [];

  if (sectionsContent) {
    await Promise.all(sectionsContent.map(async ({ type, ...sectionContent }, index) => {
      if (type === 'product-shelf' || type === 'related-products') {
        const {
          collectionIdAndInfo,
          isHeadless,
          isShuffle,
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
        let titleLink: string | undefined = sectionContent.titleLink;
        if (collectionIdAndInfo) {
          const [_id, resource, name, path] = (collectionIdAndInfo as string)
            .split(':') as [
              ResourceId,
              string | undefined,
              string | undefined,
              string | undefined,
            ];
          if (!resource || resource === 'collection') {
            collectionId = _id;
          } else if (resource === 'categories') {
            searchQuery = `&categories._id=${_id}`;
          } else if (resource === 'brands') {
            searchQuery = `&brands._id=${_id}`;
          }
          if (!title && title !== null && name) title = name;
          if (!titleLink) titleLink = path;
        }
        if (rest.searchQuery) {
          searchQuery = (searchQuery || '') + rest.searchQuery;
        }
        const props = {
          ...rest,
          collectionId,
          searchQuery,
          sort,
          title: isHeadless ? null : title,
          titleLink,
          isShuffle,
          isRelatedProducts: type === 'related-products',
        };
        const {
          fetching,
          products,
          title: { value: finalTitle },
          titleLink: { value: finalTitleLink },
        } = useProductShelf(props);
        await fetching;
        sections[index] = {
          type,
          props: {
            ...props,
            title: finalTitle,
            titleLink: finalTitleLink,
            products,
          },
        };
        return;
      }

      if (type === 'search-showcase' || type === 'context-showcase') {
        const props: UseSearchShowcaseProps = { ...sectionContent };
        if (type === 'context-showcase') {
          if (routeContext.fetchingApiContext) {
            await routeContext.fetchingApiContext;
          }
          const { resource, doc } = routeContext.apiContext;
          if (resource === 'categories' || resource === 'brands') {
            const params = { [`${resource}.name`]: [doc!.name] };
            if (resource === 'categories') {
              const { value: categories } = await useSharedData({ field: 'categories' });
              categories?.forEach(({ name, parent }) => {
                if (
                  name && parent
                  && (parent._id === doc!._id || parent.slug === doc!.slug)
                ) {
                  params[`categories.name`].push(name);
                }
              });
            }
            props.fixedParams = params;
          } else if (resource === 'collections') {
            const { products } = (doc as Collections);
            if (products?.length) {
              props.fixedParams = { _id: products };
            }
          }
        } else if (routeContext.searchPageTerm !== undefined) {
          props.term = routeContext.searchPageTerm || null;
        }
        if (props.term !== undefined || props.fixedParams) {
          const {
            searchEngine: resultSearchEngine,
            fetching,
          } = useSearchShowcase({ ...props, searchEngine });
          await fetching;
          props.products = resultSearchEngine.products.map((item) => ({
            ...item,
            __ssr: true,
          }));
          props.resultMeta = resultSearchEngine.meta;
          props.ssrError = resultSearchEngine.fetchError.value?.message;
        }
        sections[index] = { type, props };
        return;
      }

      switch (type) {
        case 'banners-grid':
          sections[index] = {
            type,
            props: {
              ...sectionContent,
              banners: parseBanners(sectionContent.banners || []),
            },
          };
          return;
        case 'custom-html':
          sections[index] = {
            type,
            props: { html: sectionContent.html || '' },
          };
          return;
        case 'content-entry':
          sections[index] = {
            type,
            props: {
              title: sectionContent.title || cmsContent?.title || '',
              markdown: sectionContent.markdown || cmsContent?.markdown || '',
            },
          };
          return;
        case 'breadcrumbs':
        case 'product-details':
        case 'doc-description':
        case 'doc-banners':
        case 'product-specifications':
        case 'page-title':
        case 'blog-grid':
        case 'about-us':
          // Bypassed sections
          sections[index] = {
            type,
            props: sectionContent,
          };
          return;
        default:
      }
      if (typeof handleCustomSection === 'function') {
        const { props } = await handleCustomSection(
          type as `${string}:${string}`,
          sectionContent,
        );
        sections[index] = { type, props } as T;
      }
    }));
  }
  /*
  if (import.meta.env.DEV) {
    console.log('> Sections loaded');
  }
  */
  return {
    sections,
  };
};
