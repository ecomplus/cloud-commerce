import Deepmerge from '@fastify/deepmerge';
import afetch from '../../helpers/afetch';
import getCmsConfig from '../../decap-cms/get-cms-config';
import genPreviewContainer from '../../decap-cms/gen-preview-container';

let cmsConfig: Record<string, any> = getCmsConfig();
let ghToken: string | undefined;
const initCmsWithPreview = () => {
  const { React, CMS, WebContainer } = window as any as {
    React: any,
    CMS: Record<string, any>,
    WebContainer: any,
  };
  CMS.init({ config: cmsConfig });
  const Preview = genPreviewContainer({
    React,
    WebContainer,
    cmsConfig,
    ghToken,
  });
  CMS.registerPreviewTemplate('general', Preview);
};

const authAndInitCms = async () => {
  const {
    location,
    sessionStorage,
    ECOM_STORE_ID,
    GIT_REPO,
    CMS_SSO_URL = 'https://app.e-com.plus/pages/login?api_version=2',
  } = window;
  if (import.meta.env.DEV) {
    cmsConfig.local_backend = true;
    cmsConfig.backend = {
      repo: GIT_REPO || 'ecomplus/store',
      name: 'git-gateway',
    };
    initCmsWithPreview();
    return;
  }
  const storageKey = '__cms_token';
  let token = sessionStorage.getItem(storageKey);
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
      api_root: `https://ecomplus.app/api/${ECOM_STORE_ID}/git/github/`,
      name: 'github',
      base_url: `https://${location.hostname}`,
      auth_endpoint: location.pathname, // self
      branch: 'main',
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
    if (cmsConfig.backend.api_root?.startsWith('https://ecomplus.app/')) {
      const res = await afetch('https://ecomplus.app/api/github-installation', {
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
            ? installations.find(({ repository }) => repository === repo)
            : installations[0];
          if (installation?.gh_token && installation.gh_token.charAt(0) !== '*') {
            // Consume GitHub REST API directly
            token = installation.gh_token as string;
            ghToken = token;
            delete cmsConfig.backend.api_root;
            cmsConfig.backend.repo = installation.repository;
            cmsConfig.backend.name = 'github';
          }
        }
      }
    }
  }
  if (token) {
    sessionStorage.removeItem(storageKey);
    if (!window.opener) initCmsWithPreview();
    // Ref.: https://github.com/decaporg/decap-cms/blob/e93c94f1ce707719dfb7750af82b17c38b461831/packages/decap-cms-lib-auth/src/netlify-auth.js#L46
    // E.g.: https://github.com/Herohtar/netlify-cms-oauth-firebase/blob/master/functions/index.js#L9-L25
    const self = window.opener || window;
    setTimeout(() => {
      self.postMessage('authorizing:github', '*');
      self.postMessage(
        `authorization:github:success:${JSON.stringify({
          token,
          provider: cmsConfig.backend.name,
        })}`,
        cmsConfig.backend.base_url,
      );
    }, 100);
    return;
  }
  if (ssoToken) {
    window.history?.pushState(
      'hide-token',
      document.title,
      `${location.pathname}${location.search}${location.hash}`,
    );
    const provider = cmsConfig.backend.name;
    if (provider && provider !== 'git-gateway') {
      sessionStorage.setItem(storageKey, ssoToken);
    }
  }
  initCmsWithPreview();
};

if (!import.meta.env.SSR) {
  if (window.CMS_CUSTOM_CONFIG) {
    const deepmerge = Deepmerge();
    cmsConfig = deepmerge(cmsConfig, window.CMS_CUSTOM_CONFIG);
  }
  (window as any).CMS_MANUAL_INIT = true;
  /* eslint-disable import/no-unresolved */
  Promise.all([
    // @ts-ignore
    import(/* @vite-ignore */ 'https://esm.sh/react@^18'),
    // @ts-ignore
    import(/* @vite-ignore */ 'https://esm.sh/decap-cms-app@^3'),
    // @ts-ignore
    import(/* @vite-ignore */ 'https://esm.sh/@webcontainer/api@^1'),
  ])
    .then(([React, { default: CMS }, { WebContainer }]) => {
      (window as any).React = React;
      (window as any).CMS = CMS;
      (window as any).WebContainer = WebContainer;
      authAndInitCms();
    })
    .catch((err) => {
      console.error(err);
      // eslint-disable-next-line
      window.alert('Failed importing Decap CMS app or preview dependencies');
    });
}
