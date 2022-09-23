# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.0.86](https://github.com/ecomplus/cloud-commerce/compare/v0.0.85...v0.0.86) (2022-09-23)


### Bug Fixes

* **storefront:** Add `DEPLOY_RAND` to transformed images URL for cache control ([6fdce8d](https://github.com/ecomplus/cloud-commerce/commit/6fdce8db91a2bede01ae40b1042175067a0ba9a6))
* **storefront:** Cannot use tailwind syntax (`theme` function) on Astro styles (yet) ([92109c9](https://github.com/ecomplus/cloud-commerce/commit/92109c9736384ce2158ed6bd0f5e5510934a5c16))

### [0.0.85](https://github.com/ecomplus/cloud-commerce/compare/v0.0.84...v0.0.85) (2022-09-23)


### Bug Fixes

* Add `fetch-polyfill` to `@cloudcommerce/api` named exports ([3dccc29](https://github.com/ecomplus/cloud-commerce/commit/3dccc29fbcb6669aa7a2896b8354046c398512f2))

### [0.0.84](https://github.com/ecomplus/cloud-commerce/compare/v0.0.83...v0.0.84) (2022-09-23)


### Features

* **api:** Add `types` named export with resource type defs ([a2b8e0a](https://github.com/ecomplus/cloud-commerce/commit/a2b8e0a3b770b37feb9be34fa13d1d3243109b63))
* **api:** Optionally cache API responses (enabled by default with 10min TTL on SSR) ([7d765b1](https://github.com/ecomplus/cloud-commerce/commit/7d765b12aa1e0951b07f1982562e21992416be12))
* **storefront:** Add bg+color utilities for brand ad contrast on Tailwind/UnoCSS ([e5eec68](https://github.com/ecomplus/cloud-commerce/commit/e5eec684acb03f4b031225cdd5925e7d03170751))
* **storefront:** Add new surface colors CSS vars ([89dfaf6](https://github.com/ecomplus/cloud-commerce/commit/89dfaf6756a5b92812edd189ac3218d2f8dd36ae))
* **storefront:** First `TopVar.vue` component :tada: ([2a9bf20](https://github.com/ecomplus/cloud-commerce/commit/2a9bf20c76173c35b45be28fae222d64d6d9e369))
* **storefront:** Start rendering header with transformed image logo ([df65efd](https://github.com/ecomplus/cloud-commerce/commit/df65efdc44298b3f50897150121bd0fb8475c252))


### Bug Fixes

* **storefront:** Fix surface color on Tailwind theme, Tailwind config must be CJS ([18de9f0](https://github.com/ecomplus/cloud-commerce/commit/18de9f0d456d2cd8dce84f0bcae770ddc7b83f52))
* **storefront:** Properly setting yiq and rgb brand colors variants ([8bccbae](https://github.com/ecomplus/cloud-commerce/commit/8bccbae4aa709b00d0e63b26332f81964cb613f1))
* **storefront:** Set `apiState[endpoint]` with `data.result` on list requests ([d1353c2](https://github.com/ecomplus/cloud-commerce/commit/d1353c26cb7740cc4212eab5f3f93943ecec56d7))
* **storefront:** Update Astro and other non-major dependencies ([a63aed9](https://github.com/ecomplus/cloud-commerce/commit/a63aed93caa453956cb4f219ec3b5584f54fde9d))

### [0.0.83](https://github.com/ecomplus/cloud-commerce/compare/v0.0.82...v0.0.83) (2022-09-19)


### Features

* **storefront:** Advanced SW cache strategies based on current `@ecomplus/storefront-framework` ([3b6b6ae](https://github.com/ecomplus/cloud-commerce/commit/3b6b6ae35e449ccf29ad07b67b74dbfaf409f16a))
* **storefront:** Properly setup web manifest for PWA ([b2c3f1e](https://github.com/ecomplus/cloud-commerce/commit/b2c3f1e56fe3acfebd5990e0fce73007786da6d4)), closes [#L262-L282](https://github.com/ecomplus/cloud-commerce/issues/L262-L282)


### Bug Fixes

* **deps:** Update all non-major dependencies ([#50](https://github.com/ecomplus/cloud-commerce/issues/50)) ([f14b07c](https://github.com/ecomplus/cloud-commerce/commit/f14b07c3c35dc62d52a1c102b001611f85e51080))

### [0.0.82](https://github.com/ecomplus/cloud-commerce/compare/v0.0.81...v0.0.82) (2022-09-17)


### Features

* **storefront:** Trying basic PWA setup with `vite-plugin-pwa` ([5ddab09](https://github.com/ecomplus/cloud-commerce/commit/5ddab09679d979e4cd52fc0ba1c8e9845178e521))


### Bug Fixes

* **storefront:** Add `must-revalidate` cache control to prevent browsers using stale ([bdaca35](https://github.com/ecomplus/cloud-commerce/commit/bdaca3548a8709590368565735c4cf02e20b2d5c))

### [0.0.81](https://github.com/ecomplus/cloud-commerce/compare/v0.0.80...v0.0.81) (2022-09-16)


### Bug Fixes

* **ssr:** Use `compression` pkg (middleware) to gzip ([714c8b3](https://github.com/ecomplus/cloud-commerce/commit/714c8b3f502082a6a395b40e7a792540cd9af861))

### [0.0.80](https://github.com/ecomplus/cloud-commerce/compare/v0.0.79...v0.0.80) (2022-09-16)

### [0.0.79](https://github.com/ecomplus/cloud-commerce/compare/v0.0.78...v0.0.79) (2022-09-16)


### Bug Fixes

* **ssr:** Hardset default function memory 256MiB ([ae250d8](https://github.com/ecomplus/cloud-commerce/commit/ae250d8532987f33ddd6320a60b2c02331dbc2c3))
* **storefront:** Update Astro, Vite and other non-major dependencies ([7ee3936](https://github.com/ecomplus/cloud-commerce/commit/7ee393694173a3c10c7fdaba1e069342845e90cd))

### [0.0.78](https://github.com/ecomplus/cloud-commerce/compare/v0.0.77...v0.0.78) (2022-09-15)


### Bug Fixes

* **storefront:** Cant use named imports from `@ecomplus/utils` yet ([d35a839](https://github.com/ecomplus/cloud-commerce/commit/d35a839cf7a881f8f7bdf71b64ce51154bd1be24))

### [0.0.77](https://github.com/ecomplus/cloud-commerce/compare/v0.0.76...v0.0.77) (2022-09-15)


### Bug Fixes

* **modules:** Set `concurrency: 6` for Modules API function by default ([70e8f70](https://github.com/ecomplus/cloud-commerce/commit/70e8f70a25c650eca2c404b9b039416e0db52cee))
* **ssr:** Try SSR function with 30s timeout and 128mb by default ([fd339e1](https://github.com/ecomplus/cloud-commerce/commit/fd339e1e21f54b1bbc20b90ed95f97faaf89c10e))
* **storefront:** Add `@ecomplus/utils` to direct dependencies ([c769252](https://github.com/ecomplus/cloud-commerce/commit/c76925272391eccdc4ee0c67003c347a7032c326))

### [0.0.76](https://github.com/ecomplus/cloud-commerce/compare/v0.0.75...v0.0.76) (2022-09-15)


### Features

* **storefront:** Add brand colors and variations to UnoCSS config (utils) ([6698930](https://github.com/ecomplus/cloud-commerce/commit/669893079f4f43a04a6a9518a074240b0a30c9eb))
* **storefront:** Add UnoCSS to Astro with attributify and icons preset ([7726a41](https://github.com/ecomplus/cloud-commerce/commit/7726a41155ec051942048c2e1b2535aaf4db9615))
* **storefront:** Finish porting meta tags and start theming ([379c9e6](https://github.com/ecomplus/cloud-commerce/commit/379c9e6448f6754e59879866ea8ccfd8ada015e4))
* **storefront:** Parse brand colors to CSS vars and add new layout slots ([bec435c](https://github.com/ecomplus/cloud-commerce/commit/bec435c88400732da64327497587a0c5c1190d09))
* **storefront:** Setup `window.storefront.context` with resource and minified doc ([8b7292d](https://github.com/ecomplus/cloud-commerce/commit/8b7292dcc0217a44479d7972a0428b66dfbf9a37))


### Bug Fixes

* **cli:** Update Firebase Hosting config to redirect /index to home by default ([dbc976d](https://github.com/ecomplus/cloud-commerce/commit/dbc976d5a9c9a29fd85bf345d480cc934dd7f6bc))
* **storefront:** Update UnoCSS config icons shortcuts ([26f2d35](https://github.com/ecomplus/cloud-commerce/commit/26f2d35266acc2ab259e0930e79c6d1e93d51c76))

### [0.0.75](https://github.com/ecomplus/cloud-commerce/compare/v0.0.74...v0.0.75) (2022-09-13)

### [0.0.74](https://github.com/ecomplus/cloud-commerce/compare/v0.0.73...v0.0.74) (2022-09-13)


### Features

* **cli:** Update default `firbase.json` config with cache headers ([d9e3e99](https://github.com/ecomplus/cloud-commerce/commit/d9e3e995e26ce75c8d19748313fa31d0982629e5))
* **storefront:** Initialize Firebase app with Analytics ([2a5fe36](https://github.com/ecomplus/cloud-commerce/commit/2a5fe36dea7d3c1b0bfeeb66dc4866e5c6c13cd0))


### Bug Fixes

* **modules:** Fix schemas to draft-07 and properly call module handler  ([#48](https://github.com/ecomplus/cloud-commerce/issues/48)) ([bd1fd5b](https://github.com/ecomplus/cloud-commerce/commit/bd1fd5b8e3f1b4c7f35ad66570f542738d388ac6))

### [0.0.73](https://github.com/ecomplus/cloud-commerce/compare/v0.0.72...v0.0.73) (2022-09-10)


### Bug Fixes

* **ssr:** Fix fallback and errors and skip cache/redirect handled by Astro SSR ([abe19ae](https://github.com/ecomplus/cloud-commerce/commit/abe19ae585698c7621aa3bc6cf26bbf8f816824a))
* **storefront:** Must prefetch defined API endpoints also for non-slug pages (home) ([c55f201](https://github.com/ecomplus/cloud-commerce/commit/c55f201c76b96c19c334c460df35baa5715ac5b1))
* **storefront:** Send `X-SSR-Error` with error message only ([7fafde1](https://github.com/ecomplus/cloud-commerce/commit/7fafde110ee9b6d9139b2ad0f7959826c1b08e74))

### [0.0.72](https://github.com/ecomplus/cloud-commerce/compare/v0.0.71...v0.0.72) (2022-09-09)


### Features

* **frenet:** Setup  Frenet app from https://github.com/ecomplus/app-frenet ([#47](https://github.com/ecomplus/cloud-commerce/issues/47)) ([465a8c8](https://github.com/ecomplus/cloud-commerce/commit/465a8c8232a2cfb1e46b2c0b176a0b3ec04e213c))
* **storefront:** Setup `loadPageContext` function and pages base SSR :tada: ([a7127be](https://github.com/ecomplus/cloud-commerce/commit/a7127be516eb87a7ac3f6221b717d9708f174d8a))


### Bug Fixes

* **config:** Check env and defaults on `get()` ([f466f3b](https://github.com/ecomplus/cloud-commerce/commit/f466f3be32edeefbb85a71699d884e629041c0cf))
* Remove `content` symlink to prevent clone error ([f35bd83](https://github.com/ecomplus/cloud-commerce/commit/f35bd835f3089d655dfee2b629dd1cda82ae3986))
* **ssr:** Fix handling SSR fallback for 5xx error ([fa280ea](https://github.com/ecomplus/cloud-commerce/commit/fa280ea5947946cb2820f8ca4a5c81ced20e25cc))
* **storefront:** Update `cms` function to consider folder collection if filename with / ([2d90a0a](https://github.com/ecomplus/cloud-commerce/commit/2d90a0a359e0cec617269c96274df289988d06d6))

### [0.0.71](https://github.com/ecomplus/cloud-commerce/compare/v0.0.70...v0.0.71) (2022-09-08)

### [0.0.70](https://github.com/ecomplus/cloud-commerce/compare/v0.0.69...v0.0.70) (2022-09-07)


### Bug Fixes

* **storefront:** Replace pre/post pack scripts with pre/post release on `package.json` ([a9b28a9](https://github.com/ecomplus/cloud-commerce/commit/a9b28a96c41223c81c2b6979c9feffeb9879b8c8))

### [0.0.69](https://github.com/ecomplus/cloud-commerce/compare/v0.0.68...v0.0.69) (2022-09-07)


### Bug Fixes

* **storefront:** Use `getConfig` function to properly handle env vars on `storefront.config.mjs` ([5bfdaea](https://github.com/ecomplus/cloud-commerce/commit/5bfdaea8454d8e2bdbd64bfbc49d6fbf798c2d9d))

### [0.0.68](https://github.com/ecomplus/cloud-commerce/compare/v0.0.67...v0.0.68) (2022-09-07)


### Features

* **ssr:** Setup SSR handler from `@ecomplus/storefron-renderer` ([0370347](https://github.com/ecomplus/cloud-commerce/commit/0370347fad1e03e0f5cb2bf9067dd8f438d8dd45))
* **storefront:** Load CMS content from Store dir ([1ad443c](https://github.com/ecomplus/cloud-commerce/commit/1ad443cbbf03bc3da7cee27ae085c751239eda12))


### Bug Fixes

* **cli:** Update Hosting public dir to Astro build default client output ([900de0d](https://github.com/ecomplus/cloud-commerce/commit/900de0d95517ac06ee101812d1b5330bca534ae8))
* **cli:** Update SSR function predeploy to also run `astro build` ([547e698](https://github.com/ecomplus/cloud-commerce/commit/547e698af86f69099d5f5bf37d52af394cc80838))
* **env:** Test `import.meta.env` to support Astro/Vite env variables ([bbfef3d](https://github.com/ecomplus/cloud-commerce/commit/bbfef3d92ed2bf8073279461613270709b3e76f5))

### [0.0.67](https://github.com/ecomplus/cloud-commerce/compare/v0.0.66...v0.0.67) (2022-09-05)


### Bug Fixes

* **deps:** Update all non-major dependencies ([#46](https://github.com/ecomplus/cloud-commerce/issues/46)) ([e70233d](https://github.com/ecomplus/cloud-commerce/commit/e70233d3d31c7e90cf5cc14b52dfd0d717a1d664))
* **events:** Fix handling events timestamp by resource and last run ([f34fe3c](https://github.com/ecomplus/cloud-commerce/commit/f34fe3cde3d0ea8d52ac89b370e9e77b0432177e))
* **events:** Properly filter by last non-orders check timestamp ([0d81267](https://github.com/ecomplus/cloud-commerce/commit/0d812675d9eea009c05afa89ec115ce24efa8911))

### [0.0.66](https://github.com/ecomplus/cloud-commerce/compare/v0.0.65...v0.0.66) (2022-09-05)


### Features

* **config:** New reusable/isolated `@cloudcoommerce/config` package ([64b482f](https://github.com/ecomplus/cloud-commerce/commit/64b482fff9f8087a38890b52ff0c6bb7c40f85f9))


### Bug Fixes

* **config:** Fix type defs for `@cloudcommerce/firebase` config ([f567851](https://github.com/ecomplus/cloud-commerce/commit/f567851e24d48162062e50cab77676c70b13e546))

### [0.0.65](https://github.com/ecomplus/cloud-commerce/compare/v0.0.64...v0.0.65) (2022-09-03)


### Features

* **custom-shipping:** Setup custom shipping app from github.com/ecomplus/app-custom-shipping/ ([78818ea](https://github.com/ecomplus/cloud-commerce/commit/78818ead244741bea2a2c02becb465863b087461))
* **modules:** Handle custom shipping calculation with internal package ([b555a12](https://github.com/ecomplus/cloud-commerce/commit/b555a12dc8e2d7b6b11a5993d0ba846e645ced9e))


### Bug Fixes

* **tiny-erp:** Prevent exporting order with same Tiny status ([8b22e1b](https://github.com/ecomplus/cloud-commerce/commit/8b22e1b18a6b0494c794bd21f4bf38dcf9f92dc4))

### [0.0.64](https://github.com/ecomplus/cloud-commerce/compare/v0.0.63...v0.0.64) (2022-09-02)


### Features

* **correios:** Setup Correios app from https://github.com/ecomplus/app-correios ([aa18bed](https://github.com/ecomplus/cloud-commerce/commit/aa18bed5193bfbcf7075614c5b41b7e84497efca))
* **modules:** Handle Correios calculate shipping with internal package ([88e6f7f](https://github.com/ecomplus/cloud-commerce/commit/88e6f7f30cedf35c9a05f0f4d24637946c21b3cf))


### Bug Fixes

* **api:** Update applications interface with `data?: { [k: string]: any }` instead of unknow ([a44a6c9](https://github.com/ecomplus/cloud-commerce/commit/a44a6c9d93a5550843115cad3cbcb2a231691b1b))
* **modules:** Also debug internal modules error responses ([9c89962](https://github.com/ecomplus/cloud-commerce/commit/9c89962924984b48cd52f308bc173c18a4a90939))

### [0.0.63](https://github.com/ecomplus/cloud-commerce/compare/v0.0.62...v0.0.63) (2022-08-31)


### Bug Fixes

* Group app (Tiny ERP) functions and fix name for CLoud Functions v2 limits ([a059056](https://github.com/ecomplus/cloud-commerce/commit/a0590564ce8e376c000ba02ccb3b2a94d31e3c0d))

### [0.0.62](https://github.com/ecomplus/cloud-commerce/compare/v0.0.61...v0.0.62) (2022-08-31)


### Bug Fixes

* Properly import `firebase-admin/firestore` ([5754bb0](https://github.com/ecomplus/cloud-commerce/commit/5754bb0f7378106b15f9f683597f78afeb92ba74))

### [0.0.61](https://github.com/ecomplus/cloud-commerce/compare/v0.0.60...v0.0.61) (2022-08-31)


### Features

* Add optional `tiny-erp-token` input to GH Action to improve Tiny webhooks performance ([0444f65](https://github.com/ecomplus/cloud-commerce/commit/0444f655b0a358979b14cee8ab85f0f018d08df3))


### Bug Fixes

* **tiny-erp:** Properly set and reuse `process.env.TINY_ERP_TOKEN` on webhooks ([4aee43a](https://github.com/ecomplus/cloud-commerce/commit/4aee43a3f067eb430c0c183eada27dca1b331fd3))

### [0.0.60](https://github.com/ecomplus/cloud-commerce/compare/v0.0.59...v0.0.60) (2022-08-30)


### Features

* **api:** Check auth from env vars `ECOM_AUTHENTICATION_ID` and `ECOM_API_KEY` ([0dce4e0](https://github.com/ecomplus/cloud-commerce/commit/0dce4e051e178d192e09130279071d6bd5c60e84))
* **events:** Get app data on events list (scheduled) and send on PubSub message [[#29](https://github.com/ecomplus/cloud-commerce/issues/29)] ([bcdeec1](https://github.com/ecomplus/cloud-commerce/commit/bcdeec173fc3b2ad747014d7e948c907b66f9030))
* **events:** Read API doc of respective event and send on Pub/Sub message [[#29](https://github.com/ecomplus/cloud-commerce/issues/29)] ([f8702e9](https://github.com/ecomplus/cloud-commerce/commit/f8702e9ac04c586420804da59afbe33c056be5f7))
* **firebase:** Create helpers to setup Pub/Sub on publish functions ([8e240c6](https://github.com/ecomplus/cloud-commerce/commit/8e240c6d9cb83ad2de4c2a980f9e8478ee32f842))
* Helper method to update app data on Store API and publish internal PubSub message [[#29](https://github.com/ecomplus/cloud-commerce/issues/29)] ([be7ab47](https://github.com/ecomplus/cloud-commerce/commit/be7ab47b8f5882a0a00da635dd9d2c034ee4ff6e))
* **tiny-erp:** Refactor Tiny ERP handlers from https://github.com/ecomplus/app-tiny-erp ([6530533](https://github.com/ecomplus/cloud-commerce/commit/6530533643dc055a4aad07e77dc1877aa75eaaf2))


### Bug Fixes

* **api:** Fix typedefs for authenticated methods (may use env vars) ([f4c51aa](https://github.com/ecomplus/cloud-commerce/commit/f4c51aa9bbcfd805cadfda106913c4b77e69ab28))
* **api:** Fix typedefs for authenticated methods with optional config ([c1938ae](https://github.com/ecomplus/cloud-commerce/commit/c1938aed2009f39165cd05c693dab949d3362d69))
* **deps:** Update all non-major dependencies ([#45](https://github.com/ecomplus/cloud-commerce/issues/45)) ([5fef410](https://github.com/ecomplus/cloud-commerce/commit/5fef410e87c8e8a30b728372b0745b623b4a00b9))
* **events:** Must read full `apiDoc` even on new document events ([b8cbac6](https://github.com/ecomplus/cloud-commerce/commit/b8cbac6258bd16ac867f23cd536817ffdb4ef807))
* **events:** Prevent handling multiple API events for same ID&topic at once ([f7e3ba3](https://github.com/ecomplus/cloud-commerce/commit/f7e3ba3177ec392b5d1103ca13a3b01046ad3f14))
* **events:** Remove generic `onNewOrder` function [[#29](https://github.com/ecomplus/cloud-commerce/issues/29)] ([3da6a26](https://github.com/ecomplus/cloud-commerce/commit/3da6a2649e3e92a561464a7d9ab68d7651be6344))
* **firebase:** Ensure fetch polyfill and Firebase app initialization before any function logic ([09f8ad2](https://github.com/ecomplus/cloud-commerce/commit/09f8ad21d4af03325f297485a0ceb6ecf3ec1126))

### [0.0.59](https://github.com/ecomplus/cloud-commerce/compare/v0.0.58...v0.0.59) (2022-08-24)


### Features

* **cli:** Use `GITHUB_TOKEN` env to auto set secrets on setup ([#43](https://github.com/ecomplus/cloud-commerce/issues/43)) ([8949070](https://github.com/ecomplus/cloud-commerce/commit/89490703cba52affdbb69c63d8b459cb609f5130))
* **events:** Start publishing PubSub messages for each topic/app/event [[#29](https://github.com/ecomplus/cloud-commerce/issues/29)] ([9575d25](https://github.com/ecomplus/cloud-commerce/commit/9575d25d4ca27fcc19acbd0118b0140f8b484316))


### Bug Fixes

* **cli:** Do not create `GH_TOKEN` secret (set by default) ([8e50e37](https://github.com/ecomplus/cloud-commerce/commit/8e50e371477bdf67ec0cef380f2c6488d3d588a5))
* **deps:** Add `@google-cloud/pubsub` to core `@cloudcommerce/firebase` dependencies ([0b35b0e](https://github.com/ecomplus/cloud-commerce/commit/0b35b0edb560329a21869e8b6a75abaed9c4cd34))
* **events:** Save last run state and timestamp to Firestore ([7183a55](https://github.com/ecomplus/cloud-commerce/commit/7183a55694ca0e5cc6968be9ca4e965772937e2a))
* Set default GCloud region to `southamerica-east1` (São Paulo) ([212d04d](https://github.com/ecomplus/cloud-commerce/commit/212d04d72ace4cffe54489dae5b74c2dbfa4e0d0))

### [0.0.58](https://github.com/ecomplus/cloud-commerce/compare/v0.0.57...v0.0.58) (2022-08-23)

### [0.0.57](https://github.com/ecomplus/cloud-commerce/compare/v0.0.56...v0.0.57) (2022-08-23)

### [0.0.56](https://github.com/ecomplus/cloud-commerce/compare/v0.0.55...v0.0.56) (2022-08-23)

### [0.0.55](https://github.com/ecomplus/cloud-commerce/compare/v0.0.54...v0.0.55) (2022-08-23)


### Features

* Also fetch customers resource events on Store API ([15fb1ec](https://github.com/ecomplus/cloud-commerce/commit/15fb1ec63641d768f7275f91269c99be6812bcea))
* **api:** Properly handle params fields as array of strings or numbers ([b66f688](https://github.com/ecomplus/cloud-commerce/commit/b66f6884baa0d26b0a3859a35eee41697a90ff64))
* **discounts:** Move discounts app handlers from https://github.com/ecomplus/discounts ([12f5aa3](https://github.com/ecomplus/cloud-commerce/commit/12f5aa3ef29a0faa787f4af55634cf15097d9c11))
* **events:** Start parsing events topics and checking active subscribers apps ([7a3aff1](https://github.com/ecomplus/cloud-commerce/commit/7a3aff17bc2d19c171d95fd3a1c5704927081376))
* **modules:** Check middleware functions on global scope for internal modules [[#29](https://github.com/ecomplus/cloud-commerce/issues/29)] ([8324659](https://github.com/ecomplus/cloud-commerce/commit/83246597059bedc74efafc3949d66430d383e58b))
* **types:** Enum new events topics ([9e154d7](https://github.com/ecomplus/cloud-commerce/commit/9e154d7154ef86b952d29ba661cf15a0345f82c6))


### Bug Fixes

* **deps:** Update all non-major dependencies ([#44](https://github.com/ecomplus/cloud-commerce/issues/44)) ([23a0c07](https://github.com/ecomplus/cloud-commerce/commit/23a0c07fb8fc0961a53f6319cf76f9a6657f88ff))
* **modules:** Catch internal module functions (or midd) errors ([b162d8d](https://github.com/ecomplus/cloud-commerce/commit/b162d8d190b8616a190e6d9db0f7cdb309dfa7a2))

### [0.0.54](https://github.com/ecomplus/cloud-commerce/compare/v0.0.53...v0.0.54) (2022-08-19)

### [0.0.53](https://github.com/ecomplus/cloud-commerce/compare/v0.0.52...v0.0.53) (2022-08-19)


### Bug Fixes

* **cli:** Fix GCloud IAM roles with temporary `serviceUsageAdmin` for first deploy ([3481f0c](https://github.com/ecomplus/cloud-commerce/commit/3481f0c2dc47fd5b25c321bf28d12ed1b6e5ffde))

### [0.0.52](https://github.com/ecomplus/cloud-commerce/compare/v0.0.51...v0.0.52) (2022-08-18)


### Features

* **cli:** Add `--no-gcloud` option to setup command to skip GCloud IAM ([bbe5ce2](https://github.com/ecomplus/cloud-commerce/commit/bbe5ce2813c4276783d86fdd577e746fa5ecda1d))
* Properly config Firebase Hosting to call modules/passport/ssr Cloud Functions ([b6e6540](https://github.com/ecomplus/cloud-commerce/commit/b6e6540d29895287e4149a4b3c160e118144074a))


### Bug Fixes

* **cli:** Fix GCloud IAM roles and properly check if service account already exists ([bb23dd0](https://github.com/ecomplus/cloud-commerce/commit/bb23dd049d992223285e8f51bc053d9fda775d10))

### [0.0.51](https://github.com/ecomplus/cloud-commerce/compare/v0.0.50...v0.0.51) (2022-08-17)


### Features

* **cli:** Create Google Cloud IAM account and key on setup ([#40](https://github.com/ecomplus/cloud-commerce/issues/40)) ([f532888](https://github.com/ecomplus/cloud-commerce/commit/f532888957c45ea6cfb6511840f33861ec53ed42))
* **passport:** Setup Passport API token endpoint handling Firebase Auth ([#38](https://github.com/ecomplus/cloud-commerce/issues/38)) ([bd7863d](https://github.com/ecomplus/cloud-commerce/commit/bd7863df4a8d6511ff7297987ff23a81993c70ad))
* **types:** Add `AppModuleBody` object definition ([b4a1fbd](https://github.com/ecomplus/cloud-commerce/commit/b4a1fbdf2b2b034408cab83a555c5b7bbcc4c3f8))


### Bug Fixes

* **api:** Update applications schema interface ([af7e152](https://github.com/ecomplus/cloud-commerce/commit/af7e152932a9ee9343cf4e7cc10ec886d47cd2b7))
* **cli:** Must deploy with `--force` option for functions failure police ([384d28a](https://github.com/ecomplus/cloud-commerce/commit/384d28a7406130058112b2f31ece4a81aa6ccfe7))
* **cli:** Properly run deploy with `--force` option ([d4d8f18](https://github.com/ecomplus/cloud-commerce/commit/d4d8f18cfbabbc61abc360d4649d7db03671da09))
* **cli:** Setup authentication with almost all permissions ([6f0ccb6](https://github.com/ecomplus/cloud-commerce/commit/6f0ccb6e7852f5c4542f02550ee84d02bd308115))
* Config getter/setter to work on browser and node ([fedc4c8](https://github.com/ecomplus/cloud-commerce/commit/fedc4c88e2d71a02df0ca87ceade856e489b2a2e))
* **deps:** Bump astro stable v1 ([8f4d3cb](https://github.com/ecomplus/cloud-commerce/commit/8f4d3cbf43dff334e53150a93df1c0f40c1b9580))
* **deps:** Update all non-major dependencies ([#37](https://github.com/ecomplus/cloud-commerce/issues/37)) ([5f5bb37](https://github.com/ecomplus/cloud-commerce/commit/5f5bb37a8f2e4477a0a76e564fcdf207df08cada))
* **deps:** Update all non-major dependencies ([#39](https://github.com/ecomplus/cloud-commerce/issues/39)) ([56e684d](https://github.com/ecomplus/cloud-commerce/commit/56e684d3eaddc8f00b789ca8d429330b69bc26c7))
* Keep old (discounts) apps IDs for backport compatibility ([28833af](https://github.com/ecomplus/cloud-commerce/commit/28833af45137a1ffd074900d5caf6946dfb4b49a)), closes [#L2](https://github.com/ecomplus/cloud-commerce/issues/L2)
* **modules:** Must call insternal apps passing module body (data) ([42d6d1d](https://github.com/ecomplus/cloud-commerce/commit/42d6d1d2464ee7fcd7d81e79ac777dc11eb85889))
* **passport:** Consider valid tokens stored with at least 2 min to expire ([ac2b0b8](https://github.com/ecomplus/cloud-commerce/commit/ac2b0b88645b45dfa2c2d3dda49832b15537e711))
* Stop hiding cloud commerce default API key ([f4389f7](https://github.com/ecomplus/cloud-commerce/commit/f4389f7b3d82960305f1ef34bdb3c5e83c4ce11a))

### [0.0.50](https://github.com/ecomplus/cloud-commerce/compare/v0.0.49...v0.0.50) (2022-08-07)

### [0.0.49](https://github.com/ecomplus/cloud-commerce/compare/v0.0.48...v0.0.49) (2022-08-07)


### Features

* Add events functions codebase to default Firebase config ([60e224c](https://github.com/ecomplus/cloud-commerce/commit/60e224c600b873e674960c347bc70bb5ae3a46cd))

### [0.0.48](https://github.com/ecomplus/cloud-commerce/compare/v0.0.47...v0.0.48) (2022-08-07)

### [0.0.47](https://github.com/ecomplus/cloud-commerce/compare/v0.0.46...v0.0.47) (2022-08-07)


### Features

* Setup app auth callback function to handle installation callback ([12d5780](https://github.com/ecomplus/cloud-commerce/commit/12d57808a8d742b4a29ac2ce3ea1ae3a5af836dc))


### Bug Fixes

* **events:** Add root `firebase.js` as complement to pkg named export ([178fd8c](https://github.com/ecomplus/cloud-commerce/commit/178fd8c128ed55b098a28abe70e6c5385043ec89))
* Set `ECOM_STORE_ID` env from `config.storeId` ([65e806e](https://github.com/ecomplus/cloud-commerce/commit/65e806ee2228392cfa3c9c6a58537e6248d1f862))

### [0.0.46](https://github.com/ecomplus/cloud-commerce/compare/v0.0.45...v0.0.46) (2022-08-05)


### Bug Fixes

* Set Firebase Functions v2 names with one word at all ([23d5f17](https://github.com/ecomplus/cloud-commerce/commit/23d5f17bbeca0bccc14047c6a5fa4a92753ae9b8))

### [0.0.45](https://github.com/ecomplus/cloud-commerce/compare/v0.0.44...v0.0.45) (2022-08-05)


### Bug Fixes

* GH Action must install dependencies of each functions codebase ([0e1212a](https://github.com/ecomplus/cloud-commerce/commit/0e1212a61c455de0e1b698e9086c1df2a6c24fd7))
* GH Action must install dependencies of each functions codebase ([7379f0e](https://github.com/ecomplus/cloud-commerce/commit/7379f0e01e9ce94a666735e12dd38a29f090d238))
* GH Action must install optional dependencies for functions deploy ([59b281e](https://github.com/ecomplus/cloud-commerce/commit/59b281e74346dbe360c2810eb9749304214df17c))
* Set Firebase Functions names with snake case ([2ec6a31](https://github.com/ecomplus/cloud-commerce/commit/2ec6a31a42cd7692f5b004d65dff6d2e0b3bad30))

### [0.0.44](https://github.com/ecomplus/cloud-commerce/compare/v0.0.43...v0.0.44) (2022-08-05)


### Features

* **apps/discounts:** Start exporting apply discount function for module [[#29](https://github.com/ecomplus/cloud-commerce/issues/29)] ([a4ca745](https://github.com/ecomplus/cloud-commerce/commit/a4ca745ac69318e2c2ba1b4e94e68f37924b0682))
* **events:** Setup `@cloudcommerce/events` pkg with first listener start [[#29](https://github.com/ecomplus/cloud-commerce/issues/29)] ([3a4ae39](https://github.com/ecomplus/cloud-commerce/commit/3a4ae3996066ece4c502d55b39f79f9fab20fee3))
* **firebase:** Start defining apps on config with first (discount) app [[#29](https://github.com/ecomplus/cloud-commerce/issues/29)] ([8a810cf](https://github.com/ecomplus/cloud-commerce/commit/8a810cf45ad41c29adb14e111dccd63afd71b63c))
* **modules:** Start importing/calling internal apps dynamically [[#29](https://github.com/ecomplus/cloud-commerce/issues/29)] ([47db241](https://github.com/ecomplus/cloud-commerce/commit/47db24193c3423851246e691604a5e9f691c9077))
* **types:** Add `AppModuleName` enum definition ([642235c](https://github.com/ecomplus/cloud-commerce/commit/642235cf789d11b3208526a87bd7fc72e2dd38e4))


### Bug Fixes

* **cli:** Prevent no such file error with optional `.env` on build ([201f30e](https://github.com/ecomplus/cloud-commerce/commit/201f30e6ce365ff01ae46dad83a8dfa899b6b91a))
* **types:** Edit some app events types (grammar) ([a552efa](https://github.com/ecomplus/cloud-commerce/commit/a552efa08b0eba6e25292f0a64a2a269bb812adb))

### [0.0.43](https://github.com/ecomplus/cloud-commerce/compare/v0.0.42...v0.0.43) (2022-08-04)


### Features

* **api:** Export types `ApiEndpoint` and `ApiConfig` ([056f6b4](https://github.com/ecomplus/cloud-commerce/commit/056f6b48d5add05aea7a437674b42a88061acd44))
* **api:** Parse error response and return `error.data` ([b37e561](https://github.com/ecomplus/cloud-commerce/commit/b37e56161ab5673028d4e14d5645bc64bbf9ccbd))
* **firebase:** Add `./lib/env` to pkg named exports ([31e9d0d](https://github.com/ecomplus/cloud-commerce/commit/31e9d0d0841f3e5a7e15f7e16babdeace4bf32b8))
* **modules:** Setup Modules API function ([2a58363](https://github.com/ecomplus/cloud-commerce/commit/2a58363b7e3bc0a3a4e19c1278a0d366deb6f393))


### Bug Fixes

* **api:** Fix config params typedef to accept booleans ([d14ca33](https://github.com/ecomplus/cloud-commerce/commit/d14ca33cc9ad66f185856fed4fa0b11d32c192f7))

### [0.0.42](https://github.com/ecomplus/cloud-commerce/compare/v0.0.41...v0.0.42) (2022-08-02)

### [0.0.41](https://github.com/ecomplus/cloud-commerce/compare/v0.0.40...v0.0.41) (2022-08-02)


### Bug Fixes

* **deps:** Update all non-major dependencies ([#35](https://github.com/ecomplus/cloud-commerce/issues/35)) ([77dcab8](https://github.com/ecomplus/cloud-commerce/commit/77dcab840825e3ca05a05ccd9998a0e8012c9125))

### [0.0.40](https://github.com/ecomplus/cloud-commerce/compare/v0.0.39...v0.0.40) (2022-07-29)

### [0.0.39](https://github.com/ecomplus/cloud-commerce/compare/v0.0.38...v0.0.39) (2022-07-29)

### [0.0.38](https://github.com/ecomplus/cloud-commerce/compare/v0.0.37...v0.0.38) (2022-07-28)


### Bug Fixes

* Add root `firebase.js` as complement to pkg named export to prevent no-unresolved eslint error ([a65587b](https://github.com/ecomplus/cloud-commerce/commit/a65587b840015aa9224df2458eb5b10385002c81))
* **firebase:** Edit `/config` pkg export to `./lib/config.js` to get TS declaration ([b873572](https://github.com/ecomplus/cloud-commerce/commit/b873572e16162094249f6bdc6a25ec8c1b344111))

### [0.0.37](https://github.com/ecomplus/cloud-commerce/compare/v0.0.36...v0.0.37) (2022-07-27)


### Features

* **passport:** Setup `@cloudcommerce/passport` pkg for passport API (customers authentication) ([00a5c4b](https://github.com/ecomplus/cloud-commerce/commit/00a5c4bfb08083a770a9148377e506b920037242))
* **ssr:** Setup `@cloudcommerce/ssr` pkg to deploy isolated function ([59b8686](https://github.com/ecomplus/cloud-commerce/commit/59b8686efece3256b7a3809762601d4949d116f3))


### Bug Fixes

* **firebase:** Proper named imports from `firebase-admin` (cjs) package ([74aca73](https://github.com/ecomplus/cloud-commerce/commit/74aca73a76431d7d8f3f3e5c862085284cb2a6bd))
* **firebase:** Remove (test only) z function and ssr (moved to `@cloudcommerce/ssr`) ([dc8b8e5](https://github.com/ecomplus/cloud-commerce/commit/dc8b8e5d706f535806b306d8b24c34e4acdf8d7f))
* **modules:** Add `/firebase` named export to package.json ([0d3520f](https://github.com/ecomplus/cloud-commerce/commit/0d3520fc9b24877af5b14127e168ad2280b8ca4e))

### [0.0.36](https://github.com/ecomplus/cloud-commerce/compare/v0.0.35...v0.0.36) (2022-07-27)

### [0.0.35](https://github.com/ecomplus/cloud-commerce/compare/v0.0.34...v0.0.35) (2022-07-27)


### Bug Fixes

* **modules:** Prevent cyclic dependencies moving types to `@cloudcommerce/types` pkg ([52f46ab](https://github.com/ecomplus/cloud-commerce/commit/52f46ab0332050b8e661e47c400a8084728d47e8))

### [0.0.34](https://github.com/ecomplus/cloud-commerce/compare/v0.0.33...v0.0.34) (2022-07-27)


### Features

* **cli:** Suggest `npx kill-port` on serve "port taken" error ([99f955e](https://github.com/ecomplus/cloud-commerce/commit/99f955eeb1f11664a988d969c48de217921f35fd))
* **deps:** Update astro to RC and vite v3 ([4336f81](https://github.com/ecomplus/cloud-commerce/commit/4336f81d18d82654f638ba25fc618d6cb6612f24))
* **firebase:** Move base functions options (region) to config object ([b691149](https://github.com/ecomplus/cloud-commerce/commit/b691149c3744d56f2f472f86218cf72c4bc56669))
* GH Action also pass optional `ecom-store-id` input to functions .env ([ed7771f](https://github.com/ecomplus/cloud-commerce/commit/ed7771fe50e987ffff120d4061c5c73f85e3f091))
* **modules:** Add new `@cloudcommerce/modules` pkg for app modules schema and typedefs [[#29](https://github.com/ecomplus/cloud-commerce/issues/29)] ([a7b833c](https://github.com/ecomplus/cloud-commerce/commit/a7b833c53cc814d89a8137aeb49bc3a41f87a2ce))
* **modules:** Start setting modules Firebase Functions ([53bb594](https://github.com/ecomplus/cloud-commerce/commit/53bb594585966c56cfa36a8cd35c17e50eb704a7))
* **types:** Add new `@cloudcommerce/types` pkg for reusable types ([a5ca712](https://github.com/ecomplus/cloud-commerce/commit/a5ca7127c80a48fdbca6fec1c14badfc078f5aa8))
* **types:** Also exporting modules params and responses type interfaces ([57c207c](https://github.com/ecomplus/cloud-commerce/commit/57c207cb6f7af3c8c0007173cc49859e4ecba1f3))
* **types:** New `@cloudcommerce/types` pkg with reusable types ([fa59792](https://github.com/ecomplus/cloud-commerce/commit/fa59792ccc322d1b6f23766daefe4278f671775c))


### Bug Fixes

* **deps:** Update all non-major dependencies ([#33](https://github.com/ecomplus/cloud-commerce/issues/33)) ([ac90a64](https://github.com/ecomplus/cloud-commerce/commit/ac90a64ca72fda97d30c3b214a801f5947267e12))

### [0.0.33](https://github.com/ecomplus/cloud-commerce/compare/v0.0.32...v0.0.33) (2022-07-20)


### Bug Fixes

* **firecase:** Add `node-fetch` to pkg deps and import polyfill ([3ddf42f](https://github.com/ecomplus/cloud-commerce/commit/3ddf42f7369e20c1e63f4b6612d1688134556d97))

### [0.0.32](https://github.com/ecomplus/cloud-commerce/compare/v0.0.31...v0.0.32) (2022-07-20)


### Bug Fixes

* **firebase:** Get `process.env` on function handler only ([2095621](https://github.com/ecomplus/cloud-commerce/commit/209562152d31a4f31104502897af2f2330c3330f))

### [0.0.31](https://github.com/ecomplus/cloud-commerce/compare/v0.0.30...v0.0.31) (2022-07-20)


### Bug Fixes

* GH Action must get credentials from inputs (`secrets` unrecognized) ([482f82b](https://github.com/ecomplus/cloud-commerce/commit/482f82bc4ff3ddc73445b4ffbbf5bf9655cf7de2))

### [0.0.30](https://github.com/ecomplus/cloud-commerce/compare/v0.0.29...v0.0.30) (2022-07-20)


### Features

* **firebase:** Start listing stor eevents (orders, carts, products) with new cron function ([2eb0616](https://github.com/ecomplus/cloud-commerce/commit/2eb06168b03e7cd751c58001cf36c8253da040d7))
* GH Action setup functions .env with repo secrets ([98bf2a2](https://github.com/ecomplus/cloud-commerce/commit/98bf2a2ba25edd45da32555fa6e18fab3b459be8))


### Bug Fixes

* **cli:** Do not change `config.json with `--no-commit` option ([f94ca57](https://github.com/ecomplus/cloud-commerce/commit/f94ca5740d16412a0c07537d512632f5d12a5904))

### [0.0.29](https://github.com/ecomplus/cloud-commerce/compare/v0.0.28...v0.0.29) (2022-07-17)

### [0.0.28](https://github.com/ecomplus/cloud-commerce/compare/v0.0.27...v0.0.28) (2022-07-17)


### Features

* **api:** Handle authentication for mutation requests ([03e1dea](https://github.com/ecomplus/cloud-commerce/commit/03e1dea512956bea74df5325c0e80e26492e00a6))
* **api:** Match resource on list endpoint with optional query string ([11d0e8d](https://github.com/ecomplus/cloud-commerce/commit/11d0e8d71371897c88dedb24b64a693d4089df06))
* **api:** Properly handle post, put and patch with body ([49adf9a](https://github.com/ecomplus/cloud-commerce/commit/49adf9a01bef2098296091b6ff6b3f59ffec139f))
* **cli:** Handle setup command to login to E-Com Plus and create base Cloud Commerce authentication ([636eedb](https://github.com/ecomplus/cloud-commerce/commit/636eedb92fd74015e065677b9ea68a15a8398ed5))


### Bug Fixes

* **api:** Add 'authentications' resource to types ([8be86f2](https://github.com/ecomplus/cloud-commerce/commit/8be86f231d559777e1cf97cda945ec9fa55bc68f))
* **api:** Do not reassign original `config.headers` object ([f26e2aa](https://github.com/ecomplus/cloud-commerce/commit/f26e2aa008d3a947190ade6f599876f371512306))
* **api:** Fix login response typedef ([3348558](https://github.com/ecomplus/cloud-commerce/commit/334855861bf8b6b55dc5d9b6e44d0cc230aca3d3))
* **api:** Fix typedefs for authenticate and subresource (nested) endpoints ([675d6fd](https://github.com/ecomplus/cloud-commerce/commit/675d6fdc90f5d182c4e170f7d8f6fbc43afecda8))
* **api:** Fix typedefs for authentications list and read ([84abfc3](https://github.com/ecomplus/cloud-commerce/commit/84abfc31069dc4dcaedf59941a75321964844715))
* **api:** Improve resources types Object IDs ([05e3c98](https://github.com/ecomplus/cloud-commerce/commit/05e3c987a77a0a3efc729d676feb60ba0541cb34))
* **api:** Skip setting Store ID and lang on auth endpoints ([6f3be2a](https://github.com/ecomplus/cloud-commerce/commit/6f3be2a6ffb49c608030715545f12b5b3ed93de4))

### [0.0.27](https://github.com/ecomplus/cloud-commerce/compare/v0.0.26...v0.0.27) (2022-07-13)


### Features

* **firebase:** Try to debug concurrency at function z `/pid` ([f9447ca](https://github.com/ecomplus/cloud-commerce/commit/f9447ca38e9669a8caedc08e5ce015428c92ce22))

### [0.0.26](https://github.com/ecomplus/cloud-commerce/compare/v0.0.25...v0.0.26) (2022-07-13)


### Bug Fixes

* **firebase:** Use Cloud Functions v2, update initial functions (ssr, z*) and deploy region ([6f73696](https://github.com/ecomplus/cloud-commerce/commit/6f736961cbb76b6576d72dd27bcf5f8245f53ead))

### [0.0.25](https://github.com/ecomplus/cloud-commerce/compare/v0.0.24...v0.0.25) (2022-07-13)


### Features

* **firebase:** Setup initial (test) functions and config getter and setter ([420622e](https://github.com/ecomplus/cloud-commerce/commit/420622ee6292ecfacb29bb4eddbad5781657e23c))

### [0.0.24](https://github.com/ecomplus/cloud-commerce/compare/v0.0.23...v0.0.24) (2022-07-10)


### Features

* **cli:** Also create `.firebaserc` when `FIREBASE_PROJECT_ID` env passed (first deploy) ([7048e59](https://github.com/ecomplus/cloud-commerce/commit/7048e5961765bbd2240add5007c935518d990a0d))
* **cli:** Get Firebase project ID from `.firebaserc` or GOOGLE_APPLICATION_CREDENTIALS env (CI) ([53e4053](https://github.com/ecomplus/cloud-commerce/commit/53e40534446f1439e06d0983e32c72e6b9d6ecb5))

### [0.0.23](https://github.com/ecomplus/cloud-commerce/compare/v0.0.22...v0.0.23) (2022-07-09)


### Bug Fixes

* GH Action also install functions dependencies to deploy ([9321030](https://github.com/ecomplus/cloud-commerce/commit/93210305453b10174a0c586e70614f5d869e46ab))

### [0.0.22](https://github.com/ecomplus/cloud-commerce/compare/v0.0.21...v0.0.22) (2022-07-09)


### Bug Fixes

* **cli:** Run `firebase` instead of `npx firebase-tools` ([f0f4be5](https://github.com/ecomplus/cloud-commerce/commit/f0f4be5f55fa6552dc9ed142b253f8119defb296))
* **gh-action:** Install `firebase-tools` with specific semver ([51e175f](https://github.com/ecomplus/cloud-commerce/commit/51e175f5c4227badcb868a9ee2bdaaa09b3b0017))

### [0.0.21](https://github.com/ecomplus/cloud-commerce/compare/v0.0.20...v0.0.21) (2022-07-09)


### Bug Fixes

* **deps:** Update dependency firebase-admin to v11 ([#27](https://github.com/ecomplus/cloud-commerce/issues/27)) ([a258b84](https://github.com/ecomplus/cloud-commerce/commit/a258b84cb26415063b7807a42b8eb937d2ff8452))
* **gh-action:** Checks `github.event_name` instead of branch to decide live or preview ([b0affe6](https://github.com/ecomplus/cloud-commerce/commit/b0affe6069e23bc57b4b9ce5ff86992430f0f52e))

### [0.0.20](https://github.com/ecomplus/cloud-commerce/compare/v0.0.19...v0.0.20) (2022-06-29)

### [0.0.19](https://github.com/ecomplus/cloud-commerce/compare/v0.0.18...v0.0.19) (2022-06-29)


### Features

* **cli:** Copy Firebase config files before running command ([210d9d5](https://github.com/ecomplus/cloud-commerce/commit/210d9d52c1e1fb1b61d5716382e325b96aaf5f67))

### [0.0.18](https://github.com/ecomplus/cloud-commerce/compare/v0.0.17...v0.0.18) (2022-06-29)

### [0.0.17](https://github.com/ecomplus/cloud-commerce/compare/v0.0.16...v0.0.17) (2022-06-29)

### [0.0.16](https://github.com/ecomplus/cloud-commerce/compare/v0.0.14...v0.0.16) (2022-06-29)


### Features

* **cli:** Setup pkg bin and run basic commands with `firebase-tools` ([5904747](https://github.com/ecomplus/cloud-commerce/commit/5904747b2fe13629f15a9bb9f1f2d581e2d8d972))


### Bug Fixes

* **firebase:** Move Firebase functions deps to `@cloudcommerce/firebase` ([a13ad01](https://github.com/ecomplus/cloud-commerce/commit/a13ad0147500092fd618d8b8294fa0140f9b0976))

### [0.0.15](https://github.com/ecomplus/cloud-commerce/compare/v0.0.14...v0.0.15) (2022-06-29)


### Features

* **cli:** Setup pkg bin and run basic commands with `firebase-tools` ([5904747](https://github.com/ecomplus/cloud-commerce/commit/5904747b2fe13629f15a9bb9f1f2d581e2d8d972))


### Bug Fixes

* **firebase:** Move Firebase functions deps to `@cloudcommerce/firebase` ([a13ad01](https://github.com/ecomplus/cloud-commerce/commit/a13ad0147500092fd618d8b8294fa0140f9b0976))

### [0.0.14](https://github.com/ecomplus/cloud-commerce/compare/v0.0.13...v0.0.14) (2022-06-24)


### Bug Fixes

* **pkgs:** Release with `pnpm` to fix workspace dependencies versions ([b005ab7](https://github.com/ecomplus/cloud-commerce/commit/b005ab7f7a9a2142d0ec0418b9549331372b82d9))

### [0.0.13](https://github.com/ecomplus/cloud-commerce/compare/v0.0.12...v0.0.13) (2022-06-24)

### [0.0.12](https://github.com/ecomplus/cloud-commerce/compare/v0.0.11...v0.0.12) (2022-06-24)

### [0.0.11](https://github.com/ecomplus/cloud-commerce/compare/v0.0.10...v0.0.11) (2022-06-24)

### [0.0.10](https://github.com/ecomplus/cloud-commerce/compare/v0.0.9...v0.0.10) (2022-06-24)

### [0.0.9](https://github.com/ecomplus/cloud-commerce/compare/v0.0.8...v0.0.9) (2022-06-24)

### [0.0.8](https://github.com/ecomplus/cloud-commerce/compare/v0.0.7...v0.0.8) (2022-06-21)


### Bug Fixes

* Explictly set packages `"type": "module"` ([dcaffce](https://github.com/ecomplus/cloud-commerce/commit/dcaffcecf78d30cd480f1cf2794eb61afaeba5bf))

### [0.0.7](https://github.com/ecomplus/cloud-commerce/compare/v0.0.6...v0.0.7) (2022-06-21)


### Features

* **api:** Add `fetch` option to config ([9ca0f68](https://github.com/ecomplus/cloud-commerce/commit/9ca0f681b003132574a6f147d406c8dddab93261))
* **api:** Add events, slug, search and auth endpoints to type ([9d4f712](https://github.com/ecomplus/cloud-commerce/commit/9d4f71217e73e22b941cfea855416a86e7bbc9a2))
* **api:** New (exported) `ApiError` class ([8e88494](https://github.com/ecomplus/cloud-commerce/commit/8e884944505caf3861aef4bce440f7fd0ed937a4))
* **api:** Type definiftion for list requests (`/${resource}`) ([21d71ff](https://github.com/ecomplus/cloud-commerce/commit/21d71ff56ac1220d16324f1018a9804b7f5cf3c3))


### Bug Fixes

* **api:** Event `timestamp` retrieved as date iso string (not object) ([aa18cc7](https://github.com/ecomplus/cloud-commerce/commit/aa18cc7e8cf0d8fb3345da7e48ddc15f4bb2209e))

### [0.0.6](https://github.com/ecomplus/cloud-commerce/compare/v0.0.5...v0.0.6) (2022-06-16)


### Features

* **api:** New config option `maxRetries` (default 3) to retry on 429 and 5xx errors ([35c5287](https://github.com/ecomplus/cloud-commerce/commit/35c5287545a79bd15596f96e88bdb7d98c056183))

### [0.0.5](https://github.com/ecomplus/cloud-commerce/compare/v0.0.4...v0.0.5) (2022-06-16)


### Features

* **api:** Error object (not 2xx) includes `statusCode` property (as Fastify errors) ([a9681f2](https://github.com/ecomplus/cloud-commerce/commit/a9681f23ceb9b007f90e95351ca133fdac865f1b))


### Bug Fixes

* **api:** Config object is optional on abstracted method functions ([2eebbe7](https://github.com/ecomplus/cloud-commerce/commit/2eebbe771971b5ac87b85f6068a36d7e1f647aba))
* **api:** Resolve with resource type on read without method (get is default) ([52b1a9b](https://github.com/ecomplus/cloud-commerce/commit/52b1a9b7cb48210b155ac620eaa6b3c8d95d681e))

### [0.0.4](https://github.com/ecomplus/cloud-commerce/compare/v0.0.3...v0.0.4) (2022-06-15)


### Bug Fixes

* **api:** Fix adding `:storeId` to default API base URL ([d424760](https://github.com/ecomplus/cloud-commerce/commit/d4247602168078acc0b05f5d1bbf5980f636bd71))
* **api:** No `procedures` and `triggers` resources on Store API v2 (remove from default types) ([66281d4](https://github.com/ecomplus/cloud-commerce/commit/66281d41f25a707fabda2233d2404724ba6b53f4))

### [0.0.3](https://github.com/ecomplus/cloud-commerce/compare/v0.0.2...v0.0.3) (2022-06-14)


### Features

* **api:** Add `timeout` req option with 20s default ([9544225](https://github.com/ecomplus/cloud-commerce/commit/954422567d1e77c95522e7c02758cb4fda6cbfd0))
* **api:** Set response body type for each resource on read by id ([7330537](https://github.com/ecomplus/cloud-commerce/commit/733053770cd62a7f07ee6753e06b461e168e25da))


### Bug Fixes

* **api:** Fix success payload with full fetch response object ([083b51d](https://github.com/ecomplus/cloud-commerce/commit/083b51da0864c040b323b26d5635b574bbbb26bf))

### [0.0.2](https://github.com/ecomplus/cloud-commerce/compare/v0.0.2-alpha.0...v0.0.2) (2022-06-11)

### [0.0.2-alpha.0](https://github.com/ecomplus/cloud-commerce/compare/v1.0.0-alpha.8...v0.0.2-alpha.0) (2022-06-11)


### Features

* **api:** Export HTTP methods for Store API with middleware ([1fe4e93](https://github.com/ecomplus/cloud-commerce/commit/1fe4e9374a3f77eaebdd261762d5db1d3e06f3e2))

## [1.0.0-alpha.8](https://github.com/ecomplus/cloud-commerce/compare/v1.0.0-alpha.7...v1.0.0-alpha.8) (2022-06-08)

## [1.0.0-alpha.7](https://github.com/ecomplus/cloud-commerce/compare/v1.0.0-alpha.6...v1.0.0-alpha.7) (2022-06-08)

## [1.0.0-alpha.6](https://github.com/ecomplus/cloud-commerce/compare/v1.0.0-alpha.4...v1.0.0-alpha.6) (2022-06-08)

## [1.0.0-alpha.5](https://github.com/ecomplus/cloud-commerce/compare/v1.0.0-alpha.4...v1.0.0-alpha.5) (2022-06-08)

## [1.0.0-alpha.4](https://github.com/ecomplus/cloud-commerce/compare/v1.0.0-alpha.3...v1.0.0-alpha.4) (2022-06-08)

## [1.0.0-alpha.3](https://github.com/ecomplus/cloud-commerce/compare/v1.0.0-alpha.2...v1.0.0-alpha.3) (2022-06-08)

## [1.0.0-alpha.2](https://github.com/ecomplus/cloud-commerce/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2022-06-08)

## [1.0.0-alpha.1](https://github.com/ecomplus/cloud-commerce/compare/v1.0.0-alpha.0...v1.0.0-alpha.1) (2022-06-08)

## 1.0.0-alpha.0 (2022-06-08)


### Features

* **api:** Add firt `list` method and fetch based on `API_STORE_ID` global ([346d142](https://github.com/ecomplus/cloud-commerce/commit/346d1421e4a4b40bbb045d99c2bd457fe1de6f5d))
