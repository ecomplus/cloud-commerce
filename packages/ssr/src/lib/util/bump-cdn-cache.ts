import type { DocumentReference } from 'firebase-admin/firestore';
import type { AxiosInstance, AxiosError } from 'axios';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { warn, error } from 'firebase-functions/logger';
import axios from 'axios';

export type PageViewDocs = Array<{ ref: DocumentReference, pathname: string }>;

export const loadBunnyStorageKeys = async ({ projectId, bunnyAxios, bunnyStorageKeysRef }: {
  projectId: string,
  bunnyAxios: AxiosInstance,
  bunnyStorageKeysRef: DocumentReference,
}) => {
  let bunnyStorageName = process.env.BUNNYNET_STORAGE_NAME;
  let bunnyStoragePass = process.env.BUNNYNET_STORAGE_PASS;
  const bunnyZoneName = process.env.BUNNYNET_ZONE_NAME || projectId;
  let permaCacheZoneFolder = '';
  let isValidSavedKeys = false;
  if (!bunnyStorageName || !bunnyStoragePass) {
    const savedKeysData = (await bunnyStorageKeysRef.get()).data();
    if (savedKeysData) {
      const expiresIn = 1000 * 60 * 60;
      const now = Timestamp.now().toMillis();
      if (((savedKeysData.at?.toMillis() || 0) + expiresIn) > now) {
        bunnyStorageName = savedKeysData.bunnyStorageName;
        bunnyStoragePass = savedKeysData.bunnyStoragePass;
        permaCacheZoneFolder = savedKeysData.permaCacheZoneFolder;
        isValidSavedKeys = true;
      }
    }
    if (!bunnyStorageName || !bunnyStoragePass) {
      const { data } = await bunnyAxios.get('/storagezone');
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
    }
  }
  if (bunnyStorageName && bunnyStoragePass && !permaCacheZoneFolder) {
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
  if (!isValidSavedKeys && bunnyStorageName && bunnyStoragePass && permaCacheZoneFolder) {
    bunnyStorageKeysRef.set({
      bunnyStorageName,
      bunnyStoragePass,
      permaCacheZoneFolder,
      at: Timestamp.now(),
    });
  }
  const bunnyStorageAxios = axios.create({
    baseURL: `https://storage.bunnycdn.com/${bunnyStorageName}/`,
    headers: {
      'Content-Type': 'text/html',
      Accept: 'application/json',
      AccessKey: bunnyStoragePass,
    },
  });
  return {
    bunnyStorageName,
    bunnyStoragePass,
    bunnyStorageAxios,
    bunnyZoneName,
    permaCacheZoneFolder,
  };
};

export const bumpBunnyCache = async (pageViewDocs: PageViewDocs, domain: string) => {
  if (!pageViewDocs.length) return;
  const deployRand = process.env.DEPLOY_RAND || '_';
  const projectId = process.env.GCLOUD_PROJECT as string;
  const db = getFirestore();
  const bunnyAxios = axios.create({
    baseURL: 'https://api.bunny.net/',
    headers: {
      AccessKey: process.env.BUNNYNET_API_KEY,
    },
  });
  const bunnyStorageKeysRef = db.doc('ssrBunnyNet/storageKeys');
  try {
    const {
      bunnyStorageAxios,
      permaCacheZoneFolder,
    } = await loadBunnyStorageKeys({
      projectId,
      bunnyAxios,
      bunnyStorageKeysRef,
    });
    const purgedPaths: string[] = [];
    const purgeReqs: Promise<any>[] = [];
    for (let i = 0; i < pageViewDocs.length; i++) {
      const { ref, pathname } = pageViewDocs[i];
      if (purgedPaths.includes(pathname)) {
        ref.update({ isCachePurged: false });
        continue;
      }
      purgeReqs.push(bunnyAxios('/purge', {
        method: 'POST',
        params: {
          async: 'false',
          url: `https://${domain}${pathname}`,
        },
      }));
      purgedPaths.push(pathname);
      if (permaCacheZoneFolder) {
        const paths = pathname.slice(1).split('/');
        const filename = paths.pop() || '';
        let folderpath = paths.join('/');
        if (folderpath) folderpath += '/';
        // https://support.bunny.net/hc/en-us/articles/360017048720-Perma-Cache-Folder-Structure-Explained
        const permaCachePath = `__bcdn_perma_cache__/${permaCacheZoneFolder}`
          + `/${folderpath}___${filename}___/___file___`;
        const freshHtmlUrl = `https://${projectId}.web.app${pathname}`
          + `?__isrV=${deployRand}&t=${Date.now()}`;
        purgeReqs.push(
          // eslint-disable-next-line no-loop-func
          axios.get(freshHtmlUrl)
            .then(({ data: freshHtml }: { data: string }) => {
              if (freshHtml.length < 100) {
                return null;
              }
              ref.update({ isCachePurged: true, permaCachePath });
              return bunnyStorageAxios({
                method: 'PUT',
                url: `/${permaCachePath}`,
                data: freshHtml,
              });
            })
            .catch((_err: AxiosError) => {
              if (_err.response?.status === 404) {
                ref.update({ isCachePurged: true, permaCachePath });
                return bunnyStorageAxios.delete(`/${permaCachePath}`);
              }
              throw _err;
            }),
        );
        continue;
      }
      ref.update({ isCachePurged: true });
      continue;
    }
    await Promise.all(purgeReqs);
  } catch (___err: any) {
    const _err = ___err as AxiosError;
    if (_err.response) {
      if (_err.response.status === 429) {
        warn(`Purge failed with status 429 at ${_err.config?.url}`);
        return;
      }
      const err: any = new Error('Cant purge bunny.net cache');
      err.config = _err.config;
      err.statusCode = _err.response.status;
      err.data = _err.response.data;
      error(err);
    } else {
      error(___err);
    }
    bunnyStorageKeysRef.delete();
  }
};
