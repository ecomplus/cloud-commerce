import { getFirestore } from 'firebase-admin/firestore';
import { error } from 'firebase-functions/logger';
import axios from 'axios';
import api from '@cloudcommerce/api';
import { deleteQueryBatch } from '@cloudcommerce/firebase/lib/helpers/firestore';

const saveViews = async () => {
  /* eslint-disable no-await-in-loop */
  const db = getFirestore();
  const productViewsSnapshot = await db.collection('ssrProductViews')
    .limit(500).get();
  for (let i = 0; i < productViewsSnapshot.docs.length; i++) {
    const doc = productViewsSnapshot.docs[i];
    const { countUnsaved } = doc.data() as { countUnsaved: number };
    if (countUnsaved > 0) {
      const productId = doc.id as string & { length: 24 };
      const { views } = (await api.get(`products/${productId}`)).data;
      await api.patch(`products/${productId}`, {
        views: countUnsaved + (views || 0),
      });
    }
    doc.ref.delete();
  }
  if (process.env.BUNNYNET_API_KEY) {
    try {
      const pageViewsSnapshot = await db.collection('ssrPageViews')
        .where('at', '>', new Date(Date.now() - 1000 * 60 * 20))
        .get();
      const purgedUrls: string[] = [];
      for (let i = 0; i < pageViewsSnapshot.docs.length; i++) {
        const doc = pageViewsSnapshot.docs[i];
        const { url } = doc.data() as { url: string };
        if (url && !purgedUrls.includes(url)) {
          await axios('https://api.bunny.net/purge', {
            method: 'POST',
            params: {
              async: 'false',
              url,
            },
            headers: {
              AccessKey: process.env.BUNNYNET_API_KEY,
            },
          });
          purgedUrls.push(url);
        }
      }
    } catch (err) {
      error(err);
    }
  }
  const pageViewsQuery = db.collection('ssrPageViews')
    .where('at', '<', new Date(Date.now() - 1000 * 60 * 60 * 24 * 90));
  await deleteQueryBatch(db, pageViewsQuery);
};

export default saveViews;
