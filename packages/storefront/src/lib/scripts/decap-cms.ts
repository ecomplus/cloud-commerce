import type { CmsStoreData } from '../../decap-cms/collections/get-configs-coll';
import Deepmerge from '@fastify/deepmerge';
import api from '@cloudcommerce/api';
import afetch from '../../helpers/afetch';
import _getCmsConfig from '../../decap-cms/get-cms-config';
import createPreviewComponent from '../../decap-cms/create-preview-component';

(window as any)._getCmsConfig = _getCmsConfig;

let cmsConfig: Record<string, any> = {};
const initCmsWithPreview = () => {
  const { createClass, h, CMS } = window as any;
  (window as any)._cmsConfig = cmsConfig;
  CMS.init({ config: cmsConfig });
  if (createClass && h) {
    const Preview = createPreviewComponent({
      createClass,
      h,
      cmsConfig,
    });
    cmsConfig.collections.forEach(({ name, files }) => {
      const char = name.charAt(0);
      if (char === '_' || char === '.') return;
      if (files) {
        files.forEach((file: Record<string, any>) => {
          CMS.registerPreviewTemplate(file.name, Preview);
        });
        return;
      }
      CMS.registerPreviewTemplate(name, Preview);
    });
  }
};

const authAndInitCms = async (storeData: CmsStoreData) => {
  const {
    location,
    sessionStorage,
    ECOM_STORE_ID,
    GIT_REPO,
    CMS_CUSTOM_CONFIG,
    CMS_SSO_URL = 'https://app.e-com.plus/pages/login?api_version=2',
  } = window;
  const getCmsConfig = ((window as any).getCmsConfig || _getCmsConfig) as
    typeof _getCmsConfig;
  cmsConfig = await getCmsConfig({ storeData });
  if (CMS_CUSTOM_CONFIG) {
    const deepmerge = Deepmerge();
    cmsConfig = deepmerge(cmsConfig, CMS_CUSTOM_CONFIG);
  }
  if (import.meta.env.DEV) {
    cmsConfig.local_backend = true;
    cmsConfig.backend = {
      repo: GIT_REPO || 'ecomplus/store',
      name: 'git-gateway',
    };
    initCmsWithPreview();
    return;
  }
  const tokenStorageKey = '__cms_token';
  let token = sessionStorage.getItem(tokenStorageKey);
  const repoStorageKey = '__cms_repo';
  let repository = sessionStorage.getItem(repoStorageKey);
  const searchParams = new URLSearchParams(location.search);
  const ssoToken = searchParams.get('sso_token') || searchParams.get('access_token');
  if (!cmsConfig.backend?.base_url) {
    if (!token && !ssoToken && CMS_SSO_URL) {
      const url = new URL(CMS_SSO_URL);
      url.searchParams.set('sso_store_id', `${ECOM_STORE_ID}`);
      url.searchParams.set('sso_redirect', location.href);
      location.href = url.toString();
      return;
    }
    cmsConfig.backend = {
      repo: GIT_REPO || '_owner/_name',
      api_root: `https://ecomplus.app/api/${ECOM_STORE_ID}/git/github`,
      name: 'github',
      base_url: `https://${location.hostname}`,
      auth_endpoint: location.pathname, // self
      branch: 'main',
      squash_merges: true,
      commit_messages: {
        create: 'Create {{collection}} “{{slug}}”',
        update: 'Update {{collection}} “{{slug}}”',
        delete: 'Delete {{collection}} “{{slug}}”',
        uploadMedia: 'Upload “{{path}}”',
        deleteMedia: '[skip ci] Delete “{{path}}”',
        openAuthoring: '{{message}}',
        ...cmsConfig.backend?.commit_messages,
      },
      ...cmsConfig.backend,
    };
    if (cmsConfig.publish_mode === undefined) {
      cmsConfig.publish_mode = 'editorial_workflow';
    }
    if (cmsConfig.backend.api_root?.startsWith('https://ecomplus.app/')) {
      if (!token) {
        const res = await afetch('https://ecomplus.app/api/github-installations', {
          headers: {
            'X-Store-ID': `${ECOM_STORE_ID}`,
            Authorization: `Bearer ${ssoToken}`,
          },
        });
        if (res.ok) {
          const { installations } = await res.json();
          if (Array.isArray(installations)) {
            const { repo } = cmsConfig.backend;
            const installation = repo !== '_owner/_name'
              ? installations.find((isnt) => isnt.repository === repo)
              : installations[0];
            if (installation?.gh_token && installation.gh_token.charAt(0) !== '*') {
              // Consume GitHub REST API directly
              token = installation.gh_token as string;
              if (repo === '_owner/_name') {
                repository = installation.repository
                  || `${installation.organization}/${installation.organization}`;
              }
            }
          }
        }
      }
      if (token) {
        delete cmsConfig.backend.api_root;
        cmsConfig.backend.name = 'github';
        if (repository) {
          cmsConfig.backend.repo = repository;
        }
      }
    }
  }
  if (token) {
    sessionStorage.setItem(tokenStorageKey, token);
    if (repository) {
      sessionStorage.setItem(repoStorageKey, repository);
    }
    // Ref.: https://github.com/decaporg/decap-cms/blob/e93c94f1ce707719dfb7750af82b17c38b461831/packages/decap-cms-lib-auth/src/netlify-auth.js#L46
    // E.g.: https://github.com/Herohtar/netlify-cms-oauth-firebase/blob/master/functions/index.js#L9-L25
    window.addEventListener('message', (event) => {
      if (event.data === 'authorizing:github') {
        setTimeout(() => {
          window.postMessage(
            `authorization:github:success:${JSON.stringify({
              token,
              provider: cmsConfig.backend.name,
            })}`,
            cmsConfig.backend.base_url,
          );
        }, 300);
      }
    }, false);
  }
  if (ssoToken) {
    window.history?.pushState(
      'hide-token',
      document.title,
      `${location.pathname}${location.hash}`,
    );
  }
  initCmsWithPreview();
};

if (!import.meta.env.SSR) {
  (window as any).CMS_MANUAL_INIT = true;
  if (window.opener?.location.hostname === window.location.hostname) {
    // Emulating GitHub OAuth popup
    window.opener.postMessage('authorizing:github', '*');
    window.close();
  } else {
    const storeData: CmsStoreData = {};
    const promises = ([
      'categories',
      'brands',
      'collections',
      'products',
    ] as const).map(async (resource) => {
      const isProducts = resource === 'products';
      return api.get(resource, {
        limit: isProducts ? 10 : 1000,
        sort: isProducts ? ['-sales'] : undefined,
        fields: ['_id', 'name', 'slug'] as const,
      }).then(({ data }) => {
        storeData[resource] = data.result;
      });
    });
    const startCms = async () => {
      await Promise.all(promises);
      authAndInitCms(storeData);
    };
    if (window.location.pathname.startsWith('/admin/')) {
      if (window.CMS) {
        startCms();
      } else {
        const cmsScript = document.createElement('script');
        cmsScript.src = 'https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js';
        cmsScript.onload = startCms;
        document.body.appendChild(cmsScript);
      }
    } else {
      (window as any).initCMS = startCms;
    }
  }
}
