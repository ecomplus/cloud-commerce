import { getFirestore } from 'firebase-admin/firestore';
import { error } from 'firebase-functions/logger';
import axios from 'axios';
import api from '@cloudcommerce/api';
import config from '@cloudcommerce/firebase/lib/config';
import { deleteQueryBatch } from '@cloudcommerce/firebase/lib/helpers/firestore';

const saveViews = async () => {
  const deployRand = process.env.DEPLOY_RAND || '_';
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
      } catch (err) {
        error(err);
        break;
      }
    }
  }
  const { domain } = config.get().settingsContent;
  if (domain && process.env.BUNNYNET_API_KEY) {
    const bunnyAxios = axios.create({
      baseURL: 'https://api.bunny.net/',
      headers: {
        AccessKey: process.env.BUNNYNET_API_KEY,
      },
    });
    try {
      const sMaxAge = Number(process.env.SSR_CACHE_MAX_AGE) || 179;
      const pageViewsSnapshot = await db.collection('ssrPageViews')
        .where('at', '>', new Date(Date.now() - 1000 * 60 * 20))
        .where('at', '<', new Date(Date.now() - 1000 * sMaxAge))
        .get();
      const purgedUrls: string[] = [];
      const purgeReqs: Promise<any>[] = [];
      for (let i = 0; i < pageViewsSnapshot.docs.length; i++) {
        const doc = pageViewsSnapshot.docs[i];
        const data = doc.data() as { url: string, isCachePurged?: true };
        if (data.isCachePurged) {
          continue;
        }
        const url = data.url.replace(/\?.*$/, '').replace(/#.*$/, '');
        if (url?.startsWith(`https://${domain}`) && !purgedUrls.includes(url)) {
          purgeReqs.push(bunnyAxios('/purge', {
            method: 'POST',
            params: {
              // async: 'false',
              url,
            },
          }).then(async () => {
            doc.ref.update({ isCachePurged: true });
            const freshHtmlUrl = `${url}?__isrV=${deployRand}&t=${Date.now()}`;
            await axios.get(freshHtmlUrl);
            // info(`Cache bump ${url}`);
          }));
          purgedUrls.push(url);
        }
      }
      await Promise.all(purgeReqs);
    } catch (err: any) {
      if (err.response) {
        const _err: any = new Error('Cant purge bunny.net cache');
        _err.config = err.config;
        _err.statusCode = err.response.status;
        _err.data = err.response.data;
        error(_err);
      } else {
        error(err);
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
