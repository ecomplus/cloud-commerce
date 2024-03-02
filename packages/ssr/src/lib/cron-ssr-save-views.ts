import { getFirestore } from 'firebase-admin/firestore';
import { error } from 'firebase-functions/logger';
import axios from 'axios';
import api from '@cloudcommerce/api';
import config from '@cloudcommerce/firebase/lib/config';
import { deleteQueryBatch } from '@cloudcommerce/firebase/lib/helpers/firestore';

const saveViews = async () => {
  const deployRand = process.env.DEPLOY_RAND || '_';
  const projectId = process.env.GCLOUD_PROJECT as string;
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
    let bunnyStorageName = process.env.BUNNYNET_STORAGE_NAME;
    let bunnyStoragePass = process.env.BUNNYNET_STORAGE_PASS;
    let bunnyZoneName = process.env.BUNNYNET_ZONE_NAME;
    let permaCacheZoneFolder = '';
    const bunnyAxios = axios.create({
      baseURL: 'https://api.bunny.net/',
      headers: {
        AccessKey: process.env.BUNNYNET_API_KEY,
      },
    });
    try {
      const storageAuthReqs: Promise<any>[] = [];
      if (!bunnyStorageName || !bunnyStoragePass) {
        storageAuthReqs.push(
          bunnyAxios.get('/storagezone').then(({ data }) => {
            for (let i = 0; i < data.length; i++) {
              const bunnyStorage = data[i];
              if (bunnyStorageName) {
                if (bunnyStorage.Name === bunnyStorageName) {
                  bunnyStoragePass = bunnyStorage.Password;
                  break;
                }
                continue;
              }
              if (bunnyStorage.Name.startsWith('storefront-isr-')) {
                bunnyStorageName = bunnyStorage.Name;
                bunnyStoragePass = bunnyStorage.Password;
                break;
              }
            }
          }),
        );
      }
      if (!bunnyZoneName) {
        storageAuthReqs.push(
          bunnyAxios.get('/pullzone').then(({ data }) => {
            for (let i = 0; i < data.length; i++) {
              const pullZone = data[i];
              if (pullZone.Hostnames.find(({ Value }) => Value === domain)) {
                bunnyZoneName = pullZone.Name;
                break;
              }
            }
          }),
        );
      }
      await Promise.all(storageAuthReqs);
      if (bunnyStorageName && bunnyStoragePass && bunnyZoneName) {
        const { data } = await axios({
          url: `https://storage.bunnycdn.com/${bunnyStorageName}/__bcdn_perma_cache__/`,
          headers: {
            AccessKey: bunnyStoragePass,
          },
        });
        for (let i = 0; i < data.length; i++) {
          const { ObjectName } = data[i];
          if (
            ObjectName.startsWith(`pullzone__${bunnyZoneName}__`)
            && (!permaCacheZoneFolder || permaCacheZoneFolder < ObjectName)
          ) {
            permaCacheZoneFolder = ObjectName;
          }
        }
      }
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
        const url = data.url.replace(/\?.*$/, '');
        doc.ref.update({ isCachePurged: true });
        if (url?.startsWith(`https://${domain}`) && !purgedUrls.includes(url)) {
          purgeReqs.push(bunnyAxios('/purge', {
            method: 'POST',
            params: {
              async: 'false',
              url,
            },
          }));
          purgedUrls.push(url);
          if (permaCacheZoneFolder) {
            let pathname = url.replace(`https://${domain}`, '');
            const freshHtmlUrl = `https://${projectId}.web.app${pathname}`
              + `?__isrV=${deployRand}&t=${Date.now()}`;
            purgeReqs.push(
              // eslint-disable-next-line no-loop-func
              axios.get(freshHtmlUrl).then(({ data: freshHtml }: { data: string }) => {
                if (pathname.charAt(0) === '/') {
                  pathname = pathname.slice(1);
                }
                const paths = pathname.split('/');
                const filename = paths.pop() || '';
                let folderpath = paths.join('/');
                if (folderpath) folderpath += '/';
                // https://support.bunny.net/hc/en-us/articles/360017048720-Perma-Cache-Folder-Structure-Explained
                const permaCachePath = `__bcdn_perma_cache__/${permaCacheZoneFolder}`
                  + `/${folderpath}___${filename}___/___file___`;
                axios({
                  method: 'PUT',
                  url: `https://storage.bunnycdn.com/${bunnyStorageName}/${permaCachePath}`,
                  headers: {
                    'Content-Type': 'text/html',
                    Accept: 'application/json',
                    AccessKey: bunnyStoragePass,
                  },
                  data: freshHtml,
                });
              }),
            );
          }
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
