import type { ApiError } from '@cloudcommerce/api';
import type { PageViewDocs } from './util/bump-cdn-cache';
import { Timestamp, getFirestore } from 'firebase-admin/firestore';
import api from '@cloudcommerce/api';
import config, { logger } from '@cloudcommerce/firebase/lib/config';
import { deleteQueryBatch } from '@cloudcommerce/firebase/lib/helpers/firestore';
import { bumpBunnyCache } from './util/bump-cdn-cache';

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
        if (err.statusCode === 404) {
          doc.ref.delete();
          logger.warn(err);
        } else {
          logger.error(err);
          break;
        }
      }
    }
  }
  const { domain } = config.get().settingsContent;
  if (domain && process.env.BUNNYNET_API_KEY) {
    const now = Date.now();
    const sMaxAge = Number(process.env.SSR_CACHE_MAX_AGE) || 179;
    const pageViewsSnapshot = await db.collection('ssrPageViews')
      .where('at', '>', new Date(now - 1000 * Math.max(sMaxAge * 2, 60 * 8)))
      .where('at', '<', new Date(now - 1000 * sMaxAge))
      .get();
    let pageViewDocs: PageViewDocs = [];
    for (let i = 0; i < pageViewsSnapshot.docs.length; i++) {
      const doc = pageViewsSnapshot.docs[i];
      const data = doc.data() as { url: string, isCachePurged?: boolean, at: Timestamp };
      const url = data.url.replace(/[?#].*$/, '');
      if (!url.startsWith(`https://${domain}`)) {
        continue;
      }
      const pathname = url.replace(`https://${domain}`, '');
      if (
        pathname.startsWith('/~')
        || pathname.startsWith('/.')
        || pathname.startsWith('/app/')
        || pathname.startsWith('/admin/')
      ) {
        // Routes with short cache TTL, see cli/ci/bunny-config-base.sh
        continue;
      }
      const timestamp = data.at.toMillis();
      if (typeof data.isCachePurged === 'boolean') {
        pageViewDocs = pageViewDocs.filter((pageViewDoc) => {
          if (pageViewDoc.pathname === pathname && pageViewDoc.timestamp) {
            // Filter page views already purged/skipped past execution
            return pageViewDoc.timestamp > timestamp;
          }
          return true;
        });
        continue;
      }
      pageViewDocs.push({ ref: doc.ref, timestamp, pathname });
    }
    const ssrReqsSnapshot = await db.collection('ssrReqs')
      .where('at', '>', new Date(now - 1000 * 60 * 14))
      .where('at', '<', new Date(now - 1000 * 60 * 9))
      .get();
    for (let i = 0; i < ssrReqsSnapshot.docs.length; i++) {
      const doc = ssrReqsSnapshot.docs[i];
      const data = doc.data() as {
        pathname: string,
        count: number,
        isCachePurged: boolean,
        at: Timestamp,
      };
      if (data.isCachePurged === true) {
        continue;
      }
      if (pageViewDocs.find(({ pathname }) => pathname === data.pathname)) {
        continue;
      }
      if (data.count <= 2 || now - data.at.toMillis() > 1000 * 60 * 50) {
        pageViewDocs.push({
          ref: doc.ref,
          pathname: data.pathname,
        });
      }
    }
    await bumpBunnyCache(pageViewDocs, domain);
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
