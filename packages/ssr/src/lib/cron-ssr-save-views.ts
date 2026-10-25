import type { ApiError } from '@cloudcommerce/api';
import { getFirestore } from 'firebase-admin/firestore';
import api from '@cloudcommerce/api';
import { logger } from '@cloudcommerce/firebase/lib/config';
import { deleteQueryBatch } from '@cloudcommerce/firebase/lib/helpers/firestore';

const saveViews = async () => {
  const db = getFirestore();
  const productViewsSnapshot = await db.collection('ssrProductViews')
    .limit(500).get();
  for (let i = 0; i < productViewsSnapshot.docs.length; i++) {
    const doc = productViewsSnapshot.docs[i];
    const { countUnsaved } = doc.data() as { countUnsaved: number };
    if (countUnsaved > 0) {
      const productId = doc.id as string & { length: 24 };
      try {
        // eslint-disable-next-line no-await-in-loop
        const { views } = (await api.get(`products/${productId}`)).data;
        // eslint-disable-next-line no-await-in-loop
        await api.patch(`products/${productId}`, {
          views: countUnsaved + (views || 0),
        });
        doc.ref.delete();
      } catch (_err: any) {
        const err = _err as ApiError;
        const { statusCode } = err;
        // 4xx won't ever succeed (e.g. product deleted, or a malformed ID from
        // bots), drop the doc instead of stopping every following exec on it;
        // auth errors and rate limit keep the views to retry after a fix
        if (
          statusCode && statusCode >= 400 && statusCode < 500
          && ![401, 403, 429].includes(statusCode)
        ) {
          doc.ref.delete();
          logger.warn(err);
        } else {
          logger.error(err);
          break;
        }
      }
    }
  }
  const date = new Date();
  if (date.getHours() > 1) return;
  if (!process.env.CRONTAB_SSR_SAVE_VIEWS) {
    const dateMinutes = date.getMinutes();
    if (dateMinutes < 48 || dateMinutes > 50) return;
  }
  const pageViewsQuery = db.collection('ssrPageViews')
    .where('at', '<', new Date(Date.now() - 1000 * 60 * 60 * 24 * 90));
  await deleteQueryBatch(db, pageViewsQuery);
};

export default saveViews;
