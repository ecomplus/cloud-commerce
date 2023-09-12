import type {
  Products,
  Categories,
  Brands,
  Collections,
} from '@cloudcommerce/api/types';
import {
  name as getName,
  categoriesList as getCategoriesList,
} from '@ecomplus/utils';

export interface Props {
  apiDoc?: Products | Categories | Brands | Collections;
  categories?: Partial<Categories>[];
  domain?: string;
}

const useBreadcrumbs = (props: Props = {}) => {
  const { settings, apiContext, data } = globalThis.$storefront;
  const {
    apiDoc = apiContext?.doc,
    categories = (data.categories || []),
    domain = settings.domain,
  } = props;
  const breadcrumbs: Array<{ name: string, link: string }> = [];
  if (apiDoc) {
    const productCategories = (apiDoc as Products).categories;
    if (productCategories) {
      getCategoriesList(productCategories).forEach((categoryName) => {
        const findCategory = (category: Partial<Categories>) => {
          return category.name === categoryName;
        };
        const category = (productCategories && productCategories.find(findCategory))
          || categories.find(findCategory);
        if (category) {
          breadcrumbs.push({
            name: getName(category),
            link: `/${category.slug}`,
          });
        }
      });
    }
    breadcrumbs.push({
      name: getName(apiDoc),
      link: `/${apiDoc.slug}`,
    });
  }
  return {
    breadcrumbs,
    inlineJSONLd: domain
      ? JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            item: {
              '@id': `https://${domain}/`,
              name: 'Homepage',
            },
          },
        ].concat(breadcrumbs.map(({ name, link }, index) => {
          return {
            '@type': 'ListItem',
            position: index + 2,
            item: {
              '@id': `https://${domain}${link}`,
              name,
            },
          };
        })),
      })
      : null,
  };
};

export default useBreadcrumbs;

export { useBreadcrumbs };
