import type Bling from '../bling-auth/client';
import api from '@cloudcommerce/api';
import ecomUtils from '@ecomplus/utils';
import { logger } from '@cloudcommerce/firebase/lib/config';

const removeAccents = (str: string) => str.trim()
  .replace(/[áàãâÁÀÃÂ]/gi, 'a')
  .replace(/[éêÉÊ]/gi, 'e')
  .replace(/[óõôÓÕÔ]/gi, 'o')
  .replace(/[íÍ]/gi, 'i')
  .replace(/[úÚ]/gi, 'u')
  .replace(/[çÇ]/gi, 'c')
  .replace(/[-.]/gi, '');

const findCategory = async (query: string) => {
  const endpoint = `categories?${query}&limit=1` as `categories?${string}`;
  const { data: { result } } = await api.get(endpoint);
  return result[0] || null;
};

const importCategory = async (
  bling: Bling,
  blingCategoryId: string | number | undefined,
): Promise<Record<string, any> | null> => {
  if (!blingCategoryId) {
    return null;
  }
  const existing = await findCategory('metafields.namespace=bling'
    + '&metafields.field=bling:categoria-id'
    + `&metafields.value=${blingCategoryId}`);
  if (existing) {
    return existing;
  }

  const { data: { data: blingCategory } } = await bling
    .get(`/categorias/produtos/${blingCategoryId}`);
  if (!blingCategory?.descricao) {
    return null;
  }

  const sameName = await findCategory(`name=${encodeURIComponent(blingCategory.descricao)}`);
  if (sameName) {
    return sameName;
  }

  const body: Record<string, any> = {
    name: blingCategory.descricao,
    slug: removeAccents(blingCategory.descricao.toLowerCase())
      .replace(/[^a-z0-9-_./]/gi, '-'),
    metafields: [{
      _id: ecomUtils.randomObjectId(),
      namespace: 'bling',
      field: 'bling:categoria-id',
      value: `${blingCategoryId}`,
    }],
  };

  const parentId = blingCategory.categoriaPai?.id;
  if (parentId) {
    const parentCategory = await importCategory(bling, parentId)
      .catch((err: any) => {
        logger.warn(`[CATEGORY_IMPORT] erro ao importar categoria pai ${parentId}: ${err.message}`);
        return null;
      });
    if (parentCategory) {
      body.parent = {
        _id: parentCategory._id,
        name: parentCategory.name,
        slug: parentCategory.slug,
      };
    }
  }

  const { data } = await api.post('categories', body as any);
  return { _id: data._id, ...body };
};

export default importCategory;
