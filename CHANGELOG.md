# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [2.29.5](https://github.com/ecomplus/cloud-commerce/compare/v2.29.4...v2.29.5) (2024-10-23)


### Bug Fixes

* **ssr:** Properly decoding unit8array streamed writes for HTML minification ([b5472fc](https://github.com/ecomplus/cloud-commerce/commit/b5472fc15cb5a4e660eab932f8d49fd56ec4d9f1))

## [2.29.4](https://github.com/ecomplus/cloud-commerce/compare/v2.29.3...v2.29.4) (2024-10-23)


### Bug Fixes

* **storefront:** Dropping unecessary `set-cookie` to keep public cache control ([f834f86](https://github.com/ecomplus/cloud-commerce/commit/f834f86a0488358ba796be7a5971515a3a80e9cc))

## [2.29.3](https://github.com/ecomplus/cloud-commerce/compare/v2.29.2...v2.29.3) (2024-10-23)


### Bug Fixes

* **ssr:** Use `res.set` to ensure proper Cache-Control header ([af4c645](https://github.com/ecomplus/cloud-commerce/commit/af4c645949988096f777425d20dff52894515137))

## [2.29.2](https://github.com/ecomplus/cloud-commerce/compare/v2.29.1...v2.29.2) (2024-10-23)


### Bug Fixes

* **storefront:** Dropping `apiContext.timestamp` to support etag caching on output HTML ([6231f2d](https://github.com/ecomplus/cloud-commerce/commit/6231f2d10db0a7e8edf0b517fe676b929f2e84f7))
* **storefront:** Properly hydrate product stocks on SSRed section shelfs ([27861d3](https://github.com/ecomplus/cloud-commerce/commit/27861d3281646dae3b6959d94d5b4d5e152452cf))

## [2.29.1](https://github.com/ecomplus/cloud-commerce/compare/v2.29.0...v2.29.1) (2024-10-22)


### Bug Fixes

* **braspag:** Fixed URL for Pix QR Code images ([9e87e49](https://github.com/ecomplus/cloud-commerce/commit/9e87e49ed3333cf30ab78b513cf869f615c0781b))
* **modules:** Properly handling transaciton status and payments history on checkout new order ([07073b1](https://github.com/ecomplus/cloud-commerce/commit/07073b14f2042e919d200a2b4be5f52c401f9e06))

## [2.29.0](https://github.com/ecomplus/cloud-commerce/compare/v2.28.7...v2.29.0) (2024-10-22)


### Features

* **braspag:** Setup new Braspag payment app ([72c673a](https://github.com/ecomplus/cloud-commerce/commit/72c673a16412a0dafc01df6d97031d1a7c2766cc)), closes [#diff-19a65166713732dd773aa136913876a42ddbc4ac63c839c9e034c06a28e513e6R11](https://github.com/ecomplus/cloud-commerce/issues/diff-19a65166713732dd773aa136913876a42ddbc4ac63c839c9e034c06a28e513e6R11)


### Bug Fixes

* **deps:** Update non-major dependencies ([#474](https://github.com/ecomplus/cloud-commerce/issues/474)) ([174945c](https://github.com/ecomplus/cloud-commerce/commit/174945c757176be2cc3ba3e04ca62f99b66525c7))
* **pagaleve:** Updating app handlers with https://github.com/ecomplus/app-pagaleve ([1b5f79c](https://github.com/ecomplus/cloud-commerce/commit/1b5f79ce770ced888e8ec011dac7e4e33ae6ab52))

## [2.28.7](https://github.com/ecomplus/cloud-commerce/compare/v2.28.6...v2.28.7) (2024-10-18)


### Bug Fixes

* **storefront:** Bump Vue to latest v3.5.12 (revert) ([7c152c8](https://github.com/ecomplus/cloud-commerce/commit/7c152c8013d72ebe0043c0c5b6e49be98046d7c0))

## [2.28.6](https://github.com/ecomplus/cloud-commerce/compare/v2.28.5...v2.28.6) (2024-10-18)


### Bug Fixes

* **storefront:** Try fixing strange hydration mismatches with Vue 3.4 regression ([f3455a6](https://github.com/ecomplus/cloud-commerce/commit/f3455a6adf1fb86a168c88537d69a2379a2e42bc))

## [2.28.5](https://github.com/ecomplus/cloud-commerce/compare/v2.28.4...v2.28.5) (2024-10-17)


### Bug Fixes

* **pagarme:** New `recurrence_model` field on credit card transactions ([2a9b6c4](https://github.com/ecomplus/cloud-commerce/commit/2a9b6c422da1b4d23c7dec1995226253fef87f8d))
* **storefront:** Handle available extra discount on shipping calculator composable ([8cb5ae4](https://github.com/ecomplus/cloud-commerce/commit/8cb5ae4d4d227a3666cd1ac0dc0a4c5d83892b40))
* **storefront:** Update Vue to ^3.5.12 ([#472](https://github.com/ecomplus/cloud-commerce/issues/472)) ([e1476f6](https://github.com/ecomplus/cloud-commerce/commit/e1476f6f5d2fbb595a47867bc5453826645135da))

## [2.28.4](https://github.com/ecomplus/cloud-commerce/compare/v2.28.3...v2.28.4) (2024-10-11)


### Bug Fixes

* **storefront:** Additional named exports for common Firestore usage on `@@sf/scripts/firestore` ([05a10d9](https://github.com/ecomplus/cloud-commerce/commit/05a10d9d9ea1c21db19332375337f265218b1ecb))
* **storefront:** Fix importing `@firebase/firestore/lite` on `scripts/firestore` ([04dde1b](https://github.com/ecomplus/cloud-commerce/commit/04dde1bda274425ef4a317b3f6b74badeb345562))

## [2.28.3](https://github.com/ecomplus/cloud-commerce/compare/v2.28.2...v2.28.3) (2024-10-10)


### Bug Fixes

* **storefront:** Update `<Carousel>` to bind properties also on default slot ([1532ccd](https://github.com/ecomplus/cloud-commerce/commit/1532ccde9288b021f0bea9c4376e0c182a28bf6f))

## [2.28.2](https://github.com/ecomplus/cloud-commerce/compare/v2.28.1...v2.28.2) (2024-10-08)


### Bug Fixes

* **deps:** Update non-major dependencies ([#469](https://github.com/ecomplus/cloud-commerce/issues/469)) ([3a16abf](https://github.com/ecomplus/cloud-commerce/commit/3a16abf48f547eef52e134421167a0257929903a))
* **storefront:** Add new `isHalfSize` optional prop to `BannerPictures.astro` ([d7fc29d](https://github.com/ecomplus/cloud-commerce/commit/d7fc29dc755645693f66ae55908d9fa659fb91dd))
* **storefront:** Bump Vue to ^3.5.11 ([#470](https://github.com/ecomplus/cloud-commerce/issues/470)) ([7cacd11](https://github.com/ecomplus/cloud-commerce/commit/7cacd11065873639a3950476ac9e8909f202b1e4))

## [2.28.1](https://github.com/ecomplus/cloud-commerce/compare/v2.28.0...v2.28.1) (2024-10-05)


### Bug Fixes

* **storefront:** Fixing regression on modules info with apply discount request body ([99448fd](https://github.com/ecomplus/cloud-commerce/commit/99448fdf367000ec37588802bd815456e1772b8d))

## [2.28.0](https://github.com/ecomplus/cloud-commerce/compare/v2.27.3...v2.28.0) (2024-10-05)


### Features

* **modules:** Add optional fields brands/categories to items param on apply discount ([e8950fb](https://github.com/ecomplus/cloud-commerce/commit/e8950fba09f143c37dc94aab3f396b866d8f6900))
* **storefront:** Also handle items, categories and coupon on apply discount within modules info ([253e8e1](https://github.com/ecomplus/cloud-commerce/commit/253e8e1a2a533846e65685f2d1d7cf840aa2b084))


### Bug Fixes

* **storefront:** Also persisting session `?referral` and `?coupon` from URL params ([c47558b](https://github.com/ecomplus/cloud-commerce/commit/c47558b9d34ac46f801b7de5b89666f2cdc73d4a))
* **storefront:** Prevent loosing `modulesInfo` object reactivity ([c7f129e](https://github.com/ecomplus/cloud-commerce/commit/c7f129e8df776f523950866f97e73d3644fba672))

## [2.27.3](https://github.com/ecomplus/cloud-commerce/compare/v2.27.2...v2.27.3) (2024-10-01)


### Bug Fixes

* **modules:** Ensure BR phone numbers formatted up to 11 digits on checkout ([6ee6f4d](https://github.com/ecomplus/cloud-commerce/commit/6ee6f4d08b69069f89dccc0aaba6bdbae15c6bf4))
* **storefront:** Update Vue to ^3.5.10 ([#461](https://github.com/ecomplus/cloud-commerce/issues/461)) ([a7685f0](https://github.com/ecomplus/cloud-commerce/commit/a7685f0a3aa5ecd620b52506ab0c71292e3c6430))

## [2.27.2](https://github.com/ecomplus/cloud-commerce/compare/v2.27.1...v2.27.2) (2024-09-28)


### Bug Fixes

* **deps:** Update non-major dependencies ([#458](https://github.com/ecomplus/cloud-commerce/issues/458)) ([93217df](https://github.com/ecomplus/cloud-commerce/commit/93217df9a7af01252caf116172f74ab43cd3315a))
* **storefront:** Adding breadcrumb for parent category on category pages ([cb6f954](https://github.com/ecomplus/cloud-commerce/commit/cb6f95450c87178d53c295a8e1fccd0c44fa97df))
* **storefront:** Ensure await auth ready on SPA with account route ([9082cc9](https://github.com/ecomplus/cloud-commerce/commit/9082cc9475fc1843d7b98ebe0b0a026e4b5d13e8))
* **storefront:** Prevent hydration mismatch errors with `<SocialNetworkLink>` for whatsapp ([ab34c3f](https://github.com/ecomplus/cloud-commerce/commit/ab34c3fbffb8deb2020af290779de4f80503e2f0))
* **storefront:** Update `<SocialNetworkLink>` using api.whatsapp on SSR ([a829057](https://github.com/ecomplus/cloud-commerce/commit/a82905794eb652bfa837de110ded82e7c0f47280))
* **storefront:** Update dependency Vue to ^3.5.8 ([#457](https://github.com/ecomplus/cloud-commerce/issues/457)) ([46c9828](https://github.com/ecomplus/cloud-commerce/commit/46c9828bc931fa7164ff3e947ed5ae683e04e5c3))

## [2.27.1](https://github.com/ecomplus/cloud-commerce/compare/v2.27.0...v2.27.1) (2024-09-20)


### Bug Fixes

* **ssr:** Also handle SWR on HTML responses without SSR took header ([6f03bf0](https://github.com/ecomplus/cloud-commerce/commit/6f03bf09b390ff95198fb32dcc631a2add5892a2))
* **ssr:** Prevent new permanent cache (no stale at) on SWR worker KV ([7126430](https://github.com/ecomplus/cloud-commerce/commit/71264304e23ee4723ffb4ecb8de9de73f6edf5b9))
* **ssr:** Prevent returning permanent (inifnite) cache from KV on SWR worker ([de07bf0](https://github.com/ecomplus/cloud-commerce/commit/de07bf0d05b41e0779018ae44242a6c7ca54bc55))
* **storefront:** Fixing `<Carousel>` controls state with enumered prop `:controls` ([d2fc905](https://github.com/ecomplus/cloud-commerce/commit/d2fc905a15dcdb003d8be7e22447cf3111cac288))
* **storefront:** Passing additional props to `banners-grid` section for customizations ([3badde8](https://github.com/ecomplus/cloud-commerce/commit/3badde8c12bf3e757db90ffbd612ef513effa759))
* **storefront:** Update Vue to ^3.5.6 ([#454](https://github.com/ecomplus/cloud-commerce/issues/454)) ([df4ad83](https://github.com/ecomplus/cloud-commerce/commit/df4ad83cda4674b4179d5507ecf34fd782c9a1ad))
* **tiny-erp:** Ensure parsing price/quantity from tiny to number on product import ([337d400](https://github.com/ecomplus/cloud-commerce/commit/337d400f630ac0c96fe30ba3fbf8838709d2ce98))

## [2.27.0](https://github.com/ecomplus/cloud-commerce/compare/v2.26.5...v2.27.0) (2024-09-11)


### Features

* **storefront:** Export new `addCartItemMiddleware` from shopping cart ([176d162](https://github.com/ecomplus/cloud-commerce/commit/176d1624e6107c53d0003f695656078c3f8762be))


### Bug Fixes

* **cli:** Updating default firebase.json with new `emulators.singleProjectMode` ([4b984dd](https://github.com/ecomplus/cloud-commerce/commit/4b984ddd5e1a664fa9894f5fa3671432bcba4d3a))
* **deps:** Update non-major dependencies ([#452](https://github.com/ecomplus/cloud-commerce/issues/452)) ([fcff743](https://github.com/ecomplus/cloud-commerce/commit/fcff74313ec8ba18f4aeae90ba503bd6dbeaf56a))
* **storefront:** Prevent error with undefined `$storefront.onLoad` on simpler static site usage ([06afd2e](https://github.com/ecomplus/cloud-commerce/commit/06afd2ed7417a732fea82d27e7a9d3491dbf2d87))
* **storefront:** Prevent error with undefined `$storefront.onLoad` on simpler static site usage ([527b063](https://github.com/ecomplus/cloud-commerce/commit/527b0637d429de5664fe977721cf1cec3f719869))
* **storefront:** Setting gtag `user_data` for enhanced conversion if `window.GTAG_USER_DATA` is set ([205b8ea](https://github.com/ecomplus/cloud-commerce/commit/205b8ea517b814e6ffd5ec4c32936a62cc10a0dd))
* **storefront:** Update `usePageHero` to pass custom hero slider fields on content ([ffb2391](https://github.com/ecomplus/cloud-commerce/commit/ffb239175e5b7e6315d528a04b81164f8f69eb9f))
* **storefront:** Update Vue to ^3.5.3 ([#453](https://github.com/ecomplus/cloud-commerce/issues/453)) ([1b26ced](https://github.com/ecomplus/cloud-commerce/commit/1b26ced9500a1de4a08f172ba61cfb23b4eb5977))

## [2.26.5](https://github.com/ecomplus/cloud-commerce/compare/v2.26.4...v2.26.5) (2024-09-04)


### Bug Fixes

* **cli:** Update bunny.net CI bypassing CDN cache and SWR on /_feeds/ URLs ([7c2ff07](https://github.com/ecomplus/cloud-commerce/commit/7c2ff0792d07bfbf2121d8589c16ba29d8e0d7c9))
* **storefront:** Updating Window TS declaration without `$prefetch` ([e9178b4](https://github.com/ecomplus/cloud-commerce/commit/e9178b4c74f2a55e1e326f837021cc5823fa8f98))

## [2.26.4](https://github.com/ecomplus/cloud-commerce/compare/v2.26.3...v2.26.4) (2024-09-04)


### Bug Fixes

* **feeds:** Properly handle filters by categories (or skip) on products feed query string ([53e446a](https://github.com/ecomplus/cloud-commerce/commit/53e446ae3c647e65780cc3e8e9a42b24064b24e9))

## [2.26.3](https://github.com/ecomplus/cloud-commerce/compare/v2.26.2...v2.26.3) (2024-09-04)


### Bug Fixes

* **deps:** Update non-major dependencies ([#449](https://github.com/ecomplus/cloud-commerce/issues/449)) ([77c90cb](https://github.com/ecomplus/cloud-commerce/commit/77c90cbd04a05cbaaef79d0f46b22f41e82289d9))
* **storefront:** Fix handling built pictures with filenames containing non-alphabetical chars ([27c2a03](https://github.com/ecomplus/cloud-commerce/commit/27c2a039a63fc685eb1df6878b0b7d3bf9466ff9))
* **storefront:** Fix prod build script to properly escape values to saved CSVs ([c198a64](https://github.com/ecomplus/cloud-commerce/commit/c198a64af97a570f73c90127ba31d93ec2f16ecc))
* **storefront:** Update VueUse to v11 ([#450](https://github.com/ecomplus/cloud-commerce/issues/450)) ([e108efd](https://github.com/ecomplus/cloud-commerce/commit/e108efd968007edd90f85494cdfd02ebe39fdcb4))

## [2.26.2](https://github.com/ecomplus/cloud-commerce/compare/v2.26.1...v2.26.2) (2024-09-02)


### Bug Fixes

* **cli:** Update bunny.net CI enabling request coelascing on pull zone setup ([6c716ef](https://github.com/ecomplus/cloud-commerce/commit/6c716ef7944f3a70e9d3d3ccbd1d5bff64cb4181))
* **ssr:** Properly handling redirects on CF SWR worker and cache ([c878448](https://github.com/ecomplus/cloud-commerce/commit/c878448fae1d8b25735f629f5cc7453d758fdfb9))

## [2.26.1](https://github.com/ecomplus/cloud-commerce/compare/v2.26.0...v2.26.1) (2024-08-27)

## [2.26.0](https://github.com/ecomplus/cloud-commerce/compare/v2.25.8...v2.26.0) (2024-08-27)


### Features

* **passport:** Support `env.PASSPORT_UNVERIFIED_AUTH` to pass email+doc only full login (v1-like) ([2be13cb](https://github.com/ecomplus/cloud-commerce/commit/2be13cb0917a069b784196248253cdb2084caa19))
* **storefront:** Return new `isEmptyResult` state on search showcase composable ([a754bc1](https://github.com/ecomplus/cloud-commerce/commit/a754bc1efdf1c38e2e023e72f320e27c671b8e32))


### Bug Fixes

* **cli:** Update bunny.net (CI) edge rules for SWR ("SSR") on Cloudflare instead of direct "ISR" ([20f02f8](https://github.com/ecomplus/cloud-commerce/commit/20f02f832f3f680785cdbb77891ae684d60dc070))
* **cli:** Update bunny.net CI reverting origin to Firebase directly, and change for SWR on edge rule ([733423e](https://github.com/ecomplus/cloud-commerce/commit/733423e3659e845c4f4170b9772d9600588ff413))
* **deps:** Update dependency unocss to ^0.62.3 ([#442](https://github.com/ecomplus/cloud-commerce/issues/442)) ([c8683e3](https://github.com/ecomplus/cloud-commerce/commit/c8683e320d48b19fcf0ba835909a6cf4f88ddef5))
* **deps:** Update non-major dependencies ([#443](https://github.com/ecomplus/cloud-commerce/issues/443)) ([dbf5c00](https://github.com/ecomplus/cloud-commerce/commit/dbf5c005bf8fc1687ffc77b5ba8736a9f83ed531))
* **modules:** Run list payments (preview) twice, once before apply discount ([513bc10](https://github.com/ecomplus/cloud-commerce/commit/513bc10846e07be705a7440a02e74291a3546583))
* **ssr:** Updating CF SWR worker with same paths to bypass from current BunnyCDN edge rules ([1f74ebe](https://github.com/ecomplus/cloud-commerce/commit/1f74ebeb3d2a9594367d0dc79d6565b4ec632e68))
* **storefront:** Better handling search engine promise and `wasFetched` state ([9069263](https://github.com/ecomplus/cloud-commerce/commit/906926393557903dca5fe1cfc66fc4d106f1c2cd))
* **storefront:** Bump Vue to ^3.4.38 ([#440](https://github.com/ecomplus/cloud-commerce/issues/440)) ([db8046f](https://github.com/ecomplus/cloud-commerce/commit/db8046fd3d37fb45c110eddf7eaee1459d35f0da))
* **storefront:** Ensure searchj engine products reactivity even on repeated(empty) results ([5b798ed](https://github.com/ecomplus/cloud-commerce/commit/5b798ed635ca3d4b3c16489b3fb9e1604bc5dfb2))
* **storefront:** Fix handling stock refresh with multiple items ([4662bde](https://github.com/ecomplus/cloud-commerce/commit/4662bdeafb372a63b61c84fa606505ac7c567521))
* **storefront:** Improving global `<Skeleton>` responsiveness ([835b9dc](https://github.com/ecomplus/cloud-commerce/commit/835b9dc60ac6a0d6f55bff82562f8e950297c7ed))
* **storefront:** Update search showcase composable to properly await search fetch (if any) on SSR ([f287e41](https://github.com/ecomplus/cloud-commerce/commit/f287e41ef1ae0b0de7a1f3596fee1cc95022217e))
* **storefront:** Update vbeta-app script with `@ecomplus/storefront-app@2.0.0-beta.207` ([6ff504f](https://github.com/ecomplus/cloud-commerce/commit/6ff504fac7e8f4bbc65ccd57a17afa3f6ae864c3))

## [2.25.8](https://github.com/ecomplus/cloud-commerce/compare/v2.25.7...v2.25.8) (2024-08-16)


### Bug Fixes

* **deps:** Bump axios to v1.7.4 [security] ([a725c2a](https://github.com/ecomplus/cloud-commerce/commit/a725c2a5b27fab0beb2987a53e5b2388376352ad))
* **deps:** Update non-major dependencies ([#437](https://github.com/ecomplus/cloud-commerce/issues/437)) ([a7aaf2b](https://github.com/ecomplus/cloud-commerce/commit/a7aaf2b661a46e7f5329bf7566185bc7c8bc7f53))
* **storefront:** Update shipping calculator composable to (re)fetch item weights and dimensions ([e8f0d46](https://github.com/ecomplus/cloud-commerce/commit/e8f0d4618a9f3d316bff4a0662f2c7dff10152d9))
* **storefront:** Update Vue to ^3.4.37 ([#436](https://github.com/ecomplus/cloud-commerce/issues/436)) ([070e89d](https://github.com/ecomplus/cloud-commerce/commit/070e89d913e3262c2285d99052307587a543954e))

## [2.25.7](https://github.com/ecomplus/cloud-commerce/compare/v2.25.6...v2.25.7) (2024-08-08)


### Bug Fixes

* **storefront:** Ensure CMS auto init on /admin/ route only ([f12e0f1](https://github.com/ecomplus/cloud-commerce/commit/f12e0f1fbe73321160facc5b95c5269aa5041ec5))
* **storefront:** Set global `window.initCMS` function for out of /admin/ CMS manual init ([f074288](https://github.com/ecomplus/cloud-commerce/commit/f074288a438b188b52da07f3c38b6c16a9777240))

## [2.25.6](https://github.com/ecomplus/cloud-commerce/compare/v2.25.5...v2.25.6) (2024-08-08)


### Bug Fixes

* **cli:** Add CORS headers for /_astro/** built files on default firebase.json Hosting config ([15e10ea](https://github.com/ecomplus/cloud-commerce/commit/15e10ea67875e24f7f0175811ba5d0329d39f100))
* **storefront:** Add debounced reftech for stocks of SSRed products ([8180695](https://github.com/ecomplus/cloud-commerce/commit/8180695231503c93ba4f7852c784791ec0fb813c))

## [2.25.5](https://github.com/ecomplus/cloud-commerce/compare/v2.25.4...v2.25.5) (2024-08-07)


### Bug Fixes

* **storefront:** Minor fix `totalPages` on search showcase composable ([035630e](https://github.com/ecomplus/cloud-commerce/commit/035630e34db7eb7fda102665e5ef6bc75dfc75b2))

## [2.25.4](https://github.com/ecomplus/cloud-commerce/compare/v2.25.3...v2.25.4) (2024-08-06)


### Bug Fixes

* **storefront:** Setting unlogged customer data for purchase event on vbeta app ([dd85653](https://github.com/ecomplus/cloud-commerce/commit/dd85653f9e8deb792fa60c00a3803e9c448aa48f))

## [2.25.3](https://github.com/ecomplus/cloud-commerce/compare/v2.25.2...v2.25.3) (2024-08-06)


### Bug Fixes

* **storefront:** Update Vue to latest v3.4.36 ([db086ae](https://github.com/ecomplus/cloud-commerce/commit/db086aeaec82a24e7eaeff2f293acf9cf3347b9f))

## [2.25.2](https://github.com/ecomplus/cloud-commerce/compare/v2.25.1...v2.25.2) (2024-08-06)


### Bug Fixes

* **ssr:** Do not fail inside custom error function with invalid response on `fetchAndCache` ([2934e2f](https://github.com/ecomplus/cloud-commerce/commit/2934e2fbe50618755c6fb73ace8b192c6df4b039))
* **storefront:** Fallback to `window.ecomPassport` (legacy) on checkout with vbeta app ([9fe2d49](https://github.com/ecomplus/cloud-commerce/commit/9fe2d498e3ea2ec669c5cf0ec1c5fffc3468939a))

## [2.25.1](https://github.com/ecomplus/cloud-commerce/compare/v2.25.0...v2.25.1) (2024-08-06)


### Bug Fixes

* **deps:** Update non-major dependencies ([#433](https://github.com/ecomplus/cloud-commerce/issues/433)) ([7be7be6](https://github.com/ecomplus/cloud-commerce/commit/7be7be60c1869a4c644599bbe174cf7df7893f9f))
* **ssr:** Better debugging `fetchAndCache` external responses on fail ([02b771e](https://github.com/ecomplus/cloud-commerce/commit/02b771e92f93afa850dd35a14ff8e6777208e813))
* **ssr:** Better debugging `fetchAndCache` external responses received with invaldi JSON ([0fe9c7f](https://github.com/ecomplus/cloud-commerce/commit/0fe9c7f5267b938c6ea626b3498a13ec744f21c3))
* **ssr:** Only warn and continue cron SSR save views on product giving 404 (deleted) ([9457b51](https://github.com/ecomplus/cloud-commerce/commit/9457b515922307b8b90124ad83e1c656a22af904))
* **storefront:** Fix merging state keeping deep reactivity on broadcast with `useStorage` ([5425420](https://github.com/ecomplus/cloud-commerce/commit/5425420761cfa34eebd8bf4f37c285f92d2f8b5d))
* **storefront:** New `updateCartState` method from shopping cart state handler ([97b4f29](https://github.com/ecomplus/cloud-commerce/commit/97b4f2900124f6178897d102a966e74a1f5afa18))
* **storefront:** Prevent looping broadcast sync on state storage composable (many tabs) ([730d862](https://github.com/ecomplus/cloud-commerce/commit/730d8622559f7fb9d4b3d88a0fb3c298dc3c150c))
* **storefront:** Properly filtering products list on kit items fetch within product card composable ([493d0b5](https://github.com/ecomplus/cloud-commerce/commit/493d0b5e2c1385fd9ba6939d13fce66f1abc7f78))
* **storefront:** Update Vue to ^3.4.35 ([#432](https://github.com/ecomplus/cloud-commerce/issues/432)) ([3a99634](https://github.com/ecomplus/cloud-commerce/commit/3a99634b56b813762f9752783335d3e27124c57e))

## [2.25.0](https://github.com/ecomplus/cloud-commerce/compare/v2.24.3...v2.25.0) (2024-08-05)


### Features

* **storefront:** Emitting custom `c_search_empty` gtag (to GA) event on showcase with no results ([4daf370](https://github.com/ecomplus/cloud-commerce/commit/4daf370a6cae095909794ecd85fd62fc6cb3e382))
* **storefront:** New methods `loadToCart` and `loadKitItems` returned on product card composabe ([abad411](https://github.com/ecomplus/cloud-commerce/commit/abad4115318d67d693274e90554cdadbda9eedd5))


### Bug Fixes

* **storefront:** Properly setting optional props from non-required fields on `InferCmsOutput` ([ac84602](https://github.com/ecomplus/cloud-commerce/commit/ac8460283d74c02d0f979b11c8c00fc39d619f98))

## [2.24.3](https://github.com/ecomplus/cloud-commerce/compare/v2.24.2...v2.24.3) (2024-08-02)


### Bug Fixes

* **pagarme:** Handle optional `env.PAGARME_WEBHOOK_SKIP_SIG` for temp signature skip ([bac8889](https://github.com/ecomplus/cloud-commerce/commit/bac8889e72bb920081d980dcc3a047e062511f79))
* **pagarme:** Read transaction on pagar.me API when webhook signature not verified ([69246a3](https://github.com/ecomplus/cloud-commerce/commit/69246a338f210e4333aca92a0e163e0f669b737d))

## [2.24.2](https://github.com/ecomplus/cloud-commerce/compare/v2.24.1...v2.24.2) (2024-08-01)


### Bug Fixes

* **apps:** Prefering keys from app data (when available) over env vars ([7ad53c1](https://github.com/ecomplus/cloud-commerce/commit/7ad53c10620720b595a0986b2c12ef1aa18cabd0))
* **pagarme:** Sending new `?sig` on notification URL for internal verification ([494b644](https://github.com/ecomplus/cloud-commerce/commit/494b644d938ecaddfa076a48f5afdc7085980d33))
* **pagarme:** Stop requiring signature header on URL if ?sig arg is properly set ([f4dd3f5](https://github.com/ecomplus/cloud-commerce/commit/f4dd3f583e2ea903e22407c402fbc10f80351e5c))

## [2.24.1](https://github.com/ecomplus/cloud-commerce/compare/v2.24.0...v2.24.1) (2024-08-01)


### Bug Fixes

* **apps:** Prefering keys from app data (when available) over env vars ([613c095](https://github.com/ecomplus/cloud-commerce/commit/613c09594fa11a72170dcdd6c302b6f9b8ff7aed))

## [2.24.0](https://github.com/ecomplus/cloud-commerce/compare/v2.23.3...v2.24.0) (2024-08-01)


### Features

* **i18n:** New messages for empty search results feedback ([caa32d0](https://github.com/ecomplus/cloud-commerce/commit/caa32d04d9179c9872079c44f91026c6b8b6d160))
* **storefront:** Start fetching popular search terms on search showcase composable ([adcb4d5](https://github.com/ecomplus/cloud-commerce/commit/adcb4d58dddc6ecefb07d27d756e7e40fb1bc967))


### Bug Fixes

* **apps,modules,firebase:** Fixing many logs using `@cloudcommerce/firebase` logger ([5d239b9](https://github.com/ecomplus/cloud-commerce/commit/5d239b97f083cf7ebb44fe58a171f6ee68c92b0c))
* **firebase:** Prevent error with `logger` bad usage (legacy) ([efc4bd5](https://github.com/ecomplus/cloud-commerce/commit/efc4bd51ce02d397f4d0c9cd0fa430ac053c7470))
* **tiny-erp:** Ensure context set up on Tiny webhook Function executions ([c5898ef](https://github.com/ecomplus/cloud-commerce/commit/c5898efc85656938760a1f168c21ed65a53ea940))

## [2.23.3](https://github.com/ecomplus/cloud-commerce/compare/v2.23.2...v2.23.3) (2024-07-30)


### Bug Fixes

* **storefront:** Fixing default theme Iconify iconset imports ([577e8e7](https://github.com/ecomplus/cloud-commerce/commit/577e8e7ea098be50fa158482182ae7d9aa8d3e81))

## [2.23.2](https://github.com/ecomplus/cloud-commerce/compare/v2.23.1...v2.23.2) (2024-07-30)


### Bug Fixes

* **storefront:** Accept iconify ESM modules on theme config in place of string only ([12db8b8](https://github.com/ecomplus/cloud-commerce/commit/12db8b8aafcd150c73ffad1319475025dd2c12d2))

## [2.23.1](https://github.com/ecomplus/cloud-commerce/compare/v2.23.0...v2.23.1) (2024-07-30)


### Bug Fixes

* **cli:** Set `$.verbose = true` CLI dev and build commands ([c90e62d](https://github.com/ecomplus/cloud-commerce/commit/c90e62d0f51a9ed83c32aedb7c2b25037a5979ef))
* **storefront:** Stop importing `tailwindcss/colors` (CJS) ([9cabadd](https://github.com/ecomplus/cloud-commerce/commit/9cabadd291a7a84112d6139f40207c4b089f284c))

## [2.23.0](https://github.com/ecomplus/cloud-commerce/compare/v2.22.1...v2.23.0) (2024-07-29)


### Features

* **firebase:** Start creating new Function `execId` with Node async local storage ([12bc496](https://github.com/ecomplus/cloud-commerce/commit/12bc496b92a3c311f7e592f1f291bf86ecfcf8f1))
* **ssr:** Exporting `/utils` with new `fetchAndCache` and additional path/agent parser methods ([2ab9194](https://github.com/ecomplus/cloud-commerce/commit/2ab919415b8cc9e2ae120ab90daf7468c3e19057))
* **ssr:** Setting `global.$ssrFetchAndCache` before storfefront render ([d7c69d5](https://github.com/ecomplus/cloud-commerce/commit/d7c69d5e2a8386bdc3f2ef4284bf96e467434daf))


### Bug Fixes

* **deps:** Update non-major dependencies ([#421](https://github.com/ecomplus/cloud-commerce/issues/421)) ([7ee592a](https://github.com/ecomplus/cloud-commerce/commit/7ee592a3757cd5a8abdb7d8a1a7319859df25436))
* **deps:** Update non-major dependencies ([#424](https://github.com/ecomplus/cloud-commerce/issues/424)) ([79d17c3](https://github.com/ecomplus/cloud-commerce/commit/79d17c3134eefc689924b80f0f007be1f2481a7e))
* **storefront:** Handle custom `storefront.data` types with new `@@sf/custom-data` module ([fec39ce](https://github.com/ecomplus/cloud-commerce/commit/fec39cea0568ba84a24ebae6ced1be3d909ccc97))
* **storefront:** Update Vue to ^3.4.33 ([#420](https://github.com/ecomplus/cloud-commerce/issues/420)) ([a39153e](https://github.com/ecomplus/cloud-commerce/commit/a39153eb0f69d1c13b6e8761238f8d1e9e087f93))
* **storefront:** Update Vue to ^3.4.34 ([#423](https://github.com/ecomplus/cloud-commerce/issues/423)) ([df70247](https://github.com/ecomplus/cloud-commerce/commit/df702477840d68f63f97981f140469f67d089550))

## [2.22.1](https://github.com/ecomplus/cloud-commerce/compare/v2.22.0...v2.22.1) (2024-07-20)


### Bug Fixes

* **pagarme:** Ensure expected `zipcode` format with 8 digits string ([23f4a91](https://github.com/ecomplus/cloud-commerce/commit/23f4a9162c216bbdc7be159c2e77542b22137de6))
* **storefront:** Extending `CmsField` type with `select:<string>` for select with ecom state options ([cbda75e](https://github.com/ecomplus/cloud-commerce/commit/cbda75e7759da88afef3ff6c75a5102687ab11e9))
* **storefront:** Replacing some `interface` to `type` on sections props ([be89f27](https://github.com/ecomplus/cloud-commerce/commit/be89f27c2626af77b6a405c3fed1964324c5f797))

## [2.22.0](https://github.com/ecomplus/cloud-commerce/compare/v2.21.6...v2.22.0) (2024-07-16)


### Features

* **storefront:** New `InferCmsOutput` generic and `CmsFields` type on `@@sf/content` ([54f9f2f](https://github.com/ecomplus/cloud-commerce/commit/54f9f2fd12719402462fdedafd6ab78e8edb5f43))


### Bug Fixes

* **api:** Ensure negative not undefined body is properly passed to request ([cec5fae](https://github.com/ecomplus/cloud-commerce/commit/cec5fae13be1e06f7e42c4032702e899e92512be))
* **deps:** Update non-major dependencies ([#418](https://github.com/ecomplus/cloud-commerce/issues/418)) ([af37e17](https://github.com/ecomplus/cloud-commerce/commit/af37e174bfcff92aa81fe7750a662c1a329d871c))

## [2.21.6](https://github.com/ecomplus/cloud-commerce/compare/v2.21.5...v2.21.6) (2024-07-08)


### Bug Fixes

* **deps:** Update non-major dependencies ([#415](https://github.com/ecomplus/cloud-commerce/issues/415)) ([7c05c2b](https://github.com/ecomplus/cloud-commerce/commit/7c05c2b7cc1f6c6f444792a3e97d5a75bbc4b7ab))
* **storefront:** Bump Vue to ^3.4.31 ([#401](https://github.com/ecomplus/cloud-commerce/issues/401)) ([f35ae3b](https://github.com/ecomplus/cloud-commerce/commit/f35ae3b89bafb3fad366bb161be9b85b1a609e82))
* **tiny-erp:** Double try finding product to import by current SKU on Tiny ([aad6fd8](https://github.com/ecomplus/cloud-commerce/commit/aad6fd838b9a8ee3983b1fc4c967d4567fe705f3))
* **tiny-erp:** Prevent error on after queue handler without `action` (Tiny webhooks) ([bd39156](https://github.com/ecomplus/cloud-commerce/commit/bd39156a1ef333e36b3b938521a3bcfe5474a4c6))

## [2.21.5](https://github.com/ecomplus/cloud-commerce/compare/v2.21.4...v2.21.5) (2024-06-27)


### Bug Fixes

* **modules:** Additional checkout body data refinements before schema validation ([f7a1ebf](https://github.com/ecomplus/cloud-commerce/commit/f7a1ebf3cf1482c64b53564dedc77b45466f48a2))
* **modules:** Minor fixes debugging checkout validation errors ([f2e3fc0](https://github.com/ecomplus/cloud-commerce/commit/f2e3fc0897d2c898c049b42e66147f3595a158ce))
* **modules:** Update reate transaction schema to stop requiring minumim CVV 99 ([274c38c](https://github.com/ecomplus/cloud-commerce/commit/274c38cb99849006314083198daca58b8feabe49))
* **storefront:** Replacing `mime` imports to `mrmime`, on direct pkg deps ([cbd4219](https://github.com/ecomplus/cloud-commerce/commit/cbd4219e604a1d4a6e56ac38b7c7ac8abeee5a85)), closes [#375](https://github.com/ecomplus/cloud-commerce/issues/375)

## [2.21.4](https://github.com/ecomplus/cloud-commerce/compare/v2.21.3...v2.21.4) (2024-06-26)


### Bug Fixes

* **modules:** Update checkout schema to stop requiring minumim CVV 99 ([d87d3a1](https://github.com/ecomplus/cloud-commerce/commit/d87d3a17326bcfabb7657bc1f72e6f4587ad3c97))
* **storefront:** Bump Vue to latest v3.4.30 ([684722d](https://github.com/ecomplus/cloud-commerce/commit/684722d4177366213f75be293eaf5f7cc12be890))

## [2.21.3](https://github.com/ecomplus/cloud-commerce/compare/v2.21.2...v2.21.3) (2024-06-24)


### Bug Fixes

* **api:** Properly parsing/passing body input 0 or null for nested PUT/PATCH/POST ([b919a2d](https://github.com/ecomplus/cloud-commerce/commit/b919a2db2cbcb27578ff5638e66039ae289944f4))
* **deps:** Update non-major dependencies ([#404](https://github.com/ecomplus/cloud-commerce/issues/404)) ([39f8571](https://github.com/ecomplus/cloud-commerce/commit/39f857130798789780f8b3739689fcf40c1922ac))

## [2.21.2](https://github.com/ecomplus/cloud-commerce/compare/v2.21.1...v2.21.2) (2024-06-21)


### Bug Fixes

* **modules:** Better debugging all checkout interruptions (AJV and other 4xx errors) ([46ec1e4](https://github.com/ecomplus/cloud-commerce/commit/46ec1e43324c5f3a621905088dda7ce423d7eeb5))
* **storefront:** Adding `blog-grid` and `about-us` to predefined sections (common) ([82cabc9](https://github.com/ecomplus/cloud-commerce/commit/82cabc91ef443412c17a4304e52c0a539e09f958))

## [2.21.1](https://github.com/ecomplus/cloud-commerce/compare/v2.21.0...v2.21.1) (2024-06-19)


### Bug Fixes

* **feeds:** Skip search terms smaller than 3chars or incomplete (autocomplete) terms on sitemap ([a74fb53](https://github.com/ecomplus/cloud-commerce/commit/a74fb532189aaac1dd76c2ba57f2b9c2e7e06718))
* **storefront:** Prevent env `isScreenXs` set true on SSR ([4105c0c](https://github.com/ecomplus/cloud-commerce/commit/4105c0c59ac715bcb54f34a8f312769914c97921))
* **storefront:** Supporting `<Drawer>` persistent on DOM (with backdrop) with `model-to="v-show"` ([fa20e4d](https://github.com/ecomplus/cloud-commerce/commit/fa20e4d88719be5b972dc9933a255635a123a531))

## [2.21.0](https://github.com/ecomplus/cloud-commerce/compare/v2.20.8...v2.21.0) (2024-06-19)


### Features

* **feeds:** Adding most frequent search terms URLs to sitemap ([5810edb](https://github.com/ecomplus/cloud-commerce/commit/5810edb5bdb34df345895c9aab33fab8762707c0))


### Bug Fixes

* **api:** Prevent encoding expression chars on `params` object keys ([b424750](https://github.com/ecomplus/cloud-commerce/commit/b424750dfbe4ac5ea166f78f3b98b527e6de5cdb))
* **api:** Updating types for Products interface and default search v2 listed fields ([bbac369](https://github.com/ecomplus/cloud-commerce/commit/bbac369958b2a32c45f895e7dd29ab3619055195))
* **deps:** Update non-major dependencies ([#399](https://github.com/ecomplus/cloud-commerce/issues/399)) ([d9fb67c](https://github.com/ecomplus/cloud-commerce/commit/d9fb67c7c0b9c45333422de4db426c3fb5bdf600))
* **deps:** Update non-major dependencies ([#403](https://github.com/ecomplus/cloud-commerce/issues/403)) ([562981d](https://github.com/ecomplus/cloud-commerce/commit/562981d6c4e0c5e0e05c5004b8899bf266eadd71))
* **storefront:** Fix page main composable to preserve `searchQuery` from content on shelf sections ([9f812d6](https://github.com/ecomplus/cloud-commerce/commit/9f812d647ea89a0b6cbf82c04bc935b5d6f583f4))
* **storefront:** Limiting tooltip size to 200px by default ([b485366](https://github.com/ecomplus/cloud-commerce/commit/b4853669ba0204ebfec6aef192c716c08aad4ce6))
* **storefront:** Updating `<Drawer>` to support id and native HTML popover to interact with no-JS ([a3029a2](https://github.com/ecomplus/cloud-commerce/commit/a3029a20068168dd5ac0eafb02d6f05e41eb777f))
* **tiny-erp:** Skip unecessary order export with fulfillment status entry from tiny ([83f57b8](https://github.com/ecomplus/cloud-commerce/commit/83f57b89d4a1b22b48981e7c1f12bfa8b2555455))

## [2.20.8](https://github.com/ecomplus/cloud-commerce/compare/v2.20.7...v2.20.8) (2024-06-03)


### Bug Fixes

* **ssr:** Prevent error with many concurrent Firestore writes cron save views ([9ef259a](https://github.com/ecomplus/cloud-commerce/commit/9ef259a9362bea95859804e729023358d3a0c4eb))

## [2.20.7](https://github.com/ecomplus/cloud-commerce/compare/v2.20.6...v2.20.7) (2024-06-03)


### Bug Fixes

* **cli:** Set `$.verbose = true` for Firebase CLI executions ([7424074](https://github.com/ecomplus/cloud-commerce/commit/7424074f94e7304fe446e09ca0b0817b8740e2bc))

## [2.20.6](https://github.com/ecomplus/cloud-commerce/compare/v2.20.5...v2.20.6) (2024-06-03)


### Bug Fixes

* **api:** Fixing generics and updating default enumered fields for resource lists ([0aab37b](https://github.com/ecomplus/cloud-commerce/commit/0aab37b92b41ec440bd6d2306866b58a821456e1))
* **deps:** Update non-major dependencies ([#396](https://github.com/ecomplus/cloud-commerce/issues/396)) ([047b44e](https://github.com/ecomplus/cloud-commerce/commit/047b44ea3e51c7fc88d102212bb0a7397cde48d5))

## [2.20.5](https://github.com/ecomplus/cloud-commerce/compare/v2.20.4...v2.20.5) (2024-05-31)


### Bug Fixes

* **pagarme:** Try bumping `pagarme` SDK to v4.35.2 ([0e37307](https://github.com/ecomplus/cloud-commerce/commit/0e37307690ce9e44f962dbbc830717ee4a8b0925))
* **pagarme:** Updating `pagarme-js` version and prevent failing with instable validate method ([63da080](https://github.com/ecomplus/cloud-commerce/commit/63da080b930c678096f93af48d94df9a0c7f5b6a))
* **storefront:** Reducing delayed scripts wait on desktop and disable loading for bots ([83cf262](https://github.com/ecomplus/cloud-commerce/commit/83cf262a94063904bf96047c66224aecbd42a982))
* **storefront:** Update beta checkout script supporting custom credit card error messages ([71d7fbe](https://github.com/ecomplus/cloud-commerce/commit/71d7fbe094a4766f86978889b52b477549ff077f))

## [2.20.4](https://github.com/ecomplus/cloud-commerce/compare/v2.20.3...v2.20.4) (2024-05-31)


### Bug Fixes

* **passport:** Fix finding customer by full email address case insensitive ([a5ce8d8](https://github.com/ecomplus/cloud-commerce/commit/a5ce8d8fab26297b4f77dfce076d94049c8b329a))
* **ssr:** Await sync CDN cache purge to update perma-cache storage (ISR) ([3ddcc7f](https://github.com/ecomplus/cloud-commerce/commit/3ddcc7fa5653783e3742df52be64e68553fa4e0c))

## [2.20.3](https://github.com/ecomplus/cloud-commerce/compare/v2.20.2...v2.20.3) (2024-05-30)


### Bug Fixes

* **storefront:** Update beta checkout script with flux and secondary buttons improvements ([ee5d85c](https://github.com/ecomplus/cloud-commerce/commit/ee5d85cc2297d8069863e39ae23b969afee3ac5d))

## [2.20.2](https://github.com/ecomplus/cloud-commerce/compare/v2.20.1...v2.20.2) (2024-05-29)


### Bug Fixes

* **storefront:** Cleaning ISR params at session URL object ([60d2d54](https://github.com/ecomplus/cloud-commerce/commit/60d2d545616c1c0a8b929b9b891b67f0ca6c565b))
* **storefront:** Fix pagination composable generated page links ([bc7fc07](https://github.com/ecomplus/cloud-commerce/commit/bc7fc078614d556be794b51b22298d712eefdc9a))
* **tiny-erp:** Fixed updating stock to zero from Tiny webhook ([bc30dad](https://github.com/ecomplus/cloud-commerce/commit/bc30dada1cf18602a614e6073c17de7ed8a3426d))

## [2.20.1](https://github.com/ecomplus/cloud-commerce/compare/v2.20.0...v2.20.1) (2024-05-27)


### Bug Fixes

* **deps:** Update non-major dependencies ([#386](https://github.com/ecomplus/cloud-commerce/issues/386)) ([16414cd](https://github.com/ecomplus/cloud-commerce/commit/16414cde31067058a20ea457204f8796b6288cdf))
* **storefront:** Bump VueUse to latest v10.10 ([43df8a4](https://github.com/ecomplus/cloud-commerce/commit/43df8a49cd62ab756b380f95e3780a63e1e32c6b))
* **tiny-erp:** Fix checking Tiny status on order export when "only ready or shipping" is set ([0e3910b](https://github.com/ecomplus/cloud-commerce/commit/0e3910b8d739387c2399e133700d84d5c3440777))
* **tiny-erp:** Normalize parsed Tiny order status before exporting updates ([ffe2b73](https://github.com/ecomplus/cloud-commerce/commit/ffe2b7382e82b160d2ea2af2657a2a6a9b1af349))
* **tiny-erp:** Updating default normalized Tiny status ([abd214b](https://github.com/ecomplus/cloud-commerce/commit/abd214b74571227949b3f91a7849b7d1c3c0ceea))

## [2.20.0](https://github.com/ecomplus/cloud-commerce/compare/v2.19.1...v2.20.0) (2024-05-24)


### Features

* **ssr:** Sending additional user data to Meta Conversions API on purchase events ([9dcc900](https://github.com/ecomplus/cloud-commerce/commit/9dcc9002237166ff02560fa7128dc665d67b6a19))
* **storefront:** Type and handle hashing for additional purchase params on analytics state ([361cf88](https://github.com/ecomplus/cloud-commerce/commit/361cf883c8cdda56f7054b9ec9d48c3522c1be4c))


### Bug Fixes

* **feeds:** Fetching products with all categories, inclusing IDs, for catalog filter params ([d964ec5](https://github.com/ecomplus/cloud-commerce/commit/d964ec5a86e87ba02ff203b61e85cf1b62c42d9b))
* **storefront:** Properly setting hashed data to gtag params with `_hash` suffix ([a637d7e](https://github.com/ecomplus/cloud-commerce/commit/a637d7e7d03d73f46262e4d0c2fb63bd5bacddf6))

## [2.19.1](https://github.com/ecomplus/cloud-commerce/compare/v2.19.0...v2.19.1) (2024-05-23)


### Bug Fixes

* **emails:** Revert email SMTP sender string with quotes for name ([dc9650b](https://github.com/ecomplus/cloud-commerce/commit/dc9650b96257d8ca14f04b3c385e76161fc6bbce))
* **feeds:** Routing by request pathname (not full URL) ([fda35ce](https://github.com/ecomplus/cloud-commerce/commit/fda35ce3294184ce61e9680eac70f5d0a83ea157))

## [2.19.0](https://github.com/ecomplus/cloud-commerce/compare/v2.18.6...v2.19.0) (2024-05-23)


### Features

* **emails:** Test if `@inject/transactional-mails.js` exists for custom emails templates ([9c000a6](https://github.com/ecomplus/cloud-commerce/commit/9c000a673e00a801b583b79fec1fbdcd595baf7b))
* **feeds:** Handle optional queries `categories`, `skip_categories` and `skip_skus` on catalog ([1dba7f1](https://github.com/ecomplus/cloud-commerce/commit/1dba7f1e1bb937c4967d0805d7ecb4664cd660d8))
* **storefront:** New `isZipCodeRefused` returned on shipping calculator composable ([b9bc396](https://github.com/ecomplus/cloud-commerce/commit/b9bc39699ff7954eaaaeb27f87e1735786ef2a7d))
* **storefront:** New optional `names` filter param to `watchGtagEvents` from analytics state ([5c58718](https://github.com/ecomplus/cloud-commerce/commit/5c58718e1e966b7ef7b0ff9231702f0ca8da3c2a))


### Bug Fixes

* **emails:** Handle custom renders with injection from `TRANSACTIONAL_MAILS_MODULE` ([917e732](https://github.com/ecomplus/cloud-commerce/commit/917e73202b5a5b6da08d94c7f51cab6eddf7d2c8))
* **emails:** Removing unecessary quotes on email sender ([fbe5e76](https://github.com/ecomplus/cloud-commerce/commit/fbe5e76189cefb5649feecf73cfdc48dd1553134))
* **ssr:** Redirect all .html URLs by default (clean URLs) ([bd1410f](https://github.com/ecomplus/cloud-commerce/commit/bd1410f9c430c7d07ecb8942d9915b50070a4ddf))
* **storefront:** Update beta checkout script to ensure cart is cleared after purchase ([775de39](https://github.com/ecomplus/cloud-commerce/commit/775de39b2544c99769cd044fd463afe68617b095))
* **tiny-erp:** Fix matching order by number OR metafield on import from Tiny ERP updates ([2c1c0f8](https://github.com/ecomplus/cloud-commerce/commit/2c1c0f8e4ebdd8d25ca77dbb70b3878356b6bb78))

## [2.18.6](https://github.com/ecomplus/cloud-commerce/compare/v2.18.5...v2.18.6) (2024-05-19)


### Bug Fixes

* **pagarme:** Preventign webhook function to respond headers twice ([489deac](https://github.com/ecomplus/cloud-commerce/commit/489deac37cd4d1b501e98f5f557443e1682e3312))
* **ssr:** Try fixing user IP for server sent analytics events ([281a59c](https://github.com/ecomplus/cloud-commerce/commit/281a59c1fa834a8b5aca1da41b5cabbb2b340a0f))

## [2.18.5](https://github.com/ecomplus/cloud-commerce/compare/v2.18.4...v2.18.5) (2024-05-18)


### Bug Fixes

* **ssr:** Ensure exceptions listeners once only and removed on response headers sent ([f23a6e1](https://github.com/ecomplus/cloud-commerce/commit/f23a6e16d77267b04d2d63362b4146523af4eaea))

## [2.18.4](https://github.com/ecomplus/cloud-commerce/compare/v2.18.3...v2.18.4) (2024-05-18)


### Bug Fixes

* **cli:** Update bunny.net (CI) edge rules with new /search -> /s/ dynamic redirect ([d5f0029](https://github.com/ecomplus/cloud-commerce/commit/d5f0029478b9158011b47a94de0ebaee5fbe7121))
* **ssr:** Check fresh HTML length before bumping perma cache file ([4040cce](https://github.com/ecomplus/cloud-commerce/commit/4040ccebb32f1f1add99c83ae210f382af517fc5))
* **ssr:** Deal with redirects (hardfix) for multiple buit CSS filepaths ([6bc97a0](https://github.com/ecomplus/cloud-commerce/commit/6bc97a0bd358adf4f15bf2bb2ef980db30cbc000))
* **ssr:** Intercept uncaught exception to return error status and fallback HTML ([9a19316](https://github.com/ecomplus/cloud-commerce/commit/9a193165e7b71dfc99a38a625cbfbd5dde56a9ee))

## [2.18.3](https://github.com/ecomplus/cloud-commerce/compare/v2.18.1...v2.18.3) (2024-05-18)


### Bug Fixes

* **custom-shipping:** Properly proceeding on checked shipping rules array ([370aeb7](https://github.com/ecomplus/cloud-commerce/commit/370aeb791de44a398c29f4e531b6b39ecba75516))
* **custom-shipping:** Simple zip code validation with BR country code ([e7cbae7](https://github.com/ecomplus/cloud-commerce/commit/e7cbae7ee46fbdb8a57097377620c92620b57dce))
* **modules:** Minor fixes handling shipping services and failure debug ([df48085](https://github.com/ecomplus/cloud-commerce/commit/df48085e515c27894946b16ff2909e2f38d69d05))

## [2.18.2](https://github.com/ecomplus/cloud-commerce/compare/v2.18.1...v2.18.2) (2024-05-18)


### Bug Fixes

* **custom-shipping:** Simple zip code validation with BR country code ([e7cbae7](https://github.com/ecomplus/cloud-commerce/commit/e7cbae7ee46fbdb8a57097377620c92620b57dce))
* **modules:** Minor fixes handling shipping services and failure debug ([df48085](https://github.com/ecomplus/cloud-commerce/commit/df48085e515c27894946b16ff2909e2f38d69d05))

## [2.18.1](https://github.com/ecomplus/cloud-commerce/compare/v2.18.0...v2.18.1) (2024-05-17)


### Bug Fixes

* **mandae:** Simple zip code validation to prevent unecessary Mandae API calculations ([db82a84](https://github.com/ecomplus/cloud-commerce/commit/db82a84b13bfeb6937a2b74068ecdbae04169619))
* **modules:** Saving shipping address to new customers right on checkout ([24281d2](https://github.com/ecomplus/cloud-commerce/commit/24281d26b63894c47248e648f002bcb9927dbec6))
* **pagarme:** Basic check for (optional) buyer birth date on create transaction ([1693b38](https://github.com/ecomplus/cloud-commerce/commit/1693b38e70e0b43ce3cb57ca82fabfb2b07cb6c8))
* **passport:** Find customer by email case insensitive ([23ad6a8](https://github.com/ecomplus/cloud-commerce/commit/23ad6a824408a519befb63f5270b7c8194415a4f))
* **ssr:** Prevent infinite redirects with aditional CDN on static filepaths rewrites ([eefb03e](https://github.com/ecomplus/cloud-commerce/commit/eefb03ea328192ad149cdf0770c0a8bd0c26b2fc))
* **storefront:** Preset OAuth global sign functions while auth initializing on vbeta app ([85f9895](https://github.com/ecomplus/cloud-commerce/commit/85f9895b42fba6f4f3e786684797211fbf589190))

## [2.18.0](https://github.com/ecomplus/cloud-commerce/compare/v2.17.6...v2.18.0) (2024-05-17)


### Features

* **storefront:** Updating base head with extended json+ld for search action and offer on PDP ([5b246ea](https://github.com/ecomplus/cloud-commerce/commit/5b246eaa90a70341785036145c2c88999c63fb4c))


### Bug Fixes

* **api:** Updating all resource interfaces with new `upserted_at` field ([d6155f1](https://github.com/ecomplus/cloud-commerce/commit/d6155f1dc8224f6a42a4c994f8ffbcf19f55fed3))
* **deps:** Update non-major dependencies ([#383](https://github.com/ecomplus/cloud-commerce/issues/383)) ([689c0b3](https://github.com/ecomplus/cloud-commerce/commit/689c0b39033fcd580aef84614d51e1975185c53d))
* **ssr:** Prevent error counting SSR reqs to home path ([d65261f](https://github.com/ecomplus/cloud-commerce/commit/d65261f55ed0918aafa9010ec64cc91d9a6200c2))
* **storefront:** Fix search filters composable returning all specs options ([34edcfd](https://github.com/ecomplus/cloud-commerce/commit/34edcfd088bc926c3f3996193d7b265c63dc1c38))
* **storefront:** Update build prod script to fix all CSS filenames on all copied static HTML ([b7c0823](https://github.com/ecomplus/cloud-commerce/commit/b7c08232c8e1b668b99bc90318fd17ecda815988))
* **storefront:** Update UnoCSS to ^0.60.2 ([#382](https://github.com/ecomplus/cloud-commerce/issues/382)) ([bdc292a](https://github.com/ecomplus/cloud-commerce/commit/bdc292a346eb7f38ec2c14c5dff36dcfc2caeb66))
* **tiny-erp:** Early respond webhooks with OK and property queue to retry on failure ([f2f09e3](https://github.com/ecomplus/cloud-commerce/commit/f2f09e3edfe7d9cdfb94a1bc404f9fe3a4ca0c18))
* **tiny-erp:** Fix setting product quantity and variations price/quantity on import ([ad0a885](https://github.com/ecomplus/cloud-commerce/commit/ad0a8850fd04f8610e65a99a155c1ad19aa42659))

### [2.17.6](https://github.com/ecomplus/cloud-commerce/compare/v2.17.5...v2.17.6) (2024-05-11)


### Bug Fixes

* **ssr:** Save valid SSR reqs to Firestore to purge CDN cache ([2703837](https://github.com/ecomplus/cloud-commerce/commit/2703837a042e5b71af559ab970c681026983c8ed))
* **storefront:** Add `sticky` optional prop to shop header composable ([94bf958](https://github.com/ecomplus/cloud-commerce/commit/94bf958ae24f1eb7837b7109d81f6c657e6ca35a))
* **storefront:** Properly deal with sticky header shown on scroll down ([97a8c2d](https://github.com/ecomplus/cloud-commerce/commit/97a8c2d82f04dca84807101be26e6b958fa7f52b))

### [2.17.5](https://github.com/ecomplus/cloud-commerce/compare/v2.17.4...v2.17.5) (2024-05-08)


### Bug Fixes

* **storefront:** Setup `$firstInteraction` and `$delayedAsyncScripts` on head scripts ([b48a741](https://github.com/ecomplus/cloud-commerce/commit/b48a741361cd58e275d9d2a4a15be7ff071d78b3))

### [2.17.4](https://github.com/ecomplus/cloud-commerce/compare/v2.17.3...v2.17.4) (2024-05-08)

### [2.17.3](https://github.com/ecomplus/cloud-commerce/compare/v2.17.2...v2.17.3) (2024-05-07)


### Bug Fixes

* **storefront:** Fix handling fixed search params on showcase and filters composables ([4539c17](https://github.com/ecomplus/cloud-commerce/commit/4539c172ae4b60ed643c0ad7746349c5b48470e7))
* **storefront:** Programatically send all client-side page views by default ([0e1831e](https://github.com/ecomplus/cloud-commerce/commit/0e1831e097bc1dc4482fe60286a65f6ca9bafa13))
* **storefront:** Update Vue to v3.4.27 ([#368](https://github.com/ecomplus/cloud-commerce/issues/368)) ([34781bd](https://github.com/ecomplus/cloud-commerce/commit/34781bd0aabcb71505dc903340091d5965fe7cbd))

### [2.17.2](https://github.com/ecomplus/cloud-commerce/compare/v2.17.1...v2.17.2) (2024-05-07)


### Bug Fixes

* **emails:** Fix checking positive status to send new order email on first notification ([83958a5](https://github.com/ecomplus/cloud-commerce/commit/83958a5f47b22bf1e5e07d3b8f6d31e2e08aff61))

### [2.17.1](https://github.com/ecomplus/cloud-commerce/compare/v2.17.0...v2.17.1) (2024-05-07)


### Bug Fixes

* **emails:** Ensure first email using new order template ([738b33e](https://github.com/ecomplus/cloud-commerce/commit/738b33e3956916089c680122a7984304aa1f1627))
* **firebase:** Removing `orders-new` event for emails app ([c489fad](https://github.com/ecomplus/cloud-commerce/commit/c489fadf08e75c0141c7d1e414051a3182c8f850))

## [2.17.0](https://github.com/ecomplus/cloud-commerce/compare/v2.16.9...v2.17.0) (2024-05-07)


### Features

* **storefront:** Add support to Facebook sign in on login form composable ([7acee01](https://github.com/ecomplus/cloud-commerce/commit/7acee01bb8f431f5cf7eeb39459d799ad45ec7cd))
* **storefront:** Update vbeta-app script and support Facebook login on checkout ([22af14b](https://github.com/ecomplus/cloud-commerce/commit/22af14b71191053ecc1756e2c7a0742da8a1923f))


### Bug Fixes

* **deps:** Update dependency firebase-functions to v5 ([#381](https://github.com/ecomplus/cloud-commerce/issues/381)) ([ec68093](https://github.com/ecomplus/cloud-commerce/commit/ec680937de8fbe06d00e82cc1bc7991f616adc3e))
* **emails:** Better setting default sender address using `GCLOUD_PROJECT` if any ([32b5a66](https://github.com/ecomplus/cloud-commerce/commit/32b5a66803a319539d62b5974fb84f8660a7dcaa))
* **pagarme:** Properly setting links on banking billet transactions ([23cdc68](https://github.com/ecomplus/cloud-commerce/commit/23cdc68988b81350a53fda5dba49564a5d73f999))
* **passport:** Returning user registry type and display name on email identification ([2c87d3c](https://github.com/ecomplus/cloud-commerce/commit/2c87d3c7771fabf65c8d08a2f734ee9ebd2c09ee))
* **storefront:** Update login form composable to always start with link sign in (even sign up) ([4822087](https://github.com/ecomplus/cloud-commerce/commit/4822087b72f32a3352047bc6b4834b2e5c2a1de2))
* **tiny-erp:** Using `FormData` (Node.js 18) to safely escape body sent to Tiny API ([3c0c86d](https://github.com/ecomplus/cloud-commerce/commit/3c0c86dd20152e6e29a9181bd577c5f3a8ddcfb1))

### [2.16.9](https://github.com/ecomplus/cloud-commerce/compare/v2.16.8...v2.16.9) (2024-05-06)


### Bug Fixes

* **emails:** Fix checking order events by `evName` to proceed ([524f3cb](https://github.com/ecomplus/cloud-commerce/commit/524f3cb46067cb6eeb31d9017dfd268d96765253))
* **firebase:** Always setting `apiEvent.resource` on emitted store events payload ([2e4e6e3](https://github.com/ecomplus/cloud-commerce/commit/2e4e6e38b3f0a65554a9fa04966ade3d84b12ae9))

### [2.16.8](https://github.com/ecomplus/cloud-commerce/compare/v2.16.5...v2.16.8) (2024-05-06)


### Bug Fixes

* **deps:** Update non-major dependencies ([#374](https://github.com/ecomplus/cloud-commerce/issues/374)) ([98ff60d](https://github.com/ecomplus/cloud-commerce/commit/98ff60d6bf325c58171a800de7ab39b63723f558))
* **emails:** Fix getting email render function from event/status ([20e6575](https://github.com/ecomplus/cloud-commerce/commit/20e6575b9adf2c26bb956632b7d95790dbd05551))
* **storefront:** Update UnoCSS to ^0.59.4 ([#377](https://github.com/ecomplus/cloud-commerce/issues/377)) ([fd9aa9c](https://github.com/ecomplus/cloud-commerce/commit/fd9aa9c1cfe1c07d49bd8d22ff2d72854d79865f))

### [2.16.7](https://github.com/ecomplus/cloud-commerce/compare/v2.16.5...v2.16.7) (2024-05-06)


### Bug Fixes

* **deps:** Update non-major dependencies ([#374](https://github.com/ecomplus/cloud-commerce/issues/374)) ([98ff60d](https://github.com/ecomplus/cloud-commerce/commit/98ff60d6bf325c58171a800de7ab39b63723f558))
* **emails:** Fix getting email render function from event/status ([20e6575](https://github.com/ecomplus/cloud-commerce/commit/20e6575b9adf2c26bb956632b7d95790dbd05551))
* **storefront:** Update UnoCSS to ^0.59.4 ([#377](https://github.com/ecomplus/cloud-commerce/issues/377)) ([fd9aa9c](https://github.com/ecomplus/cloud-commerce/commit/fd9aa9c1cfe1c07d49bd8d22ff2d72854d79865f))

### [2.16.6](https://github.com/ecomplus/cloud-commerce/compare/v2.16.5...v2.16.6) (2024-05-06)


### Bug Fixes

* **deps:** Update non-major dependencies ([#374](https://github.com/ecomplus/cloud-commerce/issues/374)) ([98ff60d](https://github.com/ecomplus/cloud-commerce/commit/98ff60d6bf325c58171a800de7ab39b63723f558))
* **emails:** Fix getting email render function from event/status ([20e6575](https://github.com/ecomplus/cloud-commerce/commit/20e6575b9adf2c26bb956632b7d95790dbd05551))
* **storefront:** Update UnoCSS to ^0.59.4 ([#377](https://github.com/ecomplus/cloud-commerce/issues/377)) ([fd9aa9c](https://github.com/ecomplus/cloud-commerce/commit/fd9aa9c1cfe1c07d49bd8d22ff2d72854d79865f))

### [2.16.5](https://github.com/ecomplus/cloud-commerce/compare/v2.16.1...v2.16.5) (2024-05-04)


### Bug Fixes

* **apps:** Fixing many apps webhooks functions deployment with configured runtime options ([cc58b9e](https://github.com/ecomplus/cloud-commerce/commit/cc58b9ed06aea80e555a578799f30ff78e52aa0b))
* **cli:** Update bunny.net (CI) edge rules for /.* routes with short cache TTL ([2c7c0c6](https://github.com/ecomplus/cloud-commerce/commit/2c7c0c6b841617d837c30a56a8718c5a2c9619e4))
* **cli:** Update bunny.net (CI) edge rules to bypass /.* (hidden files) routes ([512c9e6](https://github.com/ecomplus/cloud-commerce/commit/512c9e6eb77b270271d834ac7b9cd999534d2265))
* **emails:** Properly defining email template and respecting configured mail options ([e304894](https://github.com/ecomplus/cloud-commerce/commit/e304894bdc2ed1bc0b91383d9623883212e9a890))
* **emails:** Update `@ecomplus/transactional-mails` to v2.0.4 ([d3412f7](https://github.com/ecomplus/cloud-commerce/commit/d3412f75df16e42526b828aa99b9a49a93eb37c3))
* **firebase:** Add middleware to app events handler to debug each event execution ([fea986a](https://github.com/ecomplus/cloud-commerce/commit/fea986acbe1e8d0c47feb494c460a0974053556a))
* **firebase:** Removing FB Conversions and Analytics apps declarations from base config ([9b7f034](https://github.com/ecomplus/cloud-commerce/commit/9b7f0340dd1635b41ad64111d89982b93adba22b))
* **firebase:** Set default 100 max instances for HTTP functions ([07032d0](https://github.com/ecomplus/cloud-commerce/commit/07032d063418082b0c3096e02fb9fbe05fe18a51))
* **ssr:** Add /.* (hidden files) routes to skipped patterns on page views handler ([a8cabe0](https://github.com/ecomplus/cloud-commerce/commit/a8cabe026983f0535f6613c36cbb6f1217b595f7))
* **storefront:** Better typing SSR `routeContext.apiContext` resource + doc ([c687658](https://github.com/ecomplus/cloud-commerce/commit/c68765897e0e8aaacefe2a911be73bd937accb83))
* **tiny-erp:** Always set address "numero" or order export, with 0 or S/N if undefined ([1d032c0](https://github.com/ecomplus/cloud-commerce/commit/1d032c08af259a50c46458a40a0f5d9cabfadc69))

### [2.16.4](https://github.com/ecomplus/cloud-commerce/compare/v2.16.1...v2.16.4) (2024-05-04)


### Bug Fixes

* **apps:** Fixing many apps webhooks functions deployment with configured runtime options ([cc58b9e](https://github.com/ecomplus/cloud-commerce/commit/cc58b9ed06aea80e555a578799f30ff78e52aa0b))
* **cli:** Update bunny.net (CI) edge rules for /.* routes with short cache TTL ([2c7c0c6](https://github.com/ecomplus/cloud-commerce/commit/2c7c0c6b841617d837c30a56a8718c5a2c9619e4))
* **cli:** Update bunny.net (CI) edge rules to bypass /.* (hidden files) routes ([512c9e6](https://github.com/ecomplus/cloud-commerce/commit/512c9e6eb77b270271d834ac7b9cd999534d2265))
* **emails:** Properly defining email template and respecting configured mail options ([e304894](https://github.com/ecomplus/cloud-commerce/commit/e304894bdc2ed1bc0b91383d9623883212e9a890))
* **emails:** Update `@ecomplus/transactional-mails` to v2.0.4 ([d3412f7](https://github.com/ecomplus/cloud-commerce/commit/d3412f75df16e42526b828aa99b9a49a93eb37c3))
* **firebase:** Add middleware to app events handler to debug each event execution ([fea986a](https://github.com/ecomplus/cloud-commerce/commit/fea986acbe1e8d0c47feb494c460a0974053556a))
* **firebase:** Removing FB Conversions and Analytics apps declarations from base config ([9b7f034](https://github.com/ecomplus/cloud-commerce/commit/9b7f0340dd1635b41ad64111d89982b93adba22b))
* **firebase:** Set default 100 max instances for HTTP functions ([07032d0](https://github.com/ecomplus/cloud-commerce/commit/07032d063418082b0c3096e02fb9fbe05fe18a51))
* **ssr:** Add /.* (hidden files) routes to skipped patterns on page views handler ([a8cabe0](https://github.com/ecomplus/cloud-commerce/commit/a8cabe026983f0535f6613c36cbb6f1217b595f7))
* **storefront:** Better typing SSR `routeContext.apiContext` resource + doc ([c687658](https://github.com/ecomplus/cloud-commerce/commit/c68765897e0e8aaacefe2a911be73bd937accb83))
* **tiny-erp:** Always set address "numero" or order export, with 0 or S/N if undefined ([1d032c0](https://github.com/ecomplus/cloud-commerce/commit/1d032c08af259a50c46458a40a0f5d9cabfadc69))

### [2.16.3](https://github.com/ecomplus/cloud-commerce/compare/v2.16.1...v2.16.3) (2024-05-04)


### Bug Fixes

* **apps:** Fixing many apps webhooks functions deployment with configured runtime options ([cc58b9e](https://github.com/ecomplus/cloud-commerce/commit/cc58b9ed06aea80e555a578799f30ff78e52aa0b))
* **cli:** Update bunny.net (CI) edge rules for /.* routes with short cache TTL ([2c7c0c6](https://github.com/ecomplus/cloud-commerce/commit/2c7c0c6b841617d837c30a56a8718c5a2c9619e4))
* **cli:** Update bunny.net (CI) edge rules to bypass /.* (hidden files) routes ([512c9e6](https://github.com/ecomplus/cloud-commerce/commit/512c9e6eb77b270271d834ac7b9cd999534d2265))
* **emails:** Properly defining email template and respecting configured mail options ([e304894](https://github.com/ecomplus/cloud-commerce/commit/e304894bdc2ed1bc0b91383d9623883212e9a890))
* **emails:** Update `@ecomplus/transactional-mails` to v2.0.4 ([d3412f7](https://github.com/ecomplus/cloud-commerce/commit/d3412f75df16e42526b828aa99b9a49a93eb37c3))
* **firebase:** Add middleware to app events handler to debug each event execution ([fea986a](https://github.com/ecomplus/cloud-commerce/commit/fea986acbe1e8d0c47feb494c460a0974053556a))
* **firebase:** Removing FB Conversions and Analytics apps declarations from base config ([9b7f034](https://github.com/ecomplus/cloud-commerce/commit/9b7f0340dd1635b41ad64111d89982b93adba22b))
* **firebase:** Set default 100 max instances for HTTP functions ([07032d0](https://github.com/ecomplus/cloud-commerce/commit/07032d063418082b0c3096e02fb9fbe05fe18a51))
* **ssr:** Add /.* (hidden files) routes to skipped patterns on page views handler ([a8cabe0](https://github.com/ecomplus/cloud-commerce/commit/a8cabe026983f0535f6613c36cbb6f1217b595f7))
* **storefront:** Better typing SSR `routeContext.apiContext` resource + doc ([c687658](https://github.com/ecomplus/cloud-commerce/commit/c68765897e0e8aaacefe2a911be73bd937accb83))
* **tiny-erp:** Always set address "numero" or order export, with 0 or S/N if undefined ([1d032c0](https://github.com/ecomplus/cloud-commerce/commit/1d032c08af259a50c46458a40a0f5d9cabfadc69))

### [2.16.2](https://github.com/ecomplus/cloud-commerce/compare/v2.16.1...v2.16.2) (2024-05-04)


### Bug Fixes

* **apps:** Fixing many apps webhooks functions deployment with configured runtime options ([cc58b9e](https://github.com/ecomplus/cloud-commerce/commit/cc58b9ed06aea80e555a578799f30ff78e52aa0b))
* **cli:** Update bunny.net (CI) edge rules for /.* routes with short cache TTL ([2c7c0c6](https://github.com/ecomplus/cloud-commerce/commit/2c7c0c6b841617d837c30a56a8718c5a2c9619e4))
* **cli:** Update bunny.net (CI) edge rules to bypass /.* (hidden files) routes ([512c9e6](https://github.com/ecomplus/cloud-commerce/commit/512c9e6eb77b270271d834ac7b9cd999534d2265))
* **emails:** Properly defining email template and respecting configured mail options ([e304894](https://github.com/ecomplus/cloud-commerce/commit/e304894bdc2ed1bc0b91383d9623883212e9a890))
* **emails:** Update `@ecomplus/transactional-mails` to v2.0.4 ([d3412f7](https://github.com/ecomplus/cloud-commerce/commit/d3412f75df16e42526b828aa99b9a49a93eb37c3))
* **firebase:** Add middleware to app events handler to debug each event execution ([fea986a](https://github.com/ecomplus/cloud-commerce/commit/fea986acbe1e8d0c47feb494c460a0974053556a))
* **firebase:** Removing FB Conversions and Analytics apps declarations from base config ([9b7f034](https://github.com/ecomplus/cloud-commerce/commit/9b7f0340dd1635b41ad64111d89982b93adba22b))
* **firebase:** Set default 100 max instances for HTTP functions ([07032d0](https://github.com/ecomplus/cloud-commerce/commit/07032d063418082b0c3096e02fb9fbe05fe18a51))
* **ssr:** Add /.* (hidden files) routes to skipped patterns on page views handler ([a8cabe0](https://github.com/ecomplus/cloud-commerce/commit/a8cabe026983f0535f6613c36cbb6f1217b595f7))
* **storefront:** Better typing SSR `routeContext.apiContext` resource + doc ([c687658](https://github.com/ecomplus/cloud-commerce/commit/c68765897e0e8aaacefe2a911be73bd937accb83))
* **tiny-erp:** Always set address "numero" or order export, with 0 or S/N if undefined ([1d032c0](https://github.com/ecomplus/cloud-commerce/commit/1d032c08af259a50c46458a40a0f5d9cabfadc69))

### [2.16.1](https://github.com/ecomplus/cloud-commerce/compare/v2.16.0...v2.16.1) (2024-05-02)


### Bug Fixes

* **deps:** Reverting `pagarme` to v4.34 ([9783d23](https://github.com/ecomplus/cloud-commerce/commit/9783d237889a951463e7ca5e4c877b879b8d197c))

## [2.16.0](https://github.com/ecomplus/cloud-commerce/compare/v2.15.9...v2.16.0) (2024-05-02)


### Features

* **storefront:** Add support to Google sign in on login form composable ([ca408a4](https://github.com/ecomplus/cloud-commerce/commit/ca408a42ee0add8849cdcc6ea2acff290c2d6c2b))
* **storefront:** Update vbeta-app script and handle login inside checkout page ([2ffb97f](https://github.com/ecomplus/cloud-commerce/commit/2ffb97f1836370aa0b6833a771028737827c7a10))


### Bug Fixes

* **cli:** Update bunny.net (CI) edge rules to fast cache not found responses ([7ff11be](https://github.com/ecomplus/cloud-commerce/commit/7ff11be851686807fae8ae430cc562700c7b73e8))
* **cli:** Update bunny.net edge rules to cache (CDN-only) Partytown scripts ([f3c9021](https://github.com/ecomplus/cloud-commerce/commit/f3c902110523bda1f28d839a4f5da8b1a17c005c))
* **cli:** Update CI to cache 404 responses on feeds/app routes (CDN only) ([14f9a79](https://github.com/ecomplus/cloud-commerce/commit/14f9a795712af3107c9de1d4053b6ab1bc61d510))
* **feeds:** Render unavailable(but visible) products to catalog as `out of stock` ([288f3ec](https://github.com/ecomplus/cloud-commerce/commit/288f3ec5963d69a516d90f2443fe40d265d5edd6))
* **firebase:** Try deploying app events functions with `maxInstances = 2` ([6593847](https://github.com/ecomplus/cloud-commerce/commit/65938471a677c5bad7a06c936076f979d55864f5))
* **ssr:** Skip purging short cache TTL (by edge rules) routes ([a51aa1a](https://github.com/ecomplus/cloud-commerce/commit/a51aa1a223a646c58a40e0f390c72cee09925441))
* **storefront:** Update build prod script to fix CSS filename on copied ~fallback and ~index HTML ([820b7b1](https://github.com/ecomplus/cloud-commerce/commit/820b7b1b28d4b608409d6de41106c4960797d666))
* **storefront:** Update customer session state to prevent early reset of `isAuthReady` ([bfae42e](https://github.com/ecomplus/cloud-commerce/commit/bfae42e5e840bdf0aa7830a4fc957d55e5f69e42))

### [2.15.9](https://github.com/ecomplus/cloud-commerce/compare/v2.15.8...v2.15.9) (2024-04-30)


### Bug Fixes

* **ssr:** Skiping events to GA4 (excepting purchase) when already client-side sent (gtag) ([8ea0b8b](https://github.com/ecomplus/cloud-commerce/commit/8ea0b8bd924e14bcb70a9087e309ee982fc3b655))
* **storefront:** Add `sent` bool status to each event object for client-side tagging support ([0d1f88a](https://github.com/ecomplus/cloud-commerce/commit/0d1f88a7750e807541119a555f5553871e44c32a))
* **tiny-erp:** Fix wrogn early return (false not found) on SKU import without variations ([344661d](https://github.com/ecomplus/cloud-commerce/commit/344661d9a8ee0d137ebc9696fe4d9be700282c40))

### [2.15.8](https://github.com/ecomplus/cloud-commerce/compare/v2.15.7...v2.15.8) (2024-04-30)

### [2.15.7](https://github.com/ecomplus/cloud-commerce/compare/v2.15.5...v2.15.7) (2024-04-30)


### Bug Fixes

* **firebase:** Deploy app events functions with `maxInstances = 1` by default ([62e4bc0](https://github.com/ecomplus/cloud-commerce/commit/62e4bc066286c1b1eaf6981dd84688da1075326a))
* **ssr:** Send `engagement_time_msec` to GA4 Measurement for Realtime reports ([6d5c03d](https://github.com/ecomplus/cloud-commerce/commit/6d5c03da295e7a11a20abe17ebab4c8713ebb471))
* **storefront:** Load gtag to set Google `client_id` and `session_id` to server analytics ([b992c8c](https://github.com/ecomplus/cloud-commerce/commit/b992c8cba13558f6b90709f70ba02bfa5ee4dde5))
* **storefront:** Stop parsing gtag `remove_from_cart` event to Meta (fqb) and TikTok (ttq) ([d45f734](https://github.com/ecomplus/cloud-commerce/commit/d45f7344de5ec4790b5028c71a697162886e492b))
* **storefront:** Try getting GA session ID from `_ga_<tag-id>` cookie ([f2ad0d3](https://github.com/ecomplus/cloud-commerce/commit/f2ad0d33e6c0a9f48fce2789e12db55046813f32))

### [2.15.6](https://github.com/ecomplus/cloud-commerce/compare/v2.15.5...v2.15.6) (2024-04-30)


### Bug Fixes

* **firebase:** Deploy app events functions with `maxInstances = 1` by default ([62e4bc0](https://github.com/ecomplus/cloud-commerce/commit/62e4bc066286c1b1eaf6981dd84688da1075326a))
* **ssr:** Send `engagement_time_msec` to GA4 Measurement for Realtime reports ([6d5c03d](https://github.com/ecomplus/cloud-commerce/commit/6d5c03da295e7a11a20abe17ebab4c8713ebb471))
* **storefront:** Load gtag to set Google `client_id` and `session_id` to server analytics ([b992c8c](https://github.com/ecomplus/cloud-commerce/commit/b992c8cba13558f6b90709f70ba02bfa5ee4dde5))
* **storefront:** Stop parsing gtag `remove_from_cart` event to Meta (fqb) and TikTok (ttq) ([d45f734](https://github.com/ecomplus/cloud-commerce/commit/d45f7344de5ec4790b5028c71a697162886e492b))
* **storefront:** Try getting GA session ID from `_ga_<tag-id>` cookie ([f2ad0d3](https://github.com/ecomplus/cloud-commerce/commit/f2ad0d33e6c0a9f48fce2789e12db55046813f32))

### [2.15.5](https://github.com/ecomplus/cloud-commerce/compare/v2.15.4...v2.15.5) (2024-04-30)


### Bug Fixes

* **api:** Properly handling retries on rate limit errors (429) ([fc40b2b](https://github.com/ecomplus/cloud-commerce/commit/fc40b2bb0c42249ad81a794f26ba5c9e276455d7))
* **events:** Removing dropped packages ([0803120](https://github.com/ecomplus/cloud-commerce/commit/080312096d8fa3b5db7941109eab4f53b0f0b953))
* **firebase:** Trying to increase `initialRetryDelayMillis` for store events Pub/Sub ([c5bc723](https://github.com/ecomplus/cloud-commerce/commit/c5bc723a7588ae8a1058460756a429af167a09da))
* **modules:** Passing additional app ID (known) to default discount app ([0814114](https://github.com/ecomplus/cloud-commerce/commit/08141146f50a8de5d9ae3e78d691347b7da9dffa))
* **ssr:** Check Accept header and bot user agents to early return without proceed analytics events ([961c837](https://github.com/ecomplus/cloud-commerce/commit/961c837dcdb116446fa8eddfaaeced323f6d837a))
* **storefront:** Emit gtag `view_item_list` on product card out of product details page ([0c8fa13](https://github.com/ecomplus/cloud-commerce/commit/0c8fa13d3f7dab76a74cc7ea1bdd8698ab27c724))
* **storefront:** Naive detect bot user agents and skip sending server analytcis events ([ac1737b](https://github.com/ecomplus/cloud-commerce/commit/ac1737be8f65aa5eb118480feedd50700bbfcd39))
* **tiny-erp:** Run store event function on 512MB as needed ([e8b8cf8](https://github.com/ecomplus/cloud-commerce/commit/e8b8cf8b7779d192f00eada376cb8727821c67c9))

### [2.15.4](https://github.com/ecomplus/cloud-commerce/compare/v2.15.3...v2.15.4) (2024-04-30)


### Bug Fixes

* **cli:** Fix bunny.net CI to bypass perma-cache for TXT ([ac06c56](https://github.com/ecomplus/cloud-commerce/commit/ac06c563dc1678a743633a7ed2fdee583da70cc1))
* **cli:** Fix bunny.net CI with new `Reset feeds/app CDN cache` edge rule ([09c18d6](https://github.com/ecomplus/cloud-commerce/commit/09c18d6e4db2266d3bca9b8148ad91935627d8d3))
* **modules:** Fix buyer/payer masked data inside transaction object ([fc902d8](https://github.com/ecomplus/cloud-commerce/commit/fc902d8389981867eb4c968dfde91126cb4f54be))
* **modules:** Fixing subtotal calculation on checkout step with multiple items ([1dcacd1](https://github.com/ecomplus/cloud-commerce/commit/1dcacd10ef0c1347b83950b5301456ceb95a9d9b))

### [2.15.3](https://github.com/ecomplus/cloud-commerce/compare/v2.15.2...v2.15.3) (2024-04-30)


### Bug Fixes

* **api:** Extending error message with response error code and request URL ([216a31b](https://github.com/ecomplus/cloud-commerce/commit/216a31b09233b7c97e7b3dd456b6320ed6c2ee10))
* **deps:** Update non-major dependencies ([#367](https://github.com/ecomplus/cloud-commerce/issues/367)) ([fa9aa95](https://github.com/ecomplus/cloud-commerce/commit/fa9aa95315f686805342506671db639952e48dea))
* **ssr:** Use current timestamp for Meta/TikTok events when time not sent ([332df8e](https://github.com/ecomplus/cloud-commerce/commit/332df8ec9acce83b0d979e762782a1e344d0d2e7))
* **storefront:** Properly parse `fbc` value from `?fbclid` query param for Meta server API ([aad325e](https://github.com/ecomplus/cloud-commerce/commit/aad325e7207a7a62f35907970abd0b205e842de6))

### [2.15.2](https://github.com/ecomplus/cloud-commerce/compare/v2.15.0...v2.15.2) (2024-04-27)


### Bug Fixes

* **storefront:** Send analytics events time in seconds as expected by Meta and TikTok APIs ([67c7576](https://github.com/ecomplus/cloud-commerce/commit/67c757638eac6f8439329d792897b96561a4fdaf))

### [2.15.1](https://github.com/ecomplus/cloud-commerce/compare/v2.15.0...v2.15.1) (2024-04-27)


### Bug Fixes

* **storefront:** Send analytics events time in seconds as expected by Meta and TikTok APIs ([67c7576](https://github.com/ecomplus/cloud-commerce/commit/67c757638eac6f8439329d792897b96561a4fdaf))

## [2.15.0](https://github.com/ecomplus/cloud-commerce/compare/v2.14.7...v2.15.0) (2024-04-27)


### Features

* **storefront:** New `addGtagEventMiddleware` on use analytics state ([7e3099d](https://github.com/ecomplus/cloud-commerce/commit/7e3099d8b528a45bad6f6c7c55e30489d6f4ebe6))
* **storefront:** Parsing checkout gtag events to Meta (fbq) and TikTok (ttq) `InitiateCheckout` ([6c8f9bf](https://github.com/ecomplus/cloud-commerce/commit/6c8f9bfb2ae183ec3ddaacacbae4238980a0086c))
* **storefront:** Parsing gtag purchase event to Meta (fbq) and TikTok (ttq) ([487ed1c](https://github.com/ecomplus/cloud-commerce/commit/487ed1c232d1cffd0eeccc8e3a40280f9577f732))


### Bug Fixes

* **ssr:** Properly send Meta and TikTok events with correct ID (deduplication) and timestamp ([d1ab94e](https://github.com/ecomplus/cloud-commerce/commit/d1ab94e6ceb54e5ebcfceaaa76fe023fa475f8e9))
* **storefront:** Update analytics state to emit events with ID and timestamp for deduplication ([35e367e](https://github.com/ecomplus/cloud-commerce/commit/35e367e2e1e396580018081d9d8959d9ad138461))

### [2.14.7](https://github.com/ecomplus/cloud-commerce/compare/v2.14.6...v2.14.7) (2024-04-26)


### Bug Fixes

* **cli:** Fix bunny.net CI to bypass CDN cache on status not 200 nor 301 ([42c3123](https://github.com/ecomplus/cloud-commerce/commit/42c3123fc843e99cfc29f527dfd38b434e6318af))
* **ssr:** Better debugging server-side analytics error responses ([dadb09a](https://github.com/ecomplus/cloud-commerce/commit/dadb09a02dbcd8091f72147db53b47c30a02ff38))
* **ssr:** Keep page view events to server-side analytics APIs ([97ba9db](https://github.com/ecomplus/cloud-commerce/commit/97ba9db8d48662410bdce91f08ec7d62711078fb))
* **ssr:** Try fowaring user agent and IP addr to GA4 measurment protocol API with request headers ([73513cb](https://github.com/ecomplus/cloud-commerce/commit/73513cb5a7585f9d7236d64c552769e38c2c3d7a))
* **ssr:** Wait async API context handling to reset status on error (404) ([3858206](https://github.com/ecomplus/cloud-commerce/commit/3858206afa49a8a80b5e8cdc8966a964d5d8a9c6))

### [2.14.6](https://github.com/ecomplus/cloud-commerce/compare/v2.14.5...v2.14.6) (2024-04-25)

### [2.14.5](https://github.com/ecomplus/cloud-commerce/compare/v2.14.4...v2.14.5) (2024-04-25)

### [2.14.4](https://github.com/ecomplus/cloud-commerce/compare/v2.14.3...v2.14.4) (2024-04-25)


### Bug Fixes

* **modules:** Prevent app data unexpected manipulation on deep objects ([b811d98](https://github.com/ecomplus/cloud-commerce/commit/b811d983d48d49bb4f0b80b3f1e6466ae58ef383))
* **storefront:** Handle optional `window.GOOGLE_ADS_ID` to emit GAds conversion on purchase ([26e2455](https://github.com/ecomplus/cloud-commerce/commit/26e2455e31b6df1850b50e7453846e47aebddc60))
* **storefront:** Update vbeta-app script with `@ecomplus/storefront-app@2.0.0-beta.200` ([0484e82](https://github.com/ecomplus/cloud-commerce/commit/0484e8241807ed1f6e8b1f531e27f37a5771f7a6))

### [2.14.3](https://github.com/ecomplus/cloud-commerce/compare/v2.14.2...v2.14.3) (2024-04-17)


### Bug Fixes

* **emails:** Set "reply to" with content settings email by default ([e643573](https://github.com/ecomplus/cloud-commerce/commit/e6435739aa7240c484a32929f749048880b369f6))
* **feeds:** Properly handling nested entry values (fixes `additional_image_link`) ([5f20936](https://github.com/ecomplus/cloud-commerce/commit/5f20936ff7168f9ecba275e7de421b5910f296c4))

### [2.14.2](https://github.com/ecomplus/cloud-commerce/compare/v2.14.1...v2.14.2) (2024-04-17)


### Bug Fixes

* **cli:** Fix bunny.net CI to bypass perma-cache for /app/ (SPA) routes ([739caec](https://github.com/ecomplus/cloud-commerce/commit/739caec3dc0c0e8659f98317d89d6e2faaea05b1))
* **emails:** Properly settings default email sender (from) and mask sender ([e199706](https://github.com/ecomplus/cloud-commerce/commit/e19970613b66ec258a98024ba5f7f3ac7bd69322))
* **storefront:** Bump Vue to latest v3.4.23 ([553572d](https://github.com/ecomplus/cloud-commerce/commit/553572d10b30828df207db45024cb123b515ae4f))
* **storefront:** Minor fix Decap CMS `backend.api_root` with no trailing slash ([81abc3c](https://github.com/ecomplus/cloud-commerce/commit/81abc3c7976d4e596dbc2306b791234bb52ee7d4))

### [2.14.1](https://github.com/ecomplus/cloud-commerce/compare/v2.14.0...v2.14.1) (2024-04-16)


### Bug Fixes

* **storefront:** Prevent hydration mismatch with `<AccountLink>` on logged state ([a4d1be9](https://github.com/ecomplus/cloud-commerce/commit/a4d1be9a171fe292794da2b0013f34d9b690a567))
* **storefront:** Properly set `ecomPassport` session auth for vbeta-app ([a6d8e4e](https://github.com/ecomplus/cloud-commerce/commit/a6d8e4ebf27f134fc29da0ab5025c8bc73431426))

## [2.14.0](https://github.com/ecomplus/cloud-commerce/compare/v2.13.1...v2.14.0) (2024-04-16)


### Features

* **feeds:** Start rendering catalog sitemap (categories/brands/products) on /sitemap-catalog.xml ([c52ffd7](https://github.com/ecomplus/cloud-commerce/commit/c52ffd738f72c00902e306c8565a0950b1d35c1b))


### Bug Fixes

* **cli:** Properly bypass CMS (/admin/) routes on bunny.net CDN ([a35df9d](https://github.com/ecomplus/cloud-commerce/commit/a35df9d1ab000a0f6be0b4caeb5c47afe6993216))
* **cli:** Update bunny.net edge rules config to bypass all .xml URLs (sitemap and catalogs) ([31dc5c1](https://github.com/ecomplus/cloud-commerce/commit/31dc5c18f12c41d50b8fb0198369564cc92fd0ff))
* **feeds:** Properly set response headers on products catalog ([269d30a](https://github.com/ecomplus/cloud-commerce/commit/269d30a0e9d9e8c559e49148b91559c0d94f18c3))
* **storefront:** Add `isSubmitReady` state to login form composable ([4ce2418](https://github.com/ecomplus/cloud-commerce/commit/4ce2418f720ab0d8e82e33a4ec9a1cd5574cbf71))
* **storefront:** Edit production build script to add sitemap URL (with domain) on static robots.txt ([4f19fae](https://github.com/ecomplus/cloud-commerce/commit/4f19fae9a49aa5db77b15be9e7c8fe202f9cb4bb))
* **storefront:** Fix `<AccountLink>` with separated login URL ([26ba81d](https://github.com/ecomplus/cloud-commerce/commit/26ba81d9e2ef7590cfb1759a8f9f303b39991701))
* **storefront:** Prevent error with skeleton with less than 5 rows ([2c9c009](https://github.com/ecomplus/cloud-commerce/commit/2c9c0099d49915d93eb5ae0dbcd041c843be108e))
* **storefront:** Set Firebase Auth `languageCode` with default store settings language ([15c93b6](https://github.com/ecomplus/cloud-commerce/commit/15c93b6fe0e3186b38ac3a5659a4be0622ea8de1))
* **storefront:** Update vbeta-app script with `@ecomplus/storefront-app@2.0.0-beta.199` ([57f6878](https://github.com/ecomplus/cloud-commerce/commit/57f68787f684a0d9d56d747b7c9a1a5acfe45ee5))

### [2.13.1](https://github.com/ecomplus/cloud-commerce/compare/v2.13.0...v2.13.1) (2024-04-15)

## [2.13.0](https://github.com/ecomplus/cloud-commerce/compare/v2.12.2...v2.13.0) (2024-04-15)


### Features

* **feeds:** Start rendering products XML catalog (Meta and GMC) at `/_feeds/catalog` endpoint ([8968e73](https://github.com/ecomplus/cloud-commerce/commit/8968e73089662d2564da529efc2a68b1b74f5510))


### Bug Fixes

* **deps:** Update non-major dependencies ([#364](https://github.com/ecomplus/cloud-commerce/issues/364)) ([92066a1](https://github.com/ecomplus/cloud-commerce/commit/92066a16c79c53f214ae6945f495c91c3f721599))
* **storefront:** Prevent antecipated logout and ensure logout reactivity on customer session state ([36c2b5d](https://github.com/ecomplus/cloud-commerce/commit/36c2b5d76ac368688b8d631b629b835c56dbc27c))
* **storefront:** Update vbeta-app script with `@ecomplus/storefront-app@2.0.0-beta.198` ([4781d32](https://github.com/ecomplus/cloud-commerce/commit/4781d32a1d4b3ed2cf537e3ad86241167aab71ec))

### [2.12.2](https://github.com/ecomplus/cloud-commerce/compare/v2.12.1...v2.12.2) (2024-04-09)


### Bug Fixes

* **api:** Improving `EventsResult` type def ([ffd7d87](https://github.com/ecomplus/cloud-commerce/commit/ffd7d871bd52ef06e066b3e205aa069eae5566a3))
* **apps:** Not relying on api event body anymore ([0e999d6](https://github.com/ecomplus/cloud-commerce/commit/0e999d68266e22a57535261424acc99770b5a1c1))
* **emails:** Prevent fatal error with undefined API event body ([22ab548](https://github.com/ecomplus/cloud-commerce/commit/22ab548ad4b5a049f93e0fb9d3271f788a7541c5))
* Ensure `body` and `resource` fields on store event objects ([65e7796](https://github.com/ecomplus/cloud-commerce/commit/65e7796093069ab47dc897f9a520e02e8b67cdfc))

### [2.12.1](https://github.com/ecomplus/cloud-commerce/compare/v2.12.0...v2.12.1) (2024-04-08)


### Bug Fixes

* **pagaleve:** Fixing webhook Function namespace (`pagaleve`) ([42195ee](https://github.com/ecomplus/cloud-commerce/commit/42195eef3599a78ff0fcce123ba7810904a567ef))

## [2.12.0](https://github.com/ecomplus/cloud-commerce/compare/v2.11.2...v2.12.0) (2024-04-07)


### Features

* **pagaleve:** Add new app for Pagaleve payment method ([2bc30d0](https://github.com/ecomplus/cloud-commerce/commit/2bc30d0f3019d1d6938dd344e5a030a232eb9c56))


### Bug Fixes

* Add `/assets` dir to exported `files` on many apps package.json (common for payments) ([bd776ac](https://github.com/ecomplus/cloud-commerce/commit/bd776acda9281545df321631a056f35298694edf))

### [2.11.2](https://github.com/ecomplus/cloud-commerce/compare/v2.11.1...v2.11.2) (2024-04-05)

### [2.11.1](https://github.com/ecomplus/cloud-commerce/compare/v2.11.0...v2.11.1) (2024-04-05)

## [2.11.0](https://github.com/ecomplus/cloud-commerce/compare/v2.10.7...v2.11.0) (2024-04-05)


### Features

* **api:** Improving `ApiError` for debug with `url` property (string) ([d8cfaee](https://github.com/ecomplus/cloud-commerce/commit/d8cfaee339bf6dd552edabec8788307914f8cc4b))


### Bug Fixes

* **storefront:** Bump Astro to latest v4.5.16 ([8f52440](https://github.com/ecomplus/cloud-commerce/commit/8f5244025dd653a5680b8313a4f5b2ee1b07a23c))
* **storefront:** Ensure `global.$storefront` typedef is properly set ([cdf92d6](https://github.com/ecomplus/cloud-commerce/commit/cdf92d6acee551ab44e954086fae926aaaa59f4e))
* **storefront:** New `tsconfig.base.json` file to deal with include/exclude when usign extends ([55fd330](https://github.com/ecomplus/cloud-commerce/commit/55fd3308a1ad5b9e89e15a9cb46b10ff0867a027))
* **storefront:** Revert Astro to 4.5.10 ([7d3d05d](https://github.com/ecomplus/cloud-commerce/commit/7d3d05d4c16d5fa5479baf501eaccfdc7359ac79))

### [2.10.7](https://github.com/ecomplus/cloud-commerce/compare/v2.10.6...v2.10.7) (2024-04-04)


### Bug Fixes

* **ssr:** Properly remove querystring AND hash from page view URLs to purge CDN (ISR) cache ([e33c473](https://github.com/ecomplus/cloud-commerce/commit/e33c473656cf30b7beb295fa0af77262a03fa05d))
* **storefront:** Bump Astro to latest v4.5.15 ([7d41f5e](https://github.com/ecomplus/cloud-commerce/commit/7d41f5e86c60bdbdd18cad79060b75f2e85d95b4))

### [2.10.6](https://github.com/ecomplus/cloud-commerce/compare/v2.10.5...v2.10.6) (2024-04-02)


### Bug Fixes

* **storefront:** Bump Astro to latest v4.5.13 ([86f7eb4](https://github.com/ecomplus/cloud-commerce/commit/86f7eb437c5312cf23f3abb5edd8a806aa0f26f5))
* **storefront:** Removing `vite-plugin-pwa` from tsconfig ([6214bc7](https://github.com/ecomplus/cloud-commerce/commit/6214bc763e59cd9c11be82b743e2b2466459ad1b))

### [2.10.5](https://github.com/ecomplus/cloud-commerce/compare/v2.10.4...v2.10.5) (2024-04-02)


### Bug Fixes

* **storefront:** Removing `mime` from pkg dependencies to use "peer" Astro dependency semver ([a6e5902](https://github.com/ecomplus/cloud-commerce/commit/a6e59021af547e7fe68c71d75632343dd86564b4))

### [2.10.4](https://github.com/ecomplus/cloud-commerce/compare/v2.10.3...v2.10.4) (2024-04-01)


### Bug Fixes

* **deps:** Update non-major dependencies ([#352](https://github.com/ecomplus/cloud-commerce/issues/352)) ([240749f](https://github.com/ecomplus/cloud-commerce/commit/240749f74099e2c9b0d3a4ba32b3a1494dbdebe3))
* **storefront:** Fixing imports to `mime/lite` with mime v4 ([76b91f5](https://github.com/ecomplus/cloud-commerce/commit/76b91f521b1a0890fe461626cd000d3f1058c542))

### [2.10.3](https://github.com/ecomplus/cloud-commerce/compare/v2.10.2...v2.10.3) (2024-03-30)


### Bug Fixes

* **storefront:** Properly mounting search querystring on `useProductShelf` for related products ([a892367](https://github.com/ecomplus/cloud-commerce/commit/a892367c3a3d98c9b8693ac7de1c11352955383c))

### [2.10.2](https://github.com/ecomplus/cloud-commerce/compare/v2.10.1...v2.10.2) (2024-03-29)


### Bug Fixes

* **i18n:** Fixing package.json missing files ([e02a289](https://github.com/ecomplus/cloud-commerce/commit/e02a2898b6b93006256471c906a702eaf06b4430))

### [2.10.1](https://github.com/ecomplus/cloud-commerce/compare/v2.10.0...v2.10.1) (2024-03-29)


### Bug Fixes

* **storefront:** Fixing package.json missing files ([88b9ef9](https://github.com/ecomplus/cloud-commerce/commit/88b9ef9f9edc2bad7900e4203cb06ad97aa48059))

## [2.10.0](https://github.com/ecomplus/cloud-commerce/compare/v2.9.0...v2.10.0) (2024-03-28)


### Features

* **app-emails:** Supporting custom mail renders within optional `global.$transactionalMails` ([30790f9](https://github.com/ecomplus/cloud-commerce/commit/30790f960f9d2d37b766ba9c50ebf032cc03f241))
* **modules:** Handle optional `global.$activeModuleApps` to mock active apps for modules ([a1f5df1](https://github.com/ecomplus/cloud-commerce/commit/a1f5df18d2961b7e531026a97d354d86bc21dc80)), closes [#237](https://github.com/ecomplus/cloud-commerce/issues/237)
* **modules:** Supporting masked icustomer fields on checkout for low level (unverified) login ([4d11a3d](https://github.com/ecomplus/cloud-commerce/commit/4d11a3dc96bf7a51348b2f3ae6bc53224b1e7124))
* **passport:** Handle `identify` endpoint (from v1) for low level login returning masked info ([5360ed1](https://github.com/ecomplus/cloud-commerce/commit/5360ed1bb5797b10f37f6b1b5020620dcffdf00f))
* **storefront:** Add `?ref=` to external links on global `<ALink>` ([498b146](https://github.com/ecomplus/cloud-commerce/commit/498b1466f7e1b77968ad13557ffe7f7ebe271056))


### Bug Fixes

* **api:** Exporting all interfaces and API client types on `@cloudcommerce/api/types` ([c376a03](https://github.com/ecomplus/cloud-commerce/commit/c376a036b504064fe7c99eb072207ecd98615b64))
* **deps:** Update non-major dependencies ([#350](https://github.com/ecomplus/cloud-commerce/issues/350)) ([c76551e](https://github.com/ecomplus/cloud-commerce/commit/c76551e80913879cf663215204e49ba4ec2b4343))
* **modules:** Update list payments schema and types removing (unrequiring) `addresses[]._id` field ([17bd088](https://github.com/ecomplus/cloud-commerce/commit/17bd0882d9c604766b4ea697b0197373c348918a))
* **passport:** Check customer login and orders enabled on match ([5058dcf](https://github.com/ecomplus/cloud-commerce/commit/5058dcf46579c827dc507ca78338cdc46a99b12c))
* **passport:** Fixing build error with named/default export ([ff75fac](https://github.com/ecomplus/cloud-commerce/commit/ff75facbf0799c71118c31b854cd4a1fa87928d0))
* **ssr:** Consider saved bunny.net storage keys expired after 1h ([f161157](https://github.com/ecomplus/cloud-commerce/commit/f161157dd9f26740be6c4d59eef825bbaa288ad9))
* **storefront:** Bump Astro to latest v4.5.12 ([c0fecb7](https://github.com/ecomplus/cloud-commerce/commit/c0fecb71dcef414dd5a12996d60fd0f2eeebece3))
* **storefront:** Bump Astro to latest v4.5.6 ([#346](https://github.com/ecomplus/cloud-commerce/issues/346)) ([0da115b](https://github.com/ecomplus/cloud-commerce/commit/0da115bbfb3830d76863db6454d9b4a4b959da5d))
* **storefront:** Update Astro to v4.5.9 ([#348](https://github.com/ecomplus/cloud-commerce/issues/348)) ([4b1e7ab](https://github.com/ecomplus/cloud-commerce/commit/4b1e7ab08b527ad28a5f65760508f60e3252a02a))
* **storefront:** Update vbeta-app script with `@ecomplus/storefront-app@2.0.0-beta.195` ([68e2d07](https://github.com/ecomplus/cloud-commerce/commit/68e2d077c956467ac007a2ad383314cadfc659f6))
* **storefront:** Update vbeta-app script with `@ecomplus/storefront-app@2.0.0-beta.197` ([f29800f](https://github.com/ecomplus/cloud-commerce/commit/f29800f553eb4444762912fdb59a93ab987c9f95))

## [2.9.0](https://github.com/ecomplus/cloud-commerce/compare/v2.8.8...v2.9.0) (2024-03-15)


### Features

* **storefront:** Secure prefetch links for instant INP without TBT ([2b4bbb4](https://github.com/ecomplus/cloud-commerce/commit/2b4bbb48f1c35d7fe2f99b398137ebf6ee5c0092))


### Bug Fixes

* **storefront:** Ensure context storage for global `$storefront` with Node `AsyncLocalStorage` ([42a9322](https://github.com/ecomplus/cloud-commerce/commit/42a932298eccf171516e1601da57a558a1fbfc2f))

### [2.8.8](https://github.com/ecomplus/cloud-commerce/compare/v2.8.7...v2.8.8) (2024-03-13)


### Bug Fixes

* **cli:** Handle `start` (npm start) with ssr dev server ([0093426](https://github.com/ecomplus/cloud-commerce/commit/009342688ee2e753abd943c3fd07b161e08ccf3e))
* **storefront:** Move script importing `astro:prefetch` to body, within `base-body-scripts` slot ([141cca4](https://github.com/ecomplus/cloud-commerce/commit/141cca42733a7a9b13b83fb0556d39a1e953dd8d))
* **storefront:** Properly listen grids data load on SKU selector composable ([5c0ad4f](https://github.com/ecomplus/cloud-commerce/commit/5c0ad4f6ef1b60bb5bea0834a23c2f92dd66597c))

### [2.8.7](https://github.com/ecomplus/cloud-commerce/compare/v2.8.6...v2.8.7) (2024-03-12)

### [2.8.6](https://github.com/ecomplus/cloud-commerce/compare/v2.8.5...v2.8.6) (2024-03-12)

### [2.8.5](https://github.com/ecomplus/cloud-commerce/compare/v2.8.4...v2.8.5) (2024-03-12)

### [2.8.4](https://github.com/ecomplus/cloud-commerce/compare/v2.8.3...v2.8.4) (2024-03-12)

### [2.8.3](https://github.com/ecomplus/cloud-commerce/compare/v2.8.2...v2.8.3) (2024-03-12)

### [2.8.2](https://github.com/ecomplus/cloud-commerce/compare/v2.8.1...v2.8.2) (2024-03-12)

### [2.8.1](https://github.com/ecomplus/cloud-commerce/compare/v2.8.0...v2.8.1) (2024-03-12)

## [2.8.0](https://github.com/ecomplus/cloud-commerce/compare/v2.7.5...v2.8.0) (2024-03-12)


### Features

* **ssr:** Start setting `CDN-Tag` header when bunny.net CDN detected for advanced cache purge ([fba85fc](https://github.com/ecomplus/cloud-commerce/commit/fba85fc67cf024343f216b647635340efc040ef7))
* **storefront:** New optional `prefetch` prop to `<ALink>` global component ([547998c](https://github.com/ecomplus/cloud-commerce/commit/547998c3317551dd7ec24e064a67e26e9fa5111c))


### Bug Fixes

* **deps:** Update non-major dependencies ([#345](https://github.com/ecomplus/cloud-commerce/issues/345)) ([c5b9fa7](https://github.com/ecomplus/cloud-commerce/commit/c5b9fa79d09ab3ac63f783c680e029c84620603b))
* **storefront:** Bump Astro to v4.5.0 ([#344](https://github.com/ecomplus/cloud-commerce/issues/344)) ([8e04667](https://github.com/ecomplus/cloud-commerce/commit/8e04667320321132353a343512327cedd4202f2d))
* **storefront:** Ensure offset,limit is respected on related products shelf ([e05db9d](https://github.com/ecomplus/cloud-commerce/commit/e05db9d72556f1d2adbe3f8a5fd2e631f2ed4121))
* **storefront:** Fix parsing extra animate utilities and keyframes from Tailwind config to UnoCSS ([df9c170](https://github.com/ecomplus/cloud-commerce/commit/df9c17037633608e757580bce76e7cc04511ccbd))
* **storefront:** Programatically prefetch visible links on global `<ALink>` ([0a3aa96](https://github.com/ecomplus/cloud-commerce/commit/0a3aa9690fbf9da80aaac1015f2d92340b958abf))
* **storefront:** Properly set status 404 (or 5xx) on async API context error ([b371cb4](https://github.com/ecomplus/cloud-commerce/commit/b371cb4dc2fb4494f685d1d810ffe2b9baeda3d6))
* **storefront:** Send analytics page view as origin URL on error fallback page ([bd9a47b](https://github.com/ecomplus/cloud-commerce/commit/bd9a47b2f652f30465f58544257208f75dc1862d))

### [2.7.5](https://github.com/ecomplus/cloud-commerce/compare/v2.7.4...v2.7.5) (2024-03-09)


### Bug Fixes

* **deps:** update non-major dependencies ([#342](https://github.com/ecomplus/cloud-commerce/issues/342)) ([be0f962](https://github.com/ecomplus/cloud-commerce/commit/be0f9624c6f4c5349e5b5b5de2eb665447d6c01c))
* **storefront:** Fix item quantitymin-max on next tick (9ms) ([6a003e7](https://github.com/ecomplus/cloud-commerce/commit/6a003e73126bccefcbc95c2d0f0b4b8a6baf3440))
* **storefront:** Properly catching not found content files by slug on route context ([32dd183](https://github.com/ecomplus/cloud-commerce/commit/32dd183e24c0258994f8143a09d8cdfaf380a54b))
* **storefront:** Supporting custom animations from Tailwind config to UnoCSS rules ([220315c](https://github.com/ecomplus/cloud-commerce/commit/220315c05a468dbbe00ff5a9e808f01da93804b4))

### [2.7.4](https://github.com/ecomplus/cloud-commerce/compare/v2.7.3...v2.7.4) (2024-03-02)


### Bug Fixes

* **cli:** Add "Force mime text/html" edge rule to bunny.net CI config base ([37d2c2b](https://github.com/ecomplus/cloud-commerce/commit/37d2c2bc942aa1033fe6be6f5395b54fead16b3e))
* **ssr:** Revert ISR with bunny.net by directly updating perma-cache storage files ([858f883](https://github.com/ecomplus/cloud-commerce/commit/858f88309dc7c85c3e98ae4462f2f671c409dc9c))
* **storefront:** Bump Astro to latest v4.4.9 ([3a315f0](https://github.com/ecomplus/cloud-commerce/commit/3a315f09958812d0d23a4c65b0ae262c94515f8e))

### [2.7.3](https://github.com/ecomplus/cloud-commerce/compare/v2.7.2...v2.7.3) (2024-03-01)

### [2.7.2](https://github.com/ecomplus/cloud-commerce/compare/v2.7.1...v2.7.2) (2024-03-01)

### [2.7.1](https://github.com/ecomplus/cloud-commerce/compare/v2.7.0...v2.7.1) (2024-03-01)

## [2.7.0](https://github.com/ecomplus/cloud-commerce/compare/v2.6.5...v2.7.0) (2024-03-01)


### Features

* **storefront:** New `orderedProductIds` optional prop to product shelf composable ([2ee2f6b](https://github.com/ecomplus/cloud-commerce/commit/2ee2f6bd8902fe105d28115704f34082a1fa213a))


### Bug Fixes

* **emails:** Bump nodemailer to v6.9.11 ([d2bbb33](https://github.com/ecomplus/cloud-commerce/commit/d2bbb33f6b27412702e733b9036d7686dcdf55a0))
* **storefront:** Fix parsing shelf `collectionIdAndInfo` from CMS content for categories/brands ([88640ba](https://github.com/ecomplus/cloud-commerce/commit/88640ba9534e72e165c77a1fdd1d5c8abddddf4a))
* **storefront:** Update `usePageMain` to properly support `titleLink` from section CMS content ([162a7a0](https://github.com/ecomplus/cloud-commerce/commit/162a7a05d787f143f14b8e88bb80e2423d92aa6f))
* **storefront:** Update Vue to latest v3.4.21 ([482dc36](https://github.com/ecomplus/cloud-commerce/commit/482dc360f68d6a02afd01c1276884df8fa9758ae))

### [2.6.5](https://github.com/ecomplus/cloud-commerce/compare/v2.6.4...v2.6.5) (2024-02-29)


### Bug Fixes

* **ssr:** Revert bump bunny.net CDN cache with /purge request only, then refresh with simple URL get ([72518e0](https://github.com/ecomplus/cloud-commerce/commit/72518e0bdfcfca308696f47a10699f8b9c53239b))
* **storefront:** Bump Astro to latest v4.4.6 ([be8239b](https://github.com/ecomplus/cloud-commerce/commit/be8239bf7966cb742ddac0365163d3281ea0c41a))
* **storefront:** Prevent `<Carousel>` scroll reset on mobile browser bar toogle ([9817280](https://github.com/ecomplus/cloud-commerce/commit/9817280dd4f16931de50dddb662208a21a83ed56))

### [2.6.4](https://github.com/ecomplus/cloud-commerce/compare/v2.6.3...v2.6.4) (2024-02-27)


### Bug Fixes

* **deps:** Bump nodemailer to latest v6.9.10 [security] ([e4fa4a0](https://github.com/ecomplus/cloud-commerce/commit/e4fa4a0f8332c8d1003fa8bbe0ea74d0e9386a45))
* **deps:** Bump Vite to latest v5.1.4 (security) ([d511823](https://github.com/ecomplus/cloud-commerce/commit/d511823200f8aee1aa0479693954e95ae694980d))
* **deps:** Update non-major dependencies ([#333](https://github.com/ecomplus/cloud-commerce/issues/333)) ([2b4e6b1](https://github.com/ecomplus/cloud-commerce/commit/2b4e6b1ad25be1beb1a830e728e493d9c8d04948))
* **ssr:** Ensure "ISR" fetching fresh HTML (skip CDN cache) on update ([c40ca88](https://github.com/ecomplus/cloud-commerce/commit/c40ca888f2d8a6e1e9ddfe5598dc362a39c9fa8b))
* **storefront:** Bump Vue to latest v3.4.20 ([8270105](https://github.com/ecomplus/cloud-commerce/commit/8270105dab4c059a38426619c1f22a3a4a08dd17))
* **storefront:** Handle custom content types with new `@@sf/custom-content` module ([f6507fd](https://github.com/ecomplus/cloud-commerce/commit/f6507fdd37a57e146f06bea7d3c21ab1665543df))

### [2.6.3](https://github.com/ecomplus/cloud-commerce/compare/v2.6.2...v2.6.3) (2024-02-24)


### Bug Fixes

* **ssr:** Update (PUT) bunny.net perma cache with fresh HTML instead of delete and further get ([46a69eb](https://github.com/ecomplus/cloud-commerce/commit/46a69ebd3808884be74eeaebad0796be7da2e342))
* **storefront:** Bump Astro to latest v4.4.4 ([7943c78](https://github.com/ecomplus/cloud-commerce/commit/7943c786bcdd2788ac7d29e9e9fb3b06c5422ba9))
* **storefront:** Prevent warnings with undeclared `cmsPreview` prop on composables for sections ([2b6eec4](https://github.com/ecomplus/cloud-commerce/commit/2b6eec4ad101c252a131de30dbc9fcd9d97dc1d7))

### [2.6.2](https://github.com/ecomplus/cloud-commerce/compare/v2.6.1...v2.6.2) (2024-02-24)


### Bug Fixes

* **ssr:** Ensure cache refresh req is sent after CDN cache purge on cron save views ([943f001](https://github.com/ecomplus/cloud-commerce/commit/943f00128e618354b84fd203db071b6245351281))

### [2.6.1](https://github.com/ecomplus/cloud-commerce/compare/v2.6.0...v2.6.1) (2024-02-24)


### Bug Fixes

* **storefront:** Add `searchEngine` as custom prop of SSR `usePageSections` composable ([74f3078](https://github.com/ecomplus/cloud-commerce/commit/74f307807406d30a891990c5a6da44d125e8e9dc))
* **storefront:** Better handle search engine middlewares passing search options object ([daf2084](https://github.com/ecomplus/cloud-commerce/commit/daf2084203561402ef72493d7840c7081eabac6e))
* **storefront:** New optional `searchEngine` on search modal and showcase composables ([65c6e21](https://github.com/ecomplus/cloud-commerce/commit/65c6e21b3503227be2cb11d6c40558d480b0f72e))
* **storefront:** Only sync middlewares (no promises) for `SearchEngine` fetch ([4fa8965](https://github.com/ecomplus/cloud-commerce/commit/4fa89658c409b90203ac76f8ee54cfbefdca44a3))
* **storefront:** Properly support `SearchEngine` extendability with new `addMiddleware` method ([0142368](https://github.com/ecomplus/cloud-commerce/commit/01423686f3c915da63a3e476521d7cf275d67dd0))

## [2.6.0](https://github.com/ecomplus/cloud-commerce/compare/v2.5.1...v2.6.0) (2024-02-22)


### Features

* **storefront:** New `<Spinner>` basic component ([b83b594](https://github.com/ecomplus/cloud-commerce/commit/b83b594c133635413829bf4fca15b9177187cf3c))
* **storefront:** New `getShippingDeadline` and `getShippingPrice` methods on calculator composable ([4dc32e1](https://github.com/ecomplus/cloud-commerce/commit/4dc32e1c2a3d1b235c6d46f91602a263b393d432))


### Bug Fixes

* **storefront:** Bump Astro to latest v4.4.1 and VueUse v10.8 ([e01fb6d](https://github.com/ecomplus/cloud-commerce/commit/e01fb6d2d307c93fbdf34e413b4b7bad5f939a5c))
* **storefront:** Exporting `isFetching` state from shipping calculator composable ([9266d0c](https://github.com/ecomplus/cloud-commerce/commit/9266d0c8d4a5c7dd6ffa99b44170988891e7257a))
* **storefront:** Prevent "=undefined" params on modules (and other internals) fetch ([a4f594e](https://github.com/ecomplus/cloud-commerce/commit/a4f594ea40269c6ef8b22cb166c3298fa877023d))
* **storefront:** Receiving `zipCode` ref instead of input on shipping calculator composable ([813dcb1](https://github.com/ecomplus/cloud-commerce/commit/813dcb16943f922ac52995778c42840d96195d67))

### [2.5.1](https://github.com/ecomplus/cloud-commerce/compare/v2.5.0...v2.5.1) (2024-02-19)


### Bug Fixes

* **storefront:** Removing version debug at all ([2615483](https://github.com/ecomplus/cloud-commerce/commit/261548384b6914de432403c7711a8b325ee1999d))

## [2.5.0](https://github.com/ecomplus/cloud-commerce/compare/v2.4.3...v2.5.0) (2024-02-19)


### Features

* **storefront:** Handling SSR preview content on URL params and live preview with post messages ([a3978f5](https://github.com/ecomplus/cloud-commerce/commit/a3978f5df9c3804b429b165737902c36e6fa89d6)), closes [#320](https://github.com/ecomplus/cloud-commerce/issues/320)
* **storefront:** New `assets/decap-cms.css` optional customizations for Decap CMS [[#320](https://github.com/ecomplus/cloud-commerce/issues/320)] ([1f4e2c5](https://github.com/ecomplus/cloud-commerce/commit/1f4e2c597309fe176c807c0472141e507f1ec773))
* **storefront:** New `client:sf` Astro directive with lazy, load, eager, interaction strategies ([a12f985](https://github.com/ecomplus/cloud-commerce/commit/a12f985be796faf0cf7ce58c2a942582975ec900))
* **storefront:** New `useSectionPreview` to abstract live content on page sections ([e6ebb12](https://github.com/ecomplus/cloud-commerce/commit/e6ebb12301106c22781faedeedd1dc6508cbdafd))


### Bug Fixes

* **ssr:** Prevent error with undefined (unset) headers on custom `writeHead` middleware ([d3343fd](https://github.com/ecomplus/cloud-commerce/commit/d3343fd0828084fe3cfbefa83a0640e60a9235f0))
* **storefront:** Bump Astro to latest v4.3.7 and Vue v3.4.19 ([bb4b3b8](https://github.com/ecomplus/cloud-commerce/commit/bb4b3b81e7418963c6317ffe62d53a63ef836cc5))
* **storefront:** Bump Astro to latest v4.4.0 ([eae97f6](https://github.com/ecomplus/cloud-commerce/commit/eae97f67a36be4b18d158d168ca3af645cb90f53))
* **storefront:** Set `layout` content customizations inside `custom` prop for better type inference ([067e817](https://github.com/ecomplus/cloud-commerce/commit/067e8172739a36d82e48c12c2d246e881a74f874))
* **storefront:** Update experimental `useCmsPreview` with field, subfield declaration ([76a86ca](https://github.com/ecomplus/cloud-commerce/commit/76a86ca91339d52a8064e000638065d578d2b1d2))

### [2.4.3](https://github.com/ecomplus/cloud-commerce/compare/v2.4.2...v2.4.3) (2024-02-13)


### Bug Fixes

* **cli:** Add `*/admin/` pattern to "APIs" cache bypass on bunny.net edge rules ([bdbf89e](https://github.com/ecomplus/cloud-commerce/commit/bdbf89ec49f6f774f993980593fdba985428e591))
* **storefront:** Fixing route to GH installations for GH token ([4f127dd](https://github.com/ecomplus/cloud-commerce/commit/4f127dda01b635c79e0838b37c02e7c94a2eed05))
* **storefront:** Using frozen lock file for CMS preview on WebContainer [[#320](https://github.com/ecomplus/cloud-commerce/issues/320)] ([476d256](https://github.com/ecomplus/cloud-commerce/commit/476d2568ef49e3ef1f6ee85a68480b69581a49f6))

### [2.4.2](https://github.com/ecomplus/cloud-commerce/compare/v2.4.1...v2.4.2) (2024-02-12)


### Bug Fixes

* **deps:** Update non-major dependencies ([#325](https://github.com/ecomplus/cloud-commerce/issues/325)) ([9facbaf](https://github.com/ecomplus/cloud-commerce/commit/9facbafbd60eef8da9c4f033e1b2fb76567c07e5))
* **storefront:** Bump Vue to latest v3.4.18 ([ae61990](https://github.com/ecomplus/cloud-commerce/commit/ae619902e2fde3a3e5e5d7ab18e5198fcaf2f50e))
* **storefront:** Keep restarting CMS preview dev server on WebContainer [[#320](https://github.com/ecomplus/cloud-commerce/issues/320)] ([f463729](https://github.com/ecomplus/cloud-commerce/commit/f463729891819723f3cb769a0a406594450fce59))

### [2.4.1](https://github.com/ecomplus/cloud-commerce/compare/v2.4.0...v2.4.1) (2024-02-10)

## [2.4.0](https://github.com/ecomplus/cloud-commerce/compare/v2.3.4...v2.4.0) (2024-02-10)


### Features

* **storefront:** Getting startep with new `scripts/decap-cms` ([bac0d21](https://github.com/ecomplus/cloud-commerce/commit/bac0d21fd1bd03abe53b283bda92c1c36b08098f)), closes [#320](https://github.com/ecomplus/cloud-commerce/issues/320)

### [2.3.4](https://github.com/ecomplus/cloud-commerce/compare/v2.3.3...v2.3.4) (2024-02-09)

### [2.3.3](https://github.com/ecomplus/cloud-commerce/compare/v2.3.2...v2.3.3) (2024-02-09)


### Bug Fixes

* **api:** Removing missused `body_text` field on catalog resources types ([1faaed7](https://github.com/ecomplus/cloud-commerce/commit/1faaed743aca7005098f1b242dd61e5c204ed455))
* **storefront:** Also disabling view transitions on /admin/ (CMS) route ([486d356](https://github.com/ecomplus/cloud-commerce/commit/486d356e2c3a9ff21f9a1cae67682684fe6f1d9c))
* **storefront:** Bump Astro to latest v4.3.5 ([91cd2a5](https://github.com/ecomplus/cloud-commerce/commit/91cd2a535ea08191114ae18bde3fee36d6c96f20))
* **storefront:** Properly set global `$storefront.getSession` and `$storefront.url` client side ([37bf33c](https://github.com/ecomplus/cloud-commerce/commit/37bf33cbe9eaf53155160e3d7311c58bea8f18bc))

### [2.3.2](https://github.com/ecomplus/cloud-commerce/compare/v2.3.1...v2.3.2) (2024-02-06)


### Bug Fixes

* **deps:** Update non-major dependencies ([#322](https://github.com/ecomplus/cloud-commerce/issues/322)) ([293386e](https://github.com/ecomplus/cloud-commerce/commit/293386e2bff2e68b913ab184db99332b9d893b2c))
* **ssr:** Update GA4 server handler to send user agent as user property and support A/B experiment ([256b134](https://github.com/ecomplus/cloud-commerce/commit/256b134067fa577558414de8242ce75e7c99ef36))
* **storefront:** Sync browser storage states between tabs with `BroadcastChannel` ([77bffb9](https://github.com/ecomplus/cloud-commerce/commit/77bffb9cc1bb6430cb1b4d038546e5af67cc56eb))
* **storefront:** Update Astro to v4.3.2 ([#321](https://github.com/ecomplus/cloud-commerce/issues/321)) ([c21838c](https://github.com/ecomplus/cloud-commerce/commit/c21838c72037aa48aa5e038cf393e40b8251b300))
* **storefront:** Updating `useAnalytics` to return A/B testing `expVariantString` ([25a5e4b](https://github.com/ecomplus/cloud-commerce/commit/25a5e4b9fd5424bd6efba196f6c83d4763d4ae17))
* **storefront:** Using session IDs to prevent SSR context mismatch ([a34d66f](https://github.com/ecomplus/cloud-commerce/commit/a34d66f322d077345ec7c7cc133641a68409d084))

### [2.3.1](https://github.com/ecomplus/cloud-commerce/compare/v2.3.0...v2.3.1) (2024-02-02)


### Bug Fixes

* **cli:** Add `*/~*` pattern to "APIs" cache bypass on bunny.net edge rules ([2efa863](https://github.com/ecomplus/cloud-commerce/commit/2efa863447db76199b1e8435d7d95e468519f644))
* **cli:** Edit default `firestore.rules` with allwo read on `publicContent` collection ([a7e36c8](https://github.com/ecomplus/cloud-commerce/commit/a7e36c8750b3126e400ad06e43f568dde2fb501f))
* **ssr:** Sanitize URL without querystring to purge CDN cache ([4dc48b6](https://github.com/ecomplus/cloud-commerce/commit/4dc48b68280beb8da74395f0d61761958fdc8e29))
* **storefront:** Bump Astro to latest v4.3 ([faf58c7](https://github.com/ecomplus/cloud-commerce/commit/faf58c71cbab707474a140e64b618d06445ad425))
* **storefront:** Bump Astro to latest v4.3.1 ([734f8ef](https://github.com/ecomplus/cloud-commerce/commit/734f8efb9cd95e5603d4c28833fbee97e6dbaba9))
* **storefront:** Set Cache-Control `max-age=0` on CMS preview responses (_/~preview/**_) ([a0ace64](https://github.com/ecomplus/cloud-commerce/commit/a0ace643c5ab7b28bf810cc83c74008b1e552c19))

## [2.3.0](https://github.com/ecomplus/cloud-commerce/compare/v2.2.3...v2.3.0) (2024-02-01)


### Features

* **modules:** Supporting `?skip_ids` param on Modules API POST requests ([200e7da](https://github.com/ecomplus/cloud-commerce/commit/200e7da07744f3fc1f5990cb9ee71432f614f6be))
* **storefront:** New `useShippingCalculator` composable ([be8b43d](https://github.com/ecomplus/cloud-commerce/commit/be8b43d7ee50771070c6de835d7d034ed7556222))
* **storefront:** New typed `fetchModule` function exported on `@@sf/state/modules-info` ([e75e45d](https://github.com/ecomplus/cloud-commerce/commit/e75e45db571b94cfa0df3dfa5c9cece412717008))
* **types:** Add `ModuleApiEndpoint`, `ModuleApiParams` and `ModuleApiResult` to exported types ([104be19](https://github.com/ecomplus/cloud-commerce/commit/104be19e41ec4efb2d2bccf6922be7c86c29c697))


### Bug Fixes

* **storefront:** Bump Astro to latest v4.2.8 ([ca93a6d](https://github.com/ecomplus/cloud-commerce/commit/ca93a6d63098c4903ead042f5ca0bc0700f8e7c0))
* **storefront:** Fix watching `isUrlPath` optional prop value change ([1aca5f4](https://github.com/ecomplus/cloud-commerce/commit/1aca5f42963c600873b434d787f86ae269eedec1))
* **storefront:** Properly handle params to URL query on `afetch` wrapper ([733f608](https://github.com/ecomplus/cloud-commerce/commit/733f6088128f14c51d18d6344f7c5ce2d7e714d3))

### [2.2.3](https://github.com/ecomplus/cloud-commerce/compare/v2.2.2...v2.2.3) (2024-01-31)


### Bug Fixes

* **ssr:** Fixing Firestore query on `ssrPageViews` to purge CDN cache ([9d4f208](https://github.com/ecomplus/cloud-commerce/commit/9d4f208b38ac79ce2fbc2a35e3b8e9162d03d573))

### [2.2.2](https://github.com/ecomplus/cloud-commerce/compare/v2.2.1...v2.2.2) (2024-01-31)


### Bug Fixes

* **cli:** Call `ci/bunny-config-base.sh` with correct args on setup ([4e816c1](https://github.com/ecomplus/cloud-commerce/commit/4e816c174a5b02fbb660adda297717cf30c36692))
* **ssr:** Purge bunny.net cache only for page views older than 3min ([391ed21](https://github.com/ecomplus/cloud-commerce/commit/391ed21011fa28b342ed95b1e3cb99a7157374a9))
* **storefront:** Bump Astro to latest v4.2.7 ([a32bf15](https://github.com/ecomplus/cloud-commerce/commit/a32bf15037131af22dbfa2ae7bc7f27ac5318eb1))
* **storefront:** Preventing hydration mismatch with random `useId`s ([481518a](https://github.com/ecomplus/cloud-commerce/commit/481518a1f5375871f01b882dd8714731fbb41808))
* **storefront:** Preventing hydration mismatch with random `useId`s ([bfc4f8c](https://github.com/ecomplus/cloud-commerce/commit/bfc4f8c5e363d28dc30f085eab97e6e2fc88530b))
* **storefront:** Reducing sticky header scroll watcher debounce to 20ms ([aff44e5](https://github.com/ecomplus/cloud-commerce/commit/aff44e5e5f8185472a848b83b42bdc82f374ed12))

### [2.2.1](https://github.com/ecomplus/cloud-commerce/compare/v2.2.0...v2.2.1) (2024-01-30)


### Bug Fixes

* **storefront:** Fix `useSearchShowcase` to ensure URL params respected on initial (maybe) fetch ([1ecc3df](https://github.com/ecomplus/cloud-commerce/commit/1ecc3dfd2973c22e4186d37ee05cc266f5a56e31))
* **storefront:** New optional `pageSize` prop to search showcase compsable ([5b3fa04](https://github.com/ecomplus/cloud-commerce/commit/5b3fa04d837a4d54488ca7cc4e3b78131c0589b3))
* **storefront:** Update Astro to latest v4.2.6 ([#312](https://github.com/ecomplus/cloud-commerce/issues/312)) ([76ddf9a](https://github.com/ecomplus/cloud-commerce/commit/76ddf9ab17fc6bd31c674b580c185747260fc17f))

## [2.2.0](https://github.com/ecomplus/cloud-commerce/compare/v2.1.0...v2.2.0) (2024-01-28)


### Features

* **cli:** New `ci/bunny-remove-ab.sh` script to clear A/B edge rules on experiment end ([d5c7fc9](https://github.com/ecomplus/cloud-commerce/commit/d5c7fc9d9b34a7e1dc4231c4eeb7b4d5e8adcb37))
* **cli:** New `ci/bunny-setup.sh` script to setup bunny.net CDN for ISR with perma-cache ([c4bfc14](https://github.com/ecomplus/cloud-commerce/commit/c4bfc14ba9af404bb66e39e585426ea1c1b2542f))
* **ssr:** Supporting ISR with bunny.net perma-cache ([0bfbf45](https://github.com/ecomplus/cloud-commerce/commit/0bfbf45e4f84ce23920910de02f99f22ce244cd1))
* **storefront:** Integrating branch based A/B tests with GA4 ([69def97](https://github.com/ecomplus/cloud-commerce/commit/69def9782516afbe77d42131a3def54c6a875031))


### Bug Fixes

* **cli:** Normalizing ci scripts with first arg project ID and second domain ([3c65466](https://github.com/ecomplus/cloud-commerce/commit/3c6546633edfcaedb415dee8acd1cbc5decd603f))

## [2.1.0](https://github.com/ecomplus/cloud-commerce/compare/v2.0.9...v2.1.0) (2024-01-26)


### Features

* **cli:** New `ci/bunny-config-base.sh` script to fix bunny.net CDN pull zone basic configs ([5e525ec](https://github.com/ecomplus/cloud-commerce/commit/5e525ecd94589221886421bede6ab8901ad3c46f))
* **cli:** New `ci/bunny-prepare-ab.sh` script to purge cache and setup edge rules for A/B testing ([61ad030](https://github.com/ecomplus/cloud-commerce/commit/61ad030dd9285bd45a2f70e6d65b82576394e588))


### Bug Fixes

* **api:** Reduce default `cacheMaxAge` to 2min ([6353d6a](https://github.com/ecomplus/cloud-commerce/commit/6353d6a9a830437a4fbf49bf161ef67c0760c762))
* **cli:** Ensure env vars with dotenv, set per-deploy cookies on Hosting response ([b9bc5e0](https://github.com/ecomplus/cloud-commerce/commit/b9bc5e0bf2a7b013854ef443e47cc955db7509dd))

### [2.0.9](https://github.com/ecomplus/cloud-commerce/compare/v2.0.8...v2.0.9) (2024-01-20)


### Bug Fixes

* **storefront:** Bump Astro to latest v4.2.1 ([dd6b65a](https://github.com/ecomplus/cloud-commerce/commit/dd6b65a62ae585870f4cdf00496df2f2392cf96a))
* **storefront:** Bump Vue to latest v3.4.15 ([46fd6f5](https://github.com/ecomplus/cloud-commerce/commit/46fd6f59beb95e85ef2ed4b0479f912cf8eb4fd8))
* **storefront:** Stop `click` event propagation and prevent default (a) on `<CarouselControl>` ([94defd8](https://github.com/ecomplus/cloud-commerce/commit/94defd8b6e03d1821f605325c23d9c9f42cd9881))
* **storefront:** Stop `click` event propagation on `<CarouselControl>` by default ([b44ff85](https://github.com/ecomplus/cloud-commerce/commit/b44ff85c4382ef912c434bf1f251134697156098))

### [2.0.8](https://github.com/ecomplus/cloud-commerce/compare/v2.0.7...v2.0.8) (2024-01-17)


### Bug Fixes

* **deps:** Update non-major dependencies ([#307](https://github.com/ecomplus/cloud-commerce/issues/307)) ([73ef543](https://github.com/ecomplus/cloud-commerce/commit/73ef5432d509985195dc5217d3ab754661217dfd))
* **storefront:** Also prevent error on default Vue global instance setup without `$storefront` set ([9b25f5f](https://github.com/ecomplus/cloud-commerce/commit/9b25f5fc74a78a63bbcbb4f446bda09e5f339b9d))
* **storefront:** Bump Vue to latest v3.4.14 ([6b1a251](https://github.com/ecomplus/cloud-commerce/commit/6b1a25157eab3cf7bd207a10040e00a2b9ecc3e4))
* **storefront:** Prevent fatal error on `@@sf/sf-lib` import without global `$storefront` ([ca05109](https://github.com/ecomplus/cloud-commerce/commit/ca051098f63373ec23b7b898a06156abec28053c))

### [2.0.7](https://github.com/ecomplus/cloud-commerce/compare/v2.0.6...v2.0.7) (2024-01-12)


### Bug Fixes

* **firebase:** Use `dotenv` on `firebase/lib/config` to ensure vars on deployment ([9e7b8d4](https://github.com/ecomplus/cloud-commerce/commit/9e7b8d404690f8148349c07c4679ba8265786ed1))
* **storefront:** Bump Vie to latest v.3.4.11 ([f9ad320](https://github.com/ecomplus/cloud-commerce/commit/f9ad320f50d05b5f360d539511560d740c0014c2))

### [2.0.6](https://github.com/ecomplus/cloud-commerce/compare/v2.0.5...v2.0.6) (2024-01-11)


### Bug Fixes

* **storefront:** Bump Astro to v4.1.12 ([d6eb8bc](https://github.com/ecomplus/cloud-commerce/commit/d6eb8bc8ff986878ecdfca537bc4053da52829f6))
* **storefront:** Edit global `<ALink>` to properly set target blank for external links ([f1cde20](https://github.com/ecomplus/cloud-commerce/commit/f1cde2019eb047dbbce6e0685de9d4d007bd2b7c))
* **storefront:** Properly add all available `.i-<iconset>-<icon>` to Tailwind config ([3907943](https://github.com/ecomplus/cloud-commerce/commit/3907943b3d2e841b78b0d37ba100a189333a4db1))

### [2.0.5](https://github.com/ecomplus/cloud-commerce/compare/v2.0.4...v2.0.5) (2024-01-10)


### Bug Fixes

* **api:** Fixing types for PATCH request body (partial resource doc set) ([5fb5088](https://github.com/ecomplus/cloud-commerce/commit/5fb508860d3cd8c078e6ea5eb647412f6fccadb2))
* **api:** Returning proper resource interface on doc find by field (e.g `products/sku:123`) ([f94021b](https://github.com/ecomplus/cloud-commerce/commit/f94021b0179b94b41a905cfa207762c4fc999276))
* **ssr:** Purge bunny.net cache only for page view URLs of current store domain (from settings) ([6e7dd91](https://github.com/ecomplus/cloud-commerce/commit/6e7dd91a4864f60c9eb4446f2684387f2bf486fe))

### [2.0.4](https://github.com/ecomplus/cloud-commerce/compare/v2.0.3...v2.0.4) (2024-01-09)


### Bug Fixes

* **api:** Do not get fetch response `.json()` on status 204 (No Content) ([6d9034f](https://github.com/ecomplus/cloud-commerce/commit/6d9034f03b07cabb9fd0c5ad122597e1f0c44c29))
* **api:** Properly returning Response instance with additional `data` and `config` ([7a1f1b2](https://github.com/ecomplus/cloud-commerce/commit/7a1f1b2ced36acb3f3a351d9684f74c657dab17a))
* **api:** Properly set HTTP verbs uppercased on fetch config ([4c49fa1](https://github.com/ecomplus/cloud-commerce/commit/4c49fa1d45c629c99a280f1c3fddaa38a515c634))

### [2.0.3](https://github.com/ecomplus/cloud-commerce/compare/v2.0.2...v2.0.3) (2024-01-09)


### Bug Fixes

* **emails:** Using contact email from settings as default sender if `MAIL_SENDER` env not set ([b843a35](https://github.com/ecomplus/cloud-commerce/commit/b843a3550a3d4cf3f4c3daaae83e397b975639f2))
* **ssr:** Prevent rejection and proper debug API errors on cron save views ([f8f9bdd](https://github.com/ecomplus/cloud-commerce/commit/f8f9bddd0f166f9a2bf6657d1a51210d6ce44296))

### [2.0.2](https://github.com/ecomplus/cloud-commerce/compare/v2.0.1...v2.0.2) (2024-01-08)


### Bug Fixes

* **deps:** Update non-major dependencies ([#304](https://github.com/ecomplus/cloud-commerce/issues/304)) ([63b63f4](https://github.com/ecomplus/cloud-commerce/commit/63b63f4021dd26c230f3caba6ec6d1b5b43d9fed))
* **storefront:** Update Astro to v4.1.1 ([#305](https://github.com/ecomplus/cloud-commerce/issues/305)) ([f03756f](https://github.com/ecomplus/cloud-commerce/commit/f03756ff9b731429a45f53c089cb590a01c1302c))
* **storefront:** Watching shared `data:grids` event on SKU selector composable ([3f9a0c3](https://github.com/ecomplus/cloud-commerce/commit/3f9a0c3a834186558814301ab9d73f32b1036459))

### [2.0.1](https://github.com/ecomplus/cloud-commerce/compare/v2.0.0...v2.0.1) (2024-01-08)


### Bug Fixes

* **storefront:** Shared data scripts should be async to perform well (reduced TBT) ([ce8ce82](https://github.com/ecomplus/cloud-commerce/commit/ce8ce820f624f489388628c816c16c9ca617fbdf))
* **storefront:** Updating custom `client-context=` Astro directive to support awaiting shared data ([cf16fa6](https://github.com/ecomplus/cloud-commerce/commit/cf16fa6a74ef6bb87fd5f06485f0bea7640adc5f))

## [2.0.0](https://github.com/ecomplus/cloud-commerce/compare/v0.41.6...v2.0.0) (2024-01-05)


### Bug Fixes

* **affiliate-program:** Typo fix everywere from "affilate" to "affiliate" ([8dbbffd](https://github.com/ecomplus/cloud-commerce/commit/8dbbffd751814b54c92f26a1ec4f72e373de7538))
* **deps:** Start bumping firebase-admin to v12 ([58bd5ab](https://github.com/ecomplus/cloud-commerce/commit/58bd5abb400e89aaaac55e7647474e77ab1353d9))
* **deps:** Updating firebase-admin to v12 on all packages ([4d4400d](https://github.com/ecomplus/cloud-commerce/commit/4d4400d830df9b71581ae141e555a5e368d27e66))

### [0.41.6](https://github.com/ecomplus/cloud-commerce/compare/v0.41.5...v0.41.6) (2024-01-05)


### Bug Fixes

* **storefront:** Set page links without hostname (may be proxied) on pagination composable ([6baf13c](https://github.com/ecomplus/cloud-commerce/commit/6baf13cb50b1fa6e8b4c313be5e4cff88069c72a))

### [0.41.5](https://github.com/ecomplus/cloud-commerce/compare/v0.41.4...v0.41.5) (2024-01-05)


### Features

* **storefront:** Set `globa.astroUrl` on SSR ([b4dccad](https://github.com/ecomplus/cloud-commerce/commit/b4dccadee699ae29949880a1113e3a7d918c9fc9))
* **storefront:** Start returning `pageLinks` from `usePgination` ([d45becf](https://github.com/ecomplus/cloud-commerce/commit/d45becf93621a8c4fba4fba6fa494830f7111f17))

### [0.41.4](https://github.com/ecomplus/cloud-commerce/compare/v0.41.3...v0.41.4) (2024-01-04)


### Bug Fixes

* **ssr:** Must add `yaml` to SSR package deps ([041158a](https://github.com/ecomplus/cloud-commerce/commit/041158abdfa1af508b951a457988ae6393e7ef6e))

### [0.41.3](https://github.com/ecomplus/cloud-commerce/compare/v0.41.2...v0.41.3) (2024-01-04)


### Bug Fixes

* **deps:** Fix Vue semver to (latest) ^3.4.5, bump Astro to v4.1.0 (feat) ([1249e6b](https://github.com/ecomplus/cloud-commerce/commit/1249e6ba79afbc55bb6da686cbebd63ab4c9e148))
* **storefront:** Fix base `<head>` Astro partial to not set meta title and description to all pages ([83213b3](https://github.com/ecomplus/cloud-commerce/commit/83213b3c2c2645cd6b4cf4c472b5dee4a86da37e))

### [0.41.2](https://github.com/ecomplus/cloud-commerce/compare/v0.41.1...v0.41.2) (2024-01-04)


### Bug Fixes

* **deps:** Bump Vue to exact 3.4.4, update Astro to 4.0.9 ([ce11a81](https://github.com/ecomplus/cloud-commerce/commit/ce11a81409cd7f054e5cfeeeb10e0de99c9d489d))

### [0.41.1](https://github.com/ecomplus/cloud-commerce/compare/v0.41.0...v0.41.1) (2024-01-04)


### Bug Fixes

* **deps:** Revert Vue to exaect 3.4.0 ([576756e](https://github.com/ecomplus/cloud-commerce/commit/576756efe9e4e662778ceea9d7987acf0333c2c6))

## [0.41.0](https://github.com/ecomplus/cloud-commerce/compare/v0.40.5...v0.41.0) (2024-01-04)


### ⚠ BREAKING CHANGES

* **storefront:** Changed expected page content schema for content entry (with markdown)

### Features

* **storefront:** Adding support to .md files with frontmatter on (CMS) content ([1681506](https://github.com/ecomplus/cloud-commerce/commit/1681506c695c011956d209a11d982551ae42a7e1))
* **storefront:** New section `content-entry` on page main composable ([5469278](https://github.com/ecomplus/cloud-commerce/commit/54692789aaa1f5c84a6648ee98585d6dd5911360))
* **storefront:** Set `BUILD_MINIMAL` env on first build sted ([f5c464f](https://github.com/ecomplus/cloud-commerce/commit/f5c464f9bddb66dbd464be5c810bf17ba86d62ee))


### Bug Fixes

* **deps:** Revert Vue semver to ^3.4.0 ([4b06a30](https://github.com/ecomplus/cloud-commerce/commit/4b06a30de5891b6124ea6d1f3a75989be811da45))
* **storefront:** Fixiing `ContentData` (may be null) and `PageContent` typedefs ([44ab06c](https://github.com/ecomplus/cloud-commerce/commit/44ab06c92e016f9c477f2dda83b7faf158aec1d2))
* **storefront:** Prevent hydration mismatch with `<AccountLink>` and (client-only) location ([eb57285](https://github.com/ecomplus/cloud-commerce/commit/eb57285f84f84cac59bb9417a8db1c7be6ca503d))

### [0.40.5](https://github.com/ecomplus/cloud-commerce/compare/v0.40.4...v0.40.5) (2024-01-01)


### Features

* **firebase:** New pkg export "lib/helpers/firestore" with `deleteQueryBatch` method ([6ae31ba](https://github.com/ecomplus/cloud-commerce/commit/6ae31ba2b3f477db9fc94bb92cfa30890520f860))
* **ssr:** Counting search term views on Firestore ([f5b9f86](https://github.com/ecomplus/cloud-commerce/commit/f5b9f8607bf42d188881e3f9e425750391c4f671))
* **ssr:** Setup scheduled function to save product views and delete old (90d) page views ([02f352f](https://github.com/ecomplus/cloud-commerce/commit/02f352f39e2d4c67ec35826d1f20a14a74ad8a0c))
* **ssr:** Supporting bunny.net with Perma-Cache with on-demand purge ([b232642](https://github.com/ecomplus/cloud-commerce/commit/b2326424ea6ec077a4910f3f4b022e9ce946e898))


### Bug Fixes

* **apps:** Syntax fix for many apps cron setup ([d5fd1a3](https://github.com/ecomplus/cloud-commerce/commit/d5fd1a32f392df7e09920e2dc1590557552f0576))
* **deps:** Update non-major dependencies ([#297](https://github.com/ecomplus/cloud-commerce/issues/297)) ([282d078](https://github.com/ecomplus/cloud-commerce/commit/282d078e19a1e4266531f77e0bcd7525cb81b913))
* **ssr:** Properly storing product views from analytcis (gtag) events ([cb84f5b](https://github.com/ecomplus/cloud-commerce/commit/cb84f5bc5cf06b5f0fd109e372c505028b0c6ca5))
* **storefront:** Bump Vue to v3.4.3 ([c4e806d](https://github.com/ecomplus/cloud-commerce/commit/c4e806ddea9764536fec0ee88c91fd1ae6369014))
* **storefront:** Ensure related products fetch on SSR only ([75e8090](https://github.com/ecomplus/cloud-commerce/commit/75e80900ae7015562ba2d4803dd093642d17fbcf))
* **storefront:** Properly send analytics `view_search_results` on SSRed search page ([a276136](https://github.com/ecomplus/cloud-commerce/commit/a2761361de6596cb3df3cef1ef33685e951ffd6d))

### [0.40.4](https://github.com/ecomplus/cloud-commerce/compare/v0.40.3...v0.40.4) (2023-12-29)


### Bug Fixes

* **storefront:** Bump Vue to v3.4.0 and fix Vue/Vite semver to prevent mismtach with Astro ([0b640cb](https://github.com/ecomplus/cloud-commerce/commit/0b640cb5f3432b1a6d60130bd2f019c465b0e21f))

### [0.40.3](https://github.com/ecomplus/cloud-commerce/compare/v0.40.2...v0.40.3) (2023-12-29)


### Bug Fixes

* **storefront:** Reverting Vue to 3.3.11 ([07bae3b](https://github.com/ecomplus/cloud-commerce/commit/07bae3b33394f352eb990589f639f6551c2c7f00))

### [0.40.2](https://github.com/ecomplus/cloud-commerce/compare/v0.40.1...v0.40.2) (2023-12-29)


### Bug Fixes

* **storefront:** Reverting Vite to v5.0.8 and Astro to v4.0.6 ([d4ab5a5](https://github.com/ecomplus/cloud-commerce/commit/d4ab5a59484ab0025a60c372572f9208576d78e9))

### [0.40.1](https://github.com/ecomplus/cloud-commerce/compare/v0.40.0...v0.40.1) (2023-12-29)


### Features

* **storefront:** Bump Vue to v3.4.0 ([7bdd9f6](https://github.com/ecomplus/cloud-commerce/commit/7bdd9f6e885f090e20fc91b168e74ca83b486701))


### Bug Fixes

* **storefront:** Bump Astro to v4.0.8 ([1f57f39](https://github.com/ecomplus/cloud-commerce/commit/1f57f39006305966a72f93aab1f00031757045cd))

## [0.40.0](https://github.com/ecomplus/cloud-commerce/compare/v0.39.0...v0.40.0) (2023-12-29)


### ⚠ BREAKING CHANGES

* **i18n:** `i19relatedProduct` properly renamed to `i19relatedProducts`
* **storefront:** `useSearchShowcase` prop changed from `params` to `fixedParams`
* **storefront:** Renaming `searchMeta` prop&return to `resultMeta`
* **storefront:** `useSearchEngine` API changed removing `sort` prop

### Features

* **api:** New interface and type updates adding `searches` resource ([e165a13](https://github.com/ecomplus/cloud-commerce/commit/e165a136f207404cca63400f0bdc8d53811f7692))
* **i18n:** Add `i19anyPrice` ([4308611](https://github.com/ecomplus/cloud-commerce/commit/43086119874d86ccd4bfa95312377de8e02eaea3))
* **i18n:** Add `i19filterOut` ([f4b31ee](https://github.com/ecomplus/cloud-commerce/commit/f4b31eecbd9874ebb872f9a52c7ce570ba549603))
* **i18n:** Add `i19loadMoreProducts` ([40016e3](https://github.com/ecomplus/cloud-commerce/commit/40016e30a37ec86757a981c59b09ac3d2a5efcd5))
* **storefront:** Abstract handling `sortOption` (optionally) on search showcase composable ([9e170e8](https://github.com/ecomplus/cloud-commerce/commit/9e170e88afaff6a38cb6e68cef33946b91db5f63))
* **storefront:** Add `canLockScroll` prop to `Drawer` ([87b9b7e](https://github.com/ecomplus/cloud-commerce/commit/87b9b7e21edf4b3544c26d844eb0416830d070da))
* **storefront:** Add `isRelatedProducts` optional prop to products shelf composable ([09c4f7a](https://github.com/ecomplus/cloud-commerce/commit/09c4f7adaf73b55f03ff453ce2d982b7bd045afb))
* **storefront:** Add `sortOptions` to search showcase composable return ([fe41f0f](https://github.com/ecomplus/cloud-commerce/commit/fe41f0fad39f6d24e5d1e70a5dee937bd86c7460))
* **storefront:** Adding `searchMeta` to search showcase composable ([3525402](https://github.com/ecomplus/cloud-commerce/commit/3525402ec18529cdf631da703042f0d96dc2645d))
* **storefront:** Better defining some global `$storefront.data` types with partial resources lists ([a6f938a](https://github.com/ecomplus/cloud-commerce/commit/a6f938ab66a30efac18a55e0ead9364bb2885d93))
* **storefront:** Bypassing sections `doc-banner` and `page-title` on `usePageSections` ([cbd7297](https://github.com/ecomplus/cloud-commerce/commit/cbd729797137ab113b4a0724af940709ce0ead42))
* **storefront:** Completing `useSearchFilters` composable with filter options handlers ([5cdf744](https://github.com/ecomplus/cloud-commerce/commit/5cdf744a3bb1204a7926029a1cef6f11e3c4bf6d))
* **storefront:** Completing `useSearchFilters` composable with specs filters ([92c549e](https://github.com/ecomplus/cloud-commerce/commit/92c549e87fd38a37655804098e62eb4ced75dc62))
* **storefront:** Export new utility method `scrollToEl` ([7c5b5eb](https://github.com/ecomplus/cloud-commerce/commit/7c5b5eb73d79e36e52c8a2d416086121fca3ee2f))
* **storefront:** New `activeFilters` and `filtersCount` also returned from search showcase ([8474db3](https://github.com/ecomplus/cloud-commerce/commit/8474db3f45a7ec84f09b5567425d9ac46a3cf93e))
* **storefront:** New `usePagination` composable ([32877aa](https://github.com/ecomplus/cloud-commerce/commit/32877aaad4f4326c62e35031ab5f42f827e7bc1b))
* **storefront:** New `useSearchFilters` composable ([0bc450d](https://github.com/ecomplus/cloud-commerce/commit/0bc450dd7f042104ae6dfa0597361fd2e40d02c2))
* **storefront:** New method `setResult` to search engine class ([1c756d8](https://github.com/ecomplus/cloud-commerce/commit/1c756d89ebd8a62c4ade5fc3c178360ab13a3e53))
* **storefront:** Properly sync filters and pagination with URL on search showcase ([8152ed1](https://github.com/ecomplus/cloud-commerce/commit/8152ed1ebfcb63298aa9fc9ca8f210abaa33ccf6))
* **storefront:** Renaming section `doc-banners` and adding `custom-html` on `usePageSections` ([174db80](https://github.com/ecomplus/cloud-commerce/commit/174db80e6c6b32c41883e42592fe97cdb2c8e8d6))
* **storefront:** Update search showcase composable with pagination abstractions ([5752e39](https://github.com/ecomplus/cloud-commerce/commit/5752e395aca219a799141b4136acbbd702f757a0))


### Bug Fixes

* **api:** Fixing returned result typedef for search requests with query string ([4fbfa88](https://github.com/ecomplus/cloud-commerce/commit/4fbfa8850a11a323d0934039a39c7932d1001cc0))
* **api:** Proper typedef for stores/me and authentications/me responses ([#292](https://github.com/ecomplus/cloud-commerce/issues/292)) ([07598a7](https://github.com/ecomplus/cloud-commerce/commit/07598a775490a77acf30d6a109bf5e0b86810a27))
* **api:** Updating config params typedef to accept undefined properties ([37175e1](https://github.com/ecomplus/cloud-commerce/commit/37175e1340b434c477648bf65a14196f597c176c))
* **api:** Updating typdefs for search v2 response buckets ([757a485](https://github.com/ecomplus/cloud-commerce/commit/757a48592fb38b2a1aa16f8b89938802acbaec8c))
* **deps:** Update Astro to v4.0.6 ([#288](https://github.com/ecomplus/cloud-commerce/issues/288)) ([d57416b](https://github.com/ecomplus/cloud-commerce/commit/d57416b460c77cb521b991e7a2f317a5989879b8))
* **deps:** Update non-major dependencies ([#295](https://github.com/ecomplus/cloud-commerce/issues/295)) ([5ec12dd](https://github.com/ecomplus/cloud-commerce/commit/5ec12dd2730c11247cf0e096ac5680ab6b3dd506))
* **deps:** Update Vue to v3.3.12 ([#289](https://github.com/ecomplus/cloud-commerce/issues/289)) ([c440202](https://github.com/ecomplus/cloud-commerce/commit/c44020239f3720c61ee0a2844a212b831ee26a55))
* **i18n:** Fix `i19noItemSelected`, `i19noProductsFound`, `i19noProductsFoundFor$1` ([fef8b35](https://github.com/ecomplus/cloud-commerce/commit/fef8b3522e92e6fe426ae7e5176eb824c9f7d0ea))
* **i18n:** Fix `i19reltedProducts` ([d49c2fd](https://github.com/ecomplus/cloud-commerce/commit/d49c2fd0d1d078f1d80713c8de21462b14841e7a))
* **storefront:** Fix `SearchEngine` params reusing API client config typedef ([4313b70](https://github.com/ecomplus/cloud-commerce/commit/4313b70774c3771eb5c1d582ce10258fe7798607))
* **storefront:** Fix `SearchEngine` params types removing null(s) following API params typedef ([0fd9c6b](https://github.com/ecomplus/cloud-commerce/commit/0fd9c6b8fe5e61765ce731ac180eda2f483195f8))
* **storefront:** Update Astro to v4.0.6 ([#293](https://github.com/ecomplus/cloud-commerce/issues/293)) ([50adca0](https://github.com/ecomplus/cloud-commerce/commit/50adca094c169171ddbb011f27d6b4ebfc19a17f))
* **storefront:** Update Vue to v3.3.13 ([#294](https://github.com/ecomplus/cloud-commerce/issues/294)) ([7c88a09](https://github.com/ecomplus/cloud-commerce/commit/7c88a09deccaec88dad33582f7aa3ee084480be5))


* **storefront:** Remove `sort` prop from search showcase composable ([9dff758](https://github.com/ecomplus/cloud-commerce/commit/9dff758b988ecdf2dbd78ca7d3e898135d46d023))
* **storefront:** Renaming prop `fixedParams` on search showcase composable ([e1404ba](https://github.com/ecomplus/cloud-commerce/commit/e1404baafbb37bc7ea45e060f87d75df08758b77))

## [0.39.0](https://github.com/ecomplus/cloud-commerce/compare/v0.38.0...v0.39.0) (2023-12-15)


### ⚠ BREAKING CHANGES

* **storefront:** Section "search-container" no more working, renamed to "search-showcase", composable renamed to `useSearchShowcase`
* **storefront:** Updaing `usePageHeader` props removing `categories` to enforce usage from `useSharedData` instead
* **storefront:** Editing `useSharedData` return, replacing `inlineClientJs` with `getInlineClientJs` function for just-in-case execution

Minor fixing prop value and return value typedef

### Features

* **storefront:** Better types (generic) for `useSharedData` with categories/brands ([035c518](https://github.com/ecomplus/cloud-commerce/commit/035c5182e8ff8ad116823fbc18d696a062685db0))
* **storefront:** Setting up new section type `context-showcase` also with search container ([3dde5d6](https://github.com/ecomplus/cloud-commerce/commit/3dde5d6747d71bd6f3dbebebefe4825eacf5e673))
* **storefront:** Updating `useSearchContainer` with new optional props `params` ([f407f30](https://github.com/ecomplus/cloud-commerce/commit/f407f3006542a46ce52e028fcd36547194a553be))


### Bug Fixes

* **storefront:** Preset `SearchEngine` term as null ([a2eb4ee](https://github.com/ecomplus/cloud-commerce/commit/a2eb4eead313a97ada8d4331510e7149aeb2a2c3))
* **storefront:** Set `SearchEngine.params` as reactive (not shallow) ([6d0c19f](https://github.com/ecomplus/cloud-commerce/commit/6d0c19f3bfa16a7b7f0011747388e4f2dea449e7))


* **storefront:** Ensure early set _categories_ shared data from on page header layout composable ([7ce5838](https://github.com/ecomplus/cloud-commerce/commit/7ce58381dd7ffaed3bc6162bb2adb37fdce2db50))
* **storefront:** Renaming `useSearchContainer` to `useSearchShowcase` ([f915c05](https://github.com/ecomplus/cloud-commerce/commit/f915c05bf7c9a7833a1fe1304a6badecdaf67e61))
* **storefront:** Update `useSharedData` preventing unecessary stringify ([b0cffcd](https://github.com/ecomplus/cloud-commerce/commit/b0cffcd93a4b4722f3a4c15dddf195d315738fb6))

## [0.38.0](https://github.com/ecomplus/cloud-commerce/compare/v0.37.1...v0.38.0) (2023-12-13)


### ⚠ BREAKING CHANGES

* **deps:** Astro major version update
* **storefront:** Return of `useSearchModal` composable refactored

### Features

* **cli:** Keep user Firebase config files from `/conf` path if any ([4c96a25](https://github.com/ecomplus/cloud-commerce/commit/4c96a25f253e52bce6eacb216bdb78f59f2f77be))
* **cli:** Update default Firestore rules to allow creation on forms colelction ([54d1ff6](https://github.com/ecomplus/cloud-commerce/commit/54d1ff6dd0885c39c420c57418313bace7cb30f3))
* **deps:** Bump Vite to v5 and Astro to v4 ([f7dab35](https://github.com/ecomplus/cloud-commerce/commit/f7dab3546f331915e840e7af578284e32a1957cd))
* **storefront:** Accepting `term = null` on search method for no term filter search ([06f66a8](https://github.com/ecomplus/cloud-commerce/commit/06f66a8036dc637fa9bcaccfc50c0db7361c7a95))
* **storefront:** Adding search term to page title on SSR ([950a100](https://github.com/ecomplus/cloud-commerce/commit/950a100a0bb7c05f03ac7280e08eb79a045f7be3))
* **storefront:** New `scripts/firestore` with abstractions for forms docs and app check support ([4b39c0d](https://github.com/ecomplus/cloud-commerce/commit/4b39c0d89541dc01ce9d03d6f0f13116d0a5be19))
* **storefront:** New properties on `SearchEngine` to control fetching state and promises ([7c45cc7](https://github.com/ecomplus/cloud-commerce/commit/7c45cc731b241438b1a6367ac2af62117f906323))
* **storefront:** New SSR route context properties `isSearchPage` and `searchPageTerm` ([53e1dcb](https://github.com/ecomplus/cloud-commerce/commit/53e1dcb99babea36136168b2842f6c3b85418330))
* **storefront:** New Tailwind/UnoCSS variant `sticky-header:` ([de941a6](https://github.com/ecomplus/cloud-commerce/commit/de941a68f0b4cec95053ca7dc77b9638f5ad49f7))
* **storefront:** New utils: `toLowerCaseAccents`, `termify` and `getSearchUrl` ([e75fb37](https://github.com/ecomplus/cloud-commerce/commit/e75fb3712530c3f015c0f0b510162e04cb5acf09))
* **storefront:** Setting up `useSearchContainer` composable and and `search-container` section ([6ffb202](https://github.com/ecomplus/cloud-commerce/commit/6ffb20252e1279a00cc585a028857bca363d3c91))
* **storefront:** Update `useStickyHeader` composable to toggle body class ".StickyHeader" ([afc0e0f](https://github.com/ecomplus/cloud-commerce/commit/afc0e0f09b1d3f74f062fe0e38990df3abd97d23))


### Bug Fixes

* **api:** Updating `ResourceAndFind` typedef adding stores/me and authentications/me endpoints ([0c514e9](https://github.com/ecomplus/cloud-commerce/commit/0c514e91d6a7b98f78e51e9bd21dacfff208e9f0))
* **cli:** Fix default Firestore rules to enable creation on _forms_ subcolls ([21c40c5](https://github.com/ecomplus/cloud-commerce/commit/21c40c57d8f32412d242d303b5c1e57b3377f26b))
* **deps:** Update non-major dependencies ([#286](https://github.com/ecomplus/cloud-commerce/issues/286)) ([d35aaa9](https://github.com/ecomplus/cloud-commerce/commit/d35aaa9b4014f7dd3e835cf61b37fd1eae7a0663))
* **storefront:** Better generating brand colors pallete on Tailwind/UnoCSS config ([b85f9df](https://github.com/ecomplus/cloud-commerce/commit/b85f9df973c6221d2dd20783e89cc934e26ca60f))
* **storefront:** Update shop header to search submit redirecting to /s/term indexable URL ([c57a2a3](https://github.com/ecomplus/cloud-commerce/commit/c57a2a3573a4c07904be941a1577454f9dd3ecde))
* **storefront:** Update Vue to v3.3.11 ([#287](https://github.com/ecomplus/cloud-commerce/issues/287)) ([d514012](https://github.com/ecomplus/cloud-commerce/commit/d514012ca73337bdda341108a0f1fe3ea6ac183f))


* **storefront:** Renaming `useSearchModal` returned `products` ([cd44b51](https://github.com/ecomplus/cloud-commerce/commit/cd44b513bcec27aea0c9301d99aa5cbf7c9b1ae5))

### [0.37.1](https://github.com/ecomplus/cloud-commerce/compare/v0.37.0...v0.37.1) (2023-12-07)


### Features

* **storefront:** Edit `useShopHeader` composable to support common quick search and cart behaviors ([a24b1d3](https://github.com/ecomplus/cloud-commerce/commit/a24b1d37163943d682bc648d4ecc01bbc80de8b3))
* **storefront:** Send search events (with terms) to analytics ([8bc75a6](https://github.com/ecomplus/cloud-commerce/commit/8bc75a679d73440a845133ccda8ed8776564d785))


### Bug Fixes

* **storefront:** Minor fix search egine to skip adding "almost duplicated" terms ([0cf1e6c](https://github.com/ecomplus/cloud-commerce/commit/0cf1e6c89fade1081e162f73a7beec1f6580016c))
* **storefront:** Update `useSearchModal` to filter search history without current term ([969a4d5](https://github.com/ecomplus/cloud-commerce/commit/969a4d5ac763d4cbc545a265e4fc72bab6ddddee))

## [0.37.0](https://github.com/ecomplus/cloud-commerce/compare/v0.36.2...v0.37.0) (2023-12-06)


### ⚠ BREAKING CHANGES

* **storefront:** Search engine constructor does not receive nor mantain `url` option anymore, forcing it to `search/v1`, params should be set separately

### Features

* **storefront:** Add `isFetching` ref to search engine class ([014640e](https://github.com/ecomplus/cloud-commerce/commit/014640e4e659d1a6b8a3d48113c9fbfe529a08ac))
* **storefront:** Handling count and faceted search on `SearchEngine` with new public attributes ([e609e88](https://github.com/ecomplus/cloud-commerce/commit/e609e88749c23ec5ac77f410683f2abe41f13602))
* **storefront:** New `useSearchModal` composable ([91d21d5](https://github.com/ecomplus/cloud-commerce/commit/91d21d5aef738d9570c951b041b7c720851f6b7e))


### Bug Fixes

* **deps:** Update non-major dependencies ([#282](https://github.com/ecomplus/cloud-commerce/issues/282)) ([0b5eb14](https://github.com/ecomplus/cloud-commerce/commit/0b5eb148ca758240045812eca5c04a5dd6b6b435))
* **storefront:** Bump astro to v3.6.4 ([#284](https://github.com/ecomplus/cloud-commerce/issues/284)) ([04c8b55](https://github.com/ecomplus/cloud-commerce/commit/04c8b557bda1aa618e974351d7471210a25e7ff3))
* **storefront:** Bump Vue to v3.3.10 ([6dc5924](https://github.com/ecomplus/cloud-commerce/commit/6dc5924c4de100dc62ec1e116cc83a3cd92d759e))
* **storefront:** Ensure `shoppingCart` state type with subtotal defined (number) ([47aedfe](https://github.com/ecomplus/cloud-commerce/commit/47aedfede02499cd62d9e7b0c50861284c5e8650))
* **storefront:** Minor edit `SearchEngine` to ensure current term is on top of history list ([6a893c1](https://github.com/ecomplus/cloud-commerce/commit/6a893c19034afd4e8aa866adf4a22b60a483b626))
* **storefront:** Properly handling `SearchEngine` fetching state ([1fabf0a](https://github.com/ecomplus/cloud-commerce/commit/1fabf0a9b57dd565bc7157501a4da788f2d40aba))
* **storefront:** Set `CarouselControl>` default zindex to 11 ([fb82ef0](https://github.com/ecomplus/cloud-commerce/commit/fb82ef0c8998754a1fd131afcc553410517ed176))

### [0.36.2](https://github.com/ecomplus/cloud-commerce/compare/v0.36.1...v0.36.2) (2023-12-03)


### Bug Fixes

* **cli:** Add typescript ad pkg dep to ensure required version ([27de9b2](https://github.com/ecomplus/cloud-commerce/commit/27de9b268af2c0990bf882c28a6a3708cbf3c0ce))
* **deps:** Bump vue to v3.3.9 (revert) ([147bcf0](https://github.com/ecomplus/cloud-commerce/commit/147bcf0800592debba7b9d45f6b7957a871226a5))

### [0.36.1](https://github.com/ecomplus/cloud-commerce/compare/v0.36.0...v0.36.1) (2023-12-03)

## [0.36.0](https://github.com/ecomplus/cloud-commerce/compare/v0.35.1...v0.36.0) (2023-12-03)


### ⚠ BREAKING CHANGES

* **storefront:** Store SSR `env.d.ts` should add `/// <reference types="@cloudcommerce/storefront/.auto-imports" />` to keep using Vue methods without manual imports on .vue/.astro/.mdx files

### Bug Fixes

* **storefront:** Ensure Vue imports (no auto-import expected) on lib components ([c03ad92](https://github.com/ecomplus/cloud-commerce/commit/c03ad921e43f15faa119134e96507ca80be1cc17))


* **storefront:** Removing `.auto-import.d.ts` from `client.d.ts`, prevents internal errors ([34c1a4f](https://github.com/ecomplus/cloud-commerce/commit/34c1a4f921db777ac0a8e65fc501bebf78f73c32))

### [0.35.1](https://github.com/ecomplus/cloud-commerce/compare/v0.35.0...v0.35.1) (2023-12-02)


### Bug Fixes

* **storefront:** Update `loadRouteContext` with more permissive type for Astro (AstroGlobal) param ([31932db](https://github.com/ecomplus/cloud-commerce/commit/31932dbe5e73713d5be41a0562628c71b1cb9115))

## [0.35.0](https://github.com/ecomplus/cloud-commerce/compare/v0.34.0...v0.35.0) (2023-12-02)


### ⚠ BREAKING CHANGES

* **ssr:** Env var renamed for GA integration, may have to change GH respo actions secrets and/or .env file
* **storefront:** `shoppingCart` rewriten to reactive object instead of computed

### Features

* **ssr:** Handle /_logo and /_icon paths redirecting to respective image URLs from settings content ([df33647](https://github.com/ecomplus/cloud-commerce/commit/df33647f528f45b35c15a79666e8f7b54edada3c))
* **ssr:** Saving page views and product views count on local Firestore ([b702e8a](https://github.com/ecomplus/cloud-commerce/commit/b702e8a33634101872a75fbeecd2b433c152bff3))
* **storefront:** Add `isHidden` and `anchorEl` optional props to `<Drawer>` ([91c3879](https://github.com/ecomplus/cloud-commerce/commit/91c387902945a2ce3ec314147dc9ecd29dd52356))
* **storefront:** Add `wrapperKey` optional prop to Carousel to trigger recalc wrapper size ([906f766](https://github.com/ecomplus/cloud-commerce/commit/906f7664f6f48934cc7d5d7dbf70ca73288cb140))
* **storefront:** Add new `SearchEngine` state and class with basic paginated search and reactivity ([d99e231](https://github.com/ecomplus/cloud-commerce/commit/d99e231ca2d522b15a22e1ba94c1f127e1c91d3e))
* **storefront:** New `<Drawer>` props to edit animation, max witdth and custom dialog styles ([bb30411](https://github.com/ecomplus/cloud-commerce/commit/bb30411bd57c34a8ffde2088d6ab8356aa822f6c))
* **storefront:** Update vbeta-app script to support new checkout URL search params ([2fcb766](https://github.com/ecomplus/cloud-commerce/commit/2fcb76602784d9390efbc11b9693ae468db07077))


### Bug Fixes

* **api:** Rate limit retry-after is expressed in seconds ([757ccdb](https://github.com/ecomplus/cloud-commerce/commit/757ccdbfda23529b732efd5ec55adceb6f32273d))
* **deps:** Update non-major dependencies ([#275](https://github.com/ecomplus/cloud-commerce/issues/275)) ([740a62c](https://github.com/ecomplus/cloud-commerce/commit/740a62c1edfd7f188eef0edc267ddb1e5ecc9559))
* **ssr:** Await analytics events to send and debug (warn) requests errors ([f1f6039](https://github.com/ecomplus/cloud-commerce/commit/f1f6039995152cd81e710ce14b554b17cdce0091))
* **ssr:** General fixes for server analytics events ([74ad091](https://github.com/ecomplus/cloud-commerce/commit/74ad09159d6377fb5854f50eb4b2415e7b79ad38))
* **storefront:** Ensure `shoppingCart` items state reactivity ([21e3a28](https://github.com/ecomplus/cloud-commerce/commit/21e3a28ade77503579d7e6d5fbbd3f4eec2d5248))
* **storefront:** Ensure forms base styles with selector specificity (0, 1) ([5f9836a](https://github.com/ecomplus/cloud-commerce/commit/5f9836ac20603f9e8c84cacbc407ec11542b1c18))
* **storefront:** Handle direct buy keeping cart saved with new temporary cart for current checkout ([c26459f](https://github.com/ecomplus/cloud-commerce/commit/c26459fdde963668b9b3502c6e310c9b4bb44738))
* **storefront:** Prevent search engine error with undefined response on fetch debounce ([46da11f](https://github.com/ecomplus/cloud-commerce/commit/46da11f5320714966db3b8d7d4833b58a676e82e))
* **storefront:** Try getting TikTik click ID from URL for server side events ([6b16b87](https://github.com/ecomplus/cloud-commerce/commit/6b16b8766e524761e36a052da29c4a52ef30948f))


* **ssr:** Renaming optional env var to `GA_API_SECRET` ([baa2372](https://github.com/ecomplus/cloud-commerce/commit/baa2372bf80f592ad84fff789d0a0db5cddd12fb))

## [0.34.0](https://github.com/ecomplus/cloud-commerce/compare/v0.33.5...v0.34.0) (2023-11-26)


### ⚠ BREAKING CHANGES

* **storefront:** Updating to Astro v3

### Features

* **storefront:** Updating to Astro v3 ([7a0b529](https://github.com/ecomplus/cloud-commerce/commit/7a0b5295357c0fc9f1946e5b98578e0adaefa86c))


### Bug Fixes

* **storefront:** Updating custom `<Picture>` handlers for Astro v3 assets ([#233](https://github.com/ecomplus/cloud-commerce/issues/233)) ([5396645](https://github.com/ecomplus/cloud-commerce/commit/53966455cbd595b07300a22f8a5726ef553eef2c))

### [0.33.5](https://github.com/ecomplus/cloud-commerce/compare/v0.33.4...v0.33.5) (2023-11-24)


### Bug Fixes

* **api:** Prevent error Content-Length mismatch on POST ([8e642fc](https://github.com/ecomplus/cloud-commerce/commit/8e642fc0b792a070bf8d3bf526c1fdb904787a56))
* **cli:** Update default `firebase.json` to ensure Hosting root rewrited to SSR function ([f465763](https://github.com/ecomplus/cloud-commerce/commit/f465763cefaeb5cac783f9a8125c3190d7f4b05f))
* **jadlog:** Fixing module file exports ([6f9d195](https://github.com/ecomplus/cloud-commerce/commit/6f9d1959e0fd02a2dc2b6f20b39751c8993c0b19))
* **modules:** Properly set modules API base URL on localhost emulators ([18befaf](https://github.com/ecomplus/cloud-commerce/commit/18befafe44171312b95511613c8091bbad70eabb))
* **storefront:** Properly set modules API base URI on localhost emulation ([eade67b](https://github.com/ecomplus/cloud-commerce/commit/eade67bd2280affc4c7f294fc5df0ce0da4f5158))

### [0.33.4](https://github.com/ecomplus/cloud-commerce/compare/v0.33.3...v0.33.4) (2023-11-24)


### Features

* **i18n:** Add `i19safeBuy` ([60cd36e](https://github.com/ecomplus/cloud-commerce/commit/60cd36e509ba38519a0fead16f07e10694e97af9))
* **ssr:** Start sending GA4 server events with Measurement Protocol API ([#273](https://github.com/ecomplus/cloud-commerce/issues/273)) ([1f98e03](https://github.com/ecomplus/cloud-commerce/commit/1f98e035d478c9226e2352a0c55ebde156ca68cc))
* **storefront:** Parsing pageview, items and cart events to Tiktok Pixel ([fc21d1d](https://github.com/ecomplus/cloud-commerce/commit/fc21d1d3f49efad87b6398107e8eb40fc5e028ba))
* **storefront:** Parsing vbeta app routes to send gtag checkout and purchase events ([48a64db](https://github.com/ecomplus/cloud-commerce/commit/48a64db4f18c9aa6b6228f81967630b75d188d52))


### Bug Fixes

* **modules:** Properly getting modules base URI on checkout request ([94de8af](https://github.com/ecomplus/cloud-commerce/commit/94de8af9864b6258ca95eccd2f06ba5864da775f))
* **storefront:** Fix sending initial add/remove cart events ([a293a98](https://github.com/ecomplus/cloud-commerce/commit/a293a983351f3372b244885e9bb81739dd640ea1))

### [0.33.3](https://github.com/ecomplus/cloud-commerce/compare/v0.33.2...v0.33.3) (2023-11-21)


### Bug Fixes

* **ssr:** Must add `mitt` to SSR package deps ([8c47ac9](https://github.com/ecomplus/cloud-commerce/commit/8c47ac9dff3e496cda0b2e3e70298069b81a1209))

### [0.33.2](https://github.com/ecomplus/cloud-commerce/compare/v0.33.1...v0.33.2) (2023-11-21)


### Features

* **storefront:** Export `cartEvents` from shopping cart state to handle item add/remove events ([57bdcc8](https://github.com/ecomplus/cloud-commerce/commit/57bdcc85aff78a41e67cc05ec8734f7683261315))
* **storefront:** Parsing pageview, items and cart events to Meta Pixel ([0ace18a](https://github.com/ecomplus/cloud-commerce/commit/0ace18a2715ae06f5d81513e368fbf73efffefa4))
* **storefront:** Update `useAnalytics` to emit shopping cart gtag events ([c1a600f](https://github.com/ecomplus/cloud-commerce/commit/c1a600f0970cf2687fc098b42030c43c52db7d10))


### Bug Fixes

* **storefront:** Identifying analytics item view on product page by list id ([cb2cbd2](https://github.com/ecomplus/cloud-commerce/commit/cb2cbd2378a74423f022cb641fab647b3e157c04))
* **storefront:** Sen page view params on every analytics message payload ([98be05f](https://github.com/ecomplus/cloud-commerce/commit/98be05f5b4a2ef098efe69da4f9ced60eda2741c))

### [0.33.1](https://github.com/ecomplus/cloud-commerce/compare/v0.33.0...v0.33.1) (2023-11-16)


### Features

* **storefront:** Add new `getGtagItem` method on `useAnalytics` state as reusable parser ([2f7cb99](https://github.com/ecomplus/cloud-commerce/commit/2f7cb99ccf37f9c0dfcd484068702e0e7291f0f6))
* **storefront:** New `send-gtag-events` script, auto emit first pageview ([a888870](https://github.com/ecomplus/cloud-commerce/commit/a88887013901aa42fbf1722fd7a5c578a810c6ed))
* **storefront:** New `state/use-analytics` module to send and watch events and retrieve session ([f2c10f5](https://github.com/ecomplus/cloud-commerce/commit/f2c10f5d0138755c9526b94f7d033de48123d89d))
* **storefront:** Send page view analytics event on each view transitions "SPA" page load ([914aec4](https://github.com/ecomplus/cloud-commerce/commit/914aec4e07f9b954d2a5da803d1a2fc1dd01f4b3))
* **storefront:** Typing analytics gtag events ([12d2325](https://github.com/ecomplus/cloud-commerce/commit/12d2325d4270b9f8233e4c854cccbd5c41098258))
* **storefront:** Update `scripts/push-analytics-events` to handle GTM `dataLayer` if globally set ([058fe1d](https://github.com/ecomplus/cloud-commerce/commit/058fe1d4b3a6bb6c4a683282a1de1bfc3f0c58c9))
* **storefront:** Update `useProductCard` composable to send view item gtag event ([f2dafd5](https://github.com/ecomplus/cloud-commerce/commit/f2dafd545471530f1e49f51147312aef169a4ad3))


### Bug Fixes

* **deps:** Update non-major dependencies ([#268](https://github.com/ecomplus/cloud-commerce/issues/268)) ([a2a2ebd](https://github.com/ecomplus/cloud-commerce/commit/a2a2ebdccb6153afb89b5df937ca0ea30fa16300))
* **storefront:** Ensure async components hydration with `client:context` on first load ([782ba4a](https://github.com/ecomplus/cloud-commerce/commit/782ba4a0d4b0388e2081c1181393b7c252ce99fe))
* **storefront:** Keep UTM on local storage and consider valid for 7 days ([b0b2d6e](https://github.com/ecomplus/cloud-commerce/commit/b0b2d6e33948798f8a564bc0ee9a0467a09f29d9))
* **storefront:** Properly set page meta title and description from route state and store settings ([39f1ce4](https://github.com/ecomplus/cloud-commerce/commit/39f1ce4b0f8c20777770b0eba67d0e20d4d4f84e))
* **storefront:** Update `<Carousel>` to properly handle partially fit slides ([86666f7](https://github.com/ecomplus/cloud-commerce/commit/86666f7451ebaa5be09df303b297f17b1ac7be58))

## [0.33.0](https://github.com/ecomplus/cloud-commerce/compare/v0.32.0...v0.33.0) (2023-11-09)


### ⚠ BREAKING CHANGES

* **ssr:** `@headlessui/vue` is no more dev dep of `@cloudcommerce/storefront`, not dep of `@cloudcommerce/ssr`, must be manually added as dependency if used

### Features

* **modules:** Optionally override any Function runtime option on `modulesFunctionOptions` config ([d1fed93](https://github.com/ecomplus/cloud-commerce/commit/d1fed93c4ae69c780efe690c62762b2a6ffd1da1))


### Bug Fixes

* **passport:** Set CORS headers and accept OPTIONS request ([d15dc5a](https://github.com/ecomplus/cloud-commerce/commit/d15dc5a11f8d6a180269f8f48660d92ada5e9c38))
* **storefront:** Fix default styles for ::selection with new RGB syntax ([9497bfd](https://github.com/ecomplus/cloud-commerce/commit/9497bfd5dbcbf45136dc027327ea8abe3d8b748d))
* **storefront:** Update dark/light CSS vars to RGB spaces notation ([62ea62c](https://github.com/ecomplus/cloud-commerce/commit/62ea62cc9653b7a207b2da7e203524c6be6db387))
* **storefront:** Updating vbeta-app script version ([c0d50c0](https://github.com/ecomplus/cloud-commerce/commit/c0d50c028474ef0ccbc935b8253260ad978c13e7))


* **ssr:** Removing `@headlessui/vue` from pkg deps ([344916f](https://github.com/ecomplus/cloud-commerce/commit/344916fd49c4683023b188fa9ead66a5c1a346f3))

## [0.32.0](https://github.com/ecomplus/cloud-commerce/compare/v0.31.2...v0.32.0) (2023-11-07)


### ⚠ BREAKING CHANGES

* **storefront:** Passport API not existing anymore, just for token, removed `GET_PASSPORT_API_URI`

### Features

* **modules:** Add CORS headers by default and handle OPTIONS HTTP method (CORS preflight) ([aa08573](https://github.com/ecomplus/cloud-commerce/commit/aa08573100c5744c7b3a48f40187c7d9cc74b613))
* **pagarme-v5:** Create app to integrate Pagar.me API v5 with recurring payments ([#255](https://github.com/ecomplus/cloud-commerce/issues/255)) ([a445642](https://github.com/ecomplus/cloud-commerce/commit/a445642c2a2774fc51d2df3467ca391dc55b0ba6))


### Bug Fixes

* **config:** Properly using `countryCode` from settings content [skip ci] ([4014aab](https://github.com/ecomplus/cloud-commerce/commit/4014aabe3bea6e119755b7abec19b80cd684cba0))
* **deps:** Update non-major dependencies ([#266](https://github.com/ecomplus/cloud-commerce/issues/266)) ([17a559b](https://github.com/ecomplus/cloud-commerce/commit/17a559b0cf3df0897dacd8ac89a02c48415f24a9))
* **modules:** Improving GET response cache with fine control for stale cache ([9c22262](https://github.com/ecomplus/cloud-commerce/commit/9c222625a66cf3ff5abe188041dd054ef05d853e))
* **pagarme-v5:** Fixing package exports filepaths ([3522084](https://github.com/ecomplus/cloud-commerce/commit/3522084b30b77322fc921b7005690dbde44e360f))
* **ssr:** Update Cloudflare SWR worker considering API routes at /_api/* ([8946190](https://github.com/ecomplus/cloud-commerce/commit/8946190d2dcd7a35a64081bb82e541fbca8998f0))
* **storefront:** Fix `@ecomplus/client` const API base URIs on vbeta app compat ([7296836](https://github.com/ecomplus/cloud-commerce/commit/7296836fba024a56e0eb52e1af2e7b7762291816))
* **storefront:** Fix constants names for `@ecomplus/client` on vbeta compat ([56d260a](https://github.com/ecomplus/cloud-commerce/commit/56d260ad520584ecd1b6142455fe48996c2a70fa))
* **storefront:** Fixing API base URI on vbeta-app script ([0e7436e](https://github.com/ecomplus/cloud-commerce/commit/0e7436ef3d1f4aa6ea195561ab10da92852f882b))
* **storefront:** Updating vbeta-app script version ([47738b7](https://github.com/ecomplus/cloud-commerce/commit/47738b76a5e742ca5144ac766d7ea80d0d1c003e))

### [0.31.2](https://github.com/ecomplus/cloud-commerce/compare/v0.31.1...v0.31.2) (2023-11-03)

### [0.31.1](https://github.com/ecomplus/cloud-commerce/compare/v0.31.0...v0.31.1) (2023-11-03)

## [0.31.0](https://github.com/ecomplus/cloud-commerce/compare/v0.30.0...v0.31.0) (2023-11-03)


### ⚠ BREAKING CHANGES

* **correios:** Requires new Correios contracts and credentials

* feat(correios v2): Create app

* chore(correios db): Add database population and main search in database

* chore(action): add correios app environment variables

* chore(pnpm lock): update file

* fix(pnpm lock): Update file

* chore(events): Add event functions

* chore(pnpm lock): Update file

* fix(correios db): Fix fill database and write fallback data

* fix(app correios): Update app package [skip ci]

* fix(events): Remove app correios v2

* fix(firebase config): Remove correiosV2 app and update appId [skip ci]

* fix(modules): Remove correios v2 app

* fix(pnpm lock): Return file to main version

* fix(test correios): Remove debug

* fix(correios): Remove unnecessary comments [skip ci]

* fix(correios v2): Add and correct parsers adds declared value check

* fix(correios): Add weight check and standardization of parameters

* fix(correios): Remove unnecessary comments

* fix(correios): Correct conversion of weight to grams

* fix(correios): Parameterize weight array to grams

### Features

* **correios:** Update app to integrate new Correios API and read/save results to db ([#251](https://github.com/ecomplus/cloud-commerce/issues/251)) ([a1fb7e8](https://github.com/ecomplus/cloud-commerce/commit/a1fb7e8ac3581451ca2a2b57001ddb4a374c6c24))
* **i18n:** Add `i19emailWasSentMsg` ([b3bcb53](https://github.com/ecomplus/cloud-commerce/commit/b3bcb53d0f2603e34ba0ea2ac9193e01dbce178d))
* **storefront:** Add `linkActionUrl` opt param to `submitLogin` method on login form composable ([a783be6](https://github.com/ecomplus/cloud-commerce/commit/a783be6c9fe5af847a6f00eeb7a15b32a07ebad9))
* **storefront:** New `vbeta-app` script to load legacy checkout SPA with session compatibility ([ed7cfb7](https://github.com/ecomplus/cloud-commerce/commit/ed7cfb7612016b577f60b05f4db84a28ea5b8550))


### Bug Fixes

* **affiliate-program:** Preventing error with undefined customer by code and other type fixes ([8340982](https://github.com/ecomplus/cloud-commerce/commit/834098212c539993ec3644c7cc01fcc6b61dbc2e))
* **cli:** Update default `firebase.json` API routes CORS accepted methods ([31fd1c5](https://github.com/ecomplus/cloud-commerce/commit/31fd1c52e3d395f0b585d12bcacc323342b574bb))
* **cli:** Update default `firebase.json` with API routes cache control and CORS headers ([c2a6ff2](https://github.com/ecomplus/cloud-commerce/commit/c2a6ff2f5f1cf5c20d048204628fdaab4f14d6fc))
* **storefront:** Ensure Firebase app init on `useLoginForm` ([3505eda](https://github.com/ecomplus/cloud-commerce/commit/3505eda698ef5f4acdb206f2b4a0b2963fdbd25e))
* **storefront:** Ensure View Transitions script not started on /app/* routes ([9e14b11](https://github.com/ecomplus/cloud-commerce/commit/9e14b11d01538534f13f33b2160c69e9fc95bb3a))
* **storefront:** Update `useLoginForm` to throttle login submit and return `isSubmitting` state ([4096aab](https://github.com/ecomplus/cloud-commerce/commit/4096aabf3bfa0a13db911491bb36cac6c7ed53f7))

## [0.30.0](https://github.com/ecomplus/cloud-commerce/compare/v0.29.0...v0.30.0) (2023-11-01)


### ⚠ BREAKING CHANGES

* **storefront:** Removing `<LoginForm>` Vue component in favor of composable
* **tiny-erp:** GH Action input and env var for Tiny ERP token (optionals) renamed to respect convention
* **storefront:** Removing exported const specific for IOS and Safari

Trying to reduce script execution time with one regex only (instead of separated two)

### Features

* Check optional `env.CRONTAB_*` for each scheduled function ([eebade4](https://github.com/ecomplus/cloud-commerce/commit/eebade443be15207a76ed217c564e7e0b93061d3))
* **firebase:** Check `env.STORE_EVENTS_CRONTAB` to customize events checked crontab (every min) ([d89e67a](https://github.com/ecomplus/cloud-commerce/commit/d89e67a928c316d066d1b5724f9025e0ead33356))
* **firebase:** Handle optional config object `apiEvents` to change delayed ms or disable events ([d04ce53](https://github.com/ecomplus/cloud-commerce/commit/d04ce53b786d8954cca0f7e4660f379d98e65e2a))
* **i18n:** Add `i19sendLoginLinkByEmail` ([bec9f07](https://github.com/ecomplus/cloud-commerce/commit/bec9f07737abf0981def8a6bd98ed41527f04791))
* **mandae:** Create app to integrate Mandaê shipping intermediator  ([#254](https://github.com/ecomplus/cloud-commerce/issues/254)) ([ffbc94c](https://github.com/ecomplus/cloud-commerce/commit/ffbc94c397ff4642c1ec8a1133e6a69a9f947b27))
* **storefront:** New `useLoginForm` composable ([30dfd82](https://github.com/ecomplus/cloud-commerce/commit/30dfd82cd30b863586d97725401ccbd7aad98a27))
* **storefront:** Optional global `$storefrontCacheController` to override default SSR Cache-Control ([2244d3e](https://github.com/ecomplus/cloud-commerce/commit/2244d3eb840bb989e8b41979285c8997abd84364))


### Bug Fixes

* **cli:** Stop using zx fetch, using node (18) global fetch instead ([947de65](https://github.com/ecomplus/cloud-commerce/commit/947de65714bcb932d799e31ea1953d8aafe506f8))
* **deps:** Update non-major dependencies ([#256](https://github.com/ecomplus/cloud-commerce/issues/256)) ([6ad8135](https://github.com/ecomplus/cloud-commerce/commit/6ad81355939b1c971d70de2efd8e70aa36458348))
* **firebase:** Set minimum default functions memory to 256mb [skip ci] ([e0d0cce](https://github.com/ecomplus/cloud-commerce/commit/e0d0cce1d08e1da32e8d5facb4660a99a363a48b))
* **storefront:** Disabling global view transitions on /app/* SPA routes ([dc5ed9a](https://github.com/ecomplus/cloud-commerce/commit/dc5ed9af1970a8a7a130c575752f3d800f829568))
* **storefront:** Prevent `<CheckoutLink>` and `<AccountLink>` breack with undefined `$storefront` ([beaa530](https://github.com/ecomplus/cloud-commerce/commit/beaa53089423c4d037656b7578aafc44d2bf50a4))
* **storefront:** Set brand colors vars with RGB new (spaces) notation ([c5c11ee](https://github.com/ecomplus/cloud-commerce/commit/c5c11ee53efb224e00e6eaf43d51a11e87f2cb87))
* **storefront:** Skip /_api* routes to wildcard slug pages ([7bf7fe3](https://github.com/ecomplus/cloud-commerce/commit/7bf7fe3aeca9729375913892c3375df8d6658a1f))
* **storefront:** Update `<ViewTransitions>` to skip /app/* routes and dont prefetch with role=button ([efc2dba](https://github.com/ecomplus/cloud-commerce/commit/efc2dbac3b6fadbe099af3f28df765e455a76577))
* **storefront:** Update `ViewTransitions.astro` to respect v3 data-astro-reload spec ([687e181](https://github.com/ecomplus/cloud-commerce/commit/687e181cd9aa40cb28ba3f188b9ef354eab820e3))
* **storefront:** Update dependency unocss to ^0.57.1 ([#259](https://github.com/ecomplus/cloud-commerce/issues/259)) ([d1c9a88](https://github.com/ecomplus/cloud-commerce/commit/d1c9a883419b989e35e0b78d2f3bea591eeb1b36))


* **storefront:** Simplifying browser env detection ([750427f](https://github.com/ecomplus/cloud-commerce/commit/750427f70eb86836dd0eb4b852aee41233226672))
* **tiny-erp:** Renaming token env to `env.TINYERP_TOKEN` ([d150cba](https://github.com/ecomplus/cloud-commerce/commit/d150cbaa9e84a38d6722b13b77bd596387f3d57b))

## [0.29.0](https://github.com/ecomplus/cloud-commerce/compare/v0.28.5...v0.29.0) (2023-10-17)


### ⚠ BREAKING CHANGES

* Default modules and passport APIs URLs changed

### Features

* **storefront:** Update Astro `client:context` custom directive to accept "idle" value ([3ce1f3b](https://github.com/ecomplus/cloud-commerce/commit/3ce1f3b1e60feb3071eec0f5e36ece4af851a658))


### Bug Fixes

* **ssr:** Set default demoStore CDN assets prefix as done by storefront config ([5de0ac1](https://github.com/ecomplus/cloud-commerce/commit/5de0ac1c18e481317d2f10f4aad5d77ad80a5488)), closes [#L53-L55](https://github.com/ecomplus/cloud-commerce/issues/L53-L55)


* Moving modules and passport APIs to /_api/* routes ([eed3d73](https://github.com/ecomplus/cloud-commerce/commit/eed3d731257d06fa81a31ccdec8466f9c465d59b))

### [0.28.5](https://github.com/ecomplus/cloud-commerce/compare/v0.28.4...v0.28.5) (2023-10-17)


### Bug Fixes

* **ssr:** Properly set assets prefix (if configured) to CSS preload Link header ([3f83e56](https://github.com/ecomplus/cloud-commerce/commit/3f83e56e11c7e9a9aceb3c2a7cfd21e704304069))

### [0.28.4](https://github.com/ecomplus/cloud-commerce/compare/v0.28.3...v0.28.4) (2023-10-17)


### Bug Fixes

* **storefront:** Set optimized pictures responsive srcset with assets prefix (CDN) if configured ([36b9ae6](https://github.com/ecomplus/cloud-commerce/commit/36b9ae66fb03609017b06ef6002e4f052f6b40af))

### [0.28.3](https://github.com/ecomplus/cloud-commerce/compare/v0.28.2...v0.28.3) (2023-10-16)


### Features

* **storefront:** Set `Astro.locals.assetsPrefix` globally available on Astro components ([0548fbb](https://github.com/ecomplus/cloud-commerce/commit/0548fbb9c864a300e215a3f2c8c722f34fb07279))


### Bug Fixes

* **deps:** Update non-major dependencies ([#253](https://github.com/ecomplus/cloud-commerce/issues/253)) ([9a29d76](https://github.com/ecomplus/cloud-commerce/commit/9a29d76459541b20f1816b1e572281294f19d4c3))
* **storefront:** Must set cache control stale-while-revalidate even without s-maxage ([3d27496](https://github.com/ecomplus/cloud-commerce/commit/3d274961e0f10f1afae22da1e6cdeb70e17811e8))
* **storefront:** Properly set optimized pictures src with assets prefix (CDN) if configured ([68a8b6e](https://github.com/ecomplus/cloud-commerce/commit/68a8b6e3fb2f1837dfb40dbe996fb46832c4b0b5))

### [0.28.2](https://github.com/ecomplus/cloud-commerce/compare/v0.28.1...v0.28.2) (2023-10-15)

### [0.28.1](https://github.com/ecomplus/cloud-commerce/compare/v0.28.0...v0.28.1) (2023-10-15)


### Features

* **i18n:** Add `i19chooseProductDetailsToBuy` ([2b8aea7](https://github.com/ecomplus/cloud-commerce/commit/2b8aea72fc75c1700ef6ef691742052d5e51ce07))
* **ssr:** Edit Cloudflare SWR worker to support URL rewrites /__swr/* ([528aab0](https://github.com/ecomplus/cloud-commerce/commit/528aab0d7398983f9c43662c8b949f5ca8c5e1d3))
* **storefront:** Handle optional `settings.assetsPrefix` field to support deploy with external CDN ([46d6c43](https://github.com/ecomplus/cloud-commerce/commit/46d6c431a951a510508ed6d4078035e3fbbf2304))
* **storefront:** New `useSkuSelector` composable ([2865f1e](https://github.com/ecomplus/cloud-commerce/commit/2865f1efc7e3c8a909aca70fe85045fb3804ae2d))
* **storefront:** New optional props `cartId` and `cartItem` for `<CheckoutLink>` ([5295149](https://github.com/ecomplus/cloud-commerce/commit/529514968bb786cb4754912837aa9505989f3873))


### Bug Fixes

* **ssr:** Prevent overwriting Link response header if already set on storefront render output ([3e30407](https://github.com/ecomplus/cloud-commerce/commit/3e30407781485b16fd285e3e94083ea04e86ba19))
* **storefront:** Update link fields from settings on `<CheckoutLink>` and `<AccountLink>` ([af6808e](https://github.com/ecomplus/cloud-commerce/commit/af6808e17273b358ed274d8b79b421d4fded1042))

## [0.28.0](https://github.com/ecomplus/cloud-commerce/compare/v0.27.0...v0.28.0) (2023-10-06)


### ⚠ BREAKING CHANGES

* **storefront:** content/layout.json must be edited with fields in camelCase
* Content `settings` object (and `config.settingsContent`) changed
* **storefront:** `PageContent` interface editted, content/pages hero and sections must be updated with new fields in camelCase

### Bug Fixes

* **loyalty points:** Add points after some days gap with cron to prevent fast cancellations ([#250](https://github.com/ecomplus/cloud-commerce/issues/250)) ([4eb705c](https://github.com/ecomplus/cloud-commerce/commit/4eb705cea98884255745ae7222bb8e2a264e625a))
* **mercadopago:** Updating with https://github.com/ecomplus/app-mercadopago/commit/0205afd64e31fc19776343b8a355d43deb6a911d ([#249](https://github.com/ecomplus/cloud-commerce/issues/249)) ([47a03e6](https://github.com/ecomplus/cloud-commerce/commit/47a03e60551d9fb2e17a079cedff00106b05e967))
* **storefront:** Minor fix `<ContentClearfix>` with horizontal scroll on large devices ([03b1d8d](https://github.com/ecomplus/cloud-commerce/commit/03b1d8da4fb01f0bc8dc7701ff71ad9ce0bdd858))


* Edit settings types to camelCase fields ([47aec28](https://github.com/ecomplus/cloud-commerce/commit/47aec28bffd1e33ed2b2d715aac7611cf2ef3403))
* **storefront:** Expect hero/sections content with camelCase for easy parsing and props bypass ([70d976b](https://github.com/ecomplus/cloud-commerce/commit/70d976b1b1600fff9772db275bb57d85b08dc07e))
* **storefront:** Expect layout content fields camelCase ([e9404ea](https://github.com/ecomplus/cloud-commerce/commit/e9404ea61f72a5aa50858104ee58b1c3b1d88d9e))

## [0.27.0](https://github.com/ecomplus/cloud-commerce/compare/v0.26.7...v0.27.0) (2023-10-06)


### ⚠ BREAKING CHANGES

* **storefront:** Astro.locals.contextInlineClientJS no more set
* **storefront:** <Carousel> API changed, using explicit `index` prop with model instead of default (value) `v-model`, edited binds on controls slot
* **storefront:** Component ContentClearfix.astro is removed in favor of .vue one

### Features

* **storefront:** Add new prop `preferredSize` to global <AImg> component ([d2387d4](https://github.com/ecomplus/cloud-commerce/commit/d2387d4a20b7e2343399674b4f73bd7dee70f879))
* **storefront:** Auto import Vue composition API and other helper exports ([9e92931](https://github.com/ecomplus/cloud-commerce/commit/9e929316277f0162ff55a1c86792697dc50867e5))
* **storefront:** New prop `hasControls` to <Carousel> ([017d5c9](https://github.com/ecomplus/cloud-commerce/commit/017d5c9f8eb9f927e463b8a7d5c6f1f811d839f5))
* **storefront:** Update <Carousel> with new optional `axis` prop for vertical slide ([21e3a02](https://github.com/ecomplus/cloud-commerce/commit/21e3a02799bb52e573856a4304032315e060410b))
* **tiny-erp:** Updating with https://github.com/ecomplus/app-tiny-erp ([#218](https://github.com/ecomplus/cloud-commerce/issues/218)) ([a5ffd26](https://github.com/ecomplus/cloud-commerce/commit/a5ffd26808ddc5609492a39363ce265d3ded3f26))


### Bug Fixes

* **deps:** Update non-major dependencies ([#248](https://github.com/ecomplus/cloud-commerce/issues/248)) ([344927b](https://github.com/ecomplus/cloud-commerce/commit/344927bb69b3be5c5ec1e43dc0b38246a04f256a))
* **storefront:** Add hardfix on base CSS to hide duplicated drawer backdrops (with "SPA" mode) ([91ce452](https://github.com/ecomplus/cloud-commerce/commit/91ce452b50bd210999c8c228adcf744fa763a5be))
* **storefront:** Disable View Transitions fallback (Firefox) by default (for now) ([deb58ff](https://github.com/ecomplus/cloud-commerce/commit/deb58ff34c9bf3f58e3f961a060d062bad3518a3))
* **storefront:** Fixing global `$storefront.apiContext.doc` types with full resources interfaces ([c28ce11](https://github.com/ecomplus/cloud-commerce/commit/c28ce118325a7aac9409d8d3535b95879b3ea021))
* **storefront:** Properly dealing with API Context on View Transitions ([e254116](https://github.com/ecomplus/cloud-commerce/commit/e2541161f696ccd5da8403d8d7bea0e9c33131fc))
* **storefront:** Properly sync <Carousel> index on prop change ([6237934](https://github.com/ecomplus/cloud-commerce/commit/6237934cdf5c70c47d7269c0dd35125b427bd30a))
* **storefront:** Setup custom <ViewTransitions> with fixed head script exec and browser fallback ([2e53207](https://github.com/ecomplus/cloud-commerce/commit/2e5320718bfa76c6e7f6258031a546e3f9089aa4))


* **storefront:** Move <ContentClearfix> to Vue component instead of Astro one ([e6ca8c4](https://github.com/ecomplus/cloud-commerce/commit/e6ca8c4bbe5f8f42de15d852273dd9ae2575c136))

### [0.26.7](https://github.com/ecomplus/cloud-commerce/compare/v0.26.6...v0.26.7) (2023-09-18)


### Features

* **ssr:** Fallback redirect static built files on 404 hash mismtach ([494848b](https://github.com/ecomplus/cloud-commerce/commit/494848b5822f0bb5fd4e1dc9c800197b6c585e33))
* **storefront:** Edit `usePageHeader` to accept `listedCategoryFields` null skip categories fetch ([be563d7](https://github.com/ecomplus/cloud-commerce/commit/be563d746837c97972825d2db5cdf01fc3084238))


### Bug Fixes

* **deps:** Update dependency facebook-nodejs-business-sdk to v18 ([#239](https://github.com/ecomplus/cloud-commerce/issues/239)) ([464b0df](https://github.com/ecomplus/cloud-commerce/commit/464b0df1701f1e73e0c891ab8d64144f3c5e23cb))
* **deps:** Update non-major dependencies ([#238](https://github.com/ecomplus/cloud-commerce/issues/238)) ([e869660](https://github.com/ecomplus/cloud-commerce/commit/e869660e1796f1a78bbf98ab7b345909f61cc3cf))
* **storefront:** Hardfix for 100vh problem on mobile (`.h-screen`) with dvh unit ([c4a3fb7](https://github.com/ecomplus/cloud-commerce/commit/c4a3fb707a3668ec5ffdd8ae7a2b987da8a40ad7))
* **storefront:** New `Astro.locals.contextInlineClientJS` and body script to reset context n CSR ([eeab76c](https://github.com/ecomplus/cloud-commerce/commit/eeab76c30c5e3942d032d475459828872461eaf6))
* **storefront:** Set and reset <body> visibility to prevent FOUC ([6eb237f](https://github.com/ecomplus/cloud-commerce/commit/6eb237f7173072a3ee780fe7cd948faaa99dfec6))
* **storefront:** Update ContentClearfix to also limit child <iframe> width ([0b0031b](https://github.com/ecomplus/cloud-commerce/commit/0b0031bb4c10fd50d92c0ca2165446e760174c3a))
* **storefront:** Update reset.css to selector specificity 0 for button/a colors ([23b3870](https://github.com/ecomplus/cloud-commerce/commit/23b387066e96808fc59fbca40beffa1bad8227ca))

### [0.26.6](https://github.com/ecomplus/cloud-commerce/compare/v0.26.5...v0.26.6) (2023-09-13)


### Bug Fixes

* **apps:** Ensure `@cloudcommerce/test-base` as dev dependency only ([020a23d](https://github.com/ecomplus/cloud-commerce/commit/020a23d474e20a6712e51a04f16bd293035d8929))

### [0.26.5](https://github.com/ecomplus/cloud-commerce/compare/v0.26.4...v0.26.5) (2023-09-13)


### Features

* **storefront:** Async loading CMS content for API doc page (wildcard by slug) ([5fc2010](https://github.com/ecomplus/cloud-commerce/commit/5fc2010ab897a81c142014a1cd207e428e910974))
* **storefront:** Handling new section type breadcrumbs ([c3af083](https://github.com/ecomplus/cloud-commerce/commit/c3af0838691db06ecd5aaa31d9619b49cfdbdd01))
* **storefront:** New `useBreadcrumbs` server-side-first composable ([688c037](https://github.com/ecomplus/cloud-commerce/commit/688c03727210834413dc78cdfdca663b0ef80496))
* **storefront:** New bypassed section types expected for product page ([3e38002](https://github.com/ecomplus/cloud-commerce/commit/3e38002b398881a3ef44d4a916d009c7eeab6443))
* **storefront:** New ContentClearfix.astro component for user's html content ([5873973](https://github.com/ecomplus/cloud-commerce/commit/58739737f47a494715492ba50116e651a95501b4))


### Bug Fixes

* **deps:** Update non-major dependencies ([#234](https://github.com/ecomplus/cloud-commerce/issues/234)) ([62345c6](https://github.com/ecomplus/cloud-commerce/commit/62345c648901b88ee49c3fee77daa4eaafb4fbb9))
* **storefront:** Update `apiContext.doc` type with common required document fields ([7f814d9](https://github.com/ecomplus/cloud-commerce/commit/7f814d9fce20a5e8ba01a65ed515f557d3a7d194))
* **storefront:** Update `useSharedData` to timeout listeners (1s by default) ([9aa5d30](https://github.com/ecomplus/cloud-commerce/commit/9aa5d3018b9eb90397b64d66861a1e05096b9770))

### [0.26.4](https://github.com/ecomplus/cloud-commerce/compare/v0.26.3...v0.26.4) (2023-09-08)


### Features

* **storefront:** Enabling Astro (v2 experimental) `viewTransitions` on all pages by default ([561c40d](https://github.com/ecomplus/cloud-commerce/commit/561c40d18e6e442ffc400e1c32197d0c26dd90c9))


### Bug Fixes

* **storefront:** Fixing SW navigate fallback and cache strategies ([1198a94](https://github.com/ecomplus/cloud-commerce/commit/1198a94b22347ea99a41d9d6d7efee31f67201a1))
* **storefront:** Update SW for immutable (365d) cache for js/css hashed chunks ([1e631f4](https://github.com/ecomplus/cloud-commerce/commit/1e631f4ba21c309b1c71d32478e9fad507a0b723))

### [0.26.3](https://github.com/ecomplus/cloud-commerce/compare/v0.26.2...v0.26.3) (2023-09-08)


### Features

* **modules:** Checkout accepting undefined discount app id for multiple discount apps ([8c6984a](https://github.com/ecomplus/cloud-commerce/commit/8c6984a719b0b3b942ef6f4b50797beb818ebe07))


### Bug Fixes

* **deps:** Update non-major dependencies ([#228](https://github.com/ecomplus/cloud-commerce/issues/228)) ([0aa35ea](https://github.com/ecomplus/cloud-commerce/commit/0aa35ea0fe8bbc11cc291e2266a70a646e32444b))
* **modules:** Better handling multiple results (apps) for apply discounts ([4f9126b](https://github.com/ecomplus/cloud-commerce/commit/4f9126b362d40cc87d633bde012271ac15c5bb31))

### [0.26.2](https://github.com/ecomplus/cloud-commerce/compare/v0.26.1...v0.26.2) (2023-08-28)


### Bug Fixes

* **ssr:** Check SSR_* env vars on function execution time ([1364f67](https://github.com/ecomplus/cloud-commerce/commit/1364f674aeaa016fcec7c99f95364ed45a59ecb8))

### [0.26.1](https://github.com/ecomplus/cloud-commerce/compare/v0.26.0...v0.26.1) (2023-08-28)


### Bug Fixes

* **ssr:** Add `astro-capo` to SSR dependencies ([dbd2f06](https://github.com/ecomplus/cloud-commerce/commit/dbd2f06a79b5eac8cf68f93c7459689fe8cdcb58))

## [0.26.0](https://github.com/ecomplus/cloud-commerce/compare/v0.25.0...v0.26.0) (2023-08-28)


### ⚠ BREAKING CHANGES

* **storefront:** `useSharedData` composable now returns a promise

### Features

* **i18n:** Add `i19allProducts` and `i19institutional` ([131a7e3](https://github.com/ecomplus/cloud-commerce/commit/131a7e3cc2d1dfdf995ae4c1eb92dd0cbbec3e12))
* **ssr:** New optional `SSR_SET_LINK_HEADER` env (true by default) ([e8481a7](https://github.com/ecomplus/cloud-commerce/commit/e8481a7bd78e6caebd6e37776e6a030425cff11f))
* **storefront:** Mannualy set `´PageContent` to more flexible interface ([820d716](https://github.com/ecomplus/cloud-commerce/commit/820d7160e84d71391998139c28ec606957160f91))
* **storefront:** Update VueUse to v10.4.0, UnoCSS and Firebase non-major ([88b0bcc](https://github.com/ecomplus/cloud-commerce/commit/88b0bcc944f71fc7fe85d8da837b63c6e1bb110d))
* **storefront:** Use event emitter on `useSharedData` to support optional awaited value ([851ed67](https://github.com/ecomplus/cloud-commerce/commit/851ed67037ebc1552540bf8e4f7d1797c0807c14))


### Bug Fixes

* **deps:** Update non-major dependencies ([#221](https://github.com/ecomplus/cloud-commerce/issues/221)) [skip ci] ([0191eff](https://github.com/ecomplus/cloud-commerce/commit/0191eff3ac0f5fb9cb1cdb91479c28d0dc0f3036))
* **i18n:** Fix `i19allProducts` ([3a09c25](https://github.com/ecomplus/cloud-commerce/commit/3a09c2553d819a3b4dadbfe3f3355c7defa6453d))
* **storefront:** Edit `LayoutContent` typedef for extendable footer and header content ([2edc576](https://github.com/ecomplus/cloud-commerce/commit/2edc5769865b212efeeace9546d7cf33783ee2d9))
* **storefront:** Extending `PageContent` typedef for extra pages and blog posts ([16a4b3e](https://github.com/ecomplus/cloud-commerce/commit/16a4b3e6d6bd1530bba6c19581a5b1a982b8132c))
* **storefront:** Fix CMS `getContent` to escape folder hidden files and clear not .json ext ([e0b5563](https://github.com/ecomplus/cloud-commerce/commit/e0b55635abeb9c1d083006937f9b4fe3803e3b0b))
* **storefront:** Update Astro to v2.10.14 ([4d00a98](https://github.com/ecomplus/cloud-commerce/commit/4d00a984d56d1cc15b42d04d2d1520690b5e2bbb))

## [0.25.0](https://github.com/ecomplus/cloud-commerce/compare/v0.24.1...v0.25.0) (2023-08-23)


### ⚠ BREAKING CHANGES

* **cli:** Host is now exposed by default on dev (default) CLI command, SSR function dev script should not contain --host and --port options
* **storefront:** Stop exporing non-reactive globals `settings` and `apiContext` from `@@sf/sf-lib`

### Bug Fixes

* **cli:** Update `cloudcommerce [dev]` command to bypass --host and --port args ([e55e438](https://github.com/ecomplus/cloud-commerce/commit/e55e4383a8de2a9ff1d65b0af766c3e8980b1121))
* **deps:** Update non-major dependencies ([#216](https://github.com/ecomplus/cloud-commerce/issues/216)) ([377e4b0](https://github.com/ecomplus/cloud-commerce/commit/377e4b0533cb41d839afff1cfc4f8c44caeffa0f))
* **firebase:** Update dependency @google-cloud/pubsub to v4 ([#217](https://github.com/ecomplus/cloud-commerce/issues/217)) ([d5e98b8](https://github.com/ecomplus/cloud-commerce/commit/d5e98b84937a5be3062972e49480fc98bc9ffe70))
* **ssr:** Redirect not found .css files to unique CSS filepath ([d2dcaf9](https://github.com/ecomplus/cloud-commerce/commit/d2dcaf99551e2581027f07c62a1beddec46ec896))
* **storefront:** Prevent undefined `import.meta.env` error on config ([83c26f6](https://github.com/ecomplus/cloud-commerce/commit/83c26f660c307e366c139c489e75f8bc2450dc1b))
* **storefront:** Set `socialNetworks` after route load on SSR ([9d2be60](https://github.com/ecomplus/cloud-commerce/commit/9d2be602937f4d61ca0c96cdc6170a717ff5b3f0))
* **storefront:** Update Astro to v2.10.12 ([#215](https://github.com/ecomplus/cloud-commerce/issues/215)) ([4ae833f](https://github.com/ecomplus/cloud-commerce/commit/4ae833f25438626e268019e7ea9032a14aa1abf8))

### [0.24.1](https://github.com/ecomplus/cloud-commerce/compare/v0.24.0...v0.24.1) (2023-08-19)


### Features

* **storefront:** Add new global <Skeleton> component ([83c42b1](https://github.com/ecomplus/cloud-commerce/commit/83c42b113200c28dd56b77f80df393f911194957))


### Bug Fixes

* **storefront:** Fix regression with icons aliases selectors on UnoCSS config ([37f7c8e](https://github.com/ecomplus/cloud-commerce/commit/37f7c8efaa63273cf3c0eb575d174cb9e2358fdc))

## [0.24.0](https://github.com/ecomplus/cloud-commerce/compare/v0.23.3...v0.24.0) (2023-08-18)


### ⚠ BREAKING CHANGES

* **storefront:** Icons related theme config fields replaced by `generalIconSets`, `brandIconSets`, `brandIconShortcuts`, `logoIconSets`, `logoIconShortcuts`

IntelliSense only field for icons no more needed and removed
* **storefront:** Global component <ALink> API changed
* **storefront:** `usePageHeader` composable props changed (simplified)
* **ssr:** Previous /fallback.astro page must be changed to /~fallback.astro
* **storefront:** Route context `fetchingApiContext` now always resolve with null, error only at `apiContext.error` if any

### Features

* **ssr:** Edit Cloudflare SWR worker to also store SSRed HTML on KV PERMA_CACHE namespace ([1f3b188](https://github.com/ecomplus/cloud-commerce/commit/1f3b188b583a8bfa656c7a7469510fadc10081f4))
* **ssr:** Edit Cloudflare SWR worker to support host override from env vars ([b2fc99b](https://github.com/ecomplus/cloud-commerce/commit/b2fc99bb2310dc9986569beb89a8251c65af85a8))
* **storefront:** Add new `intellisenseIconSets` theme option for Tailwind config ([75ce9c9](https://github.com/ecomplus/cloud-commerce/commit/75ce9c9b64f997dd9bbc86b6f178137745acc40b))
* **storefront:** Add support for multiple icon sets with arrays on theme config ([5d5c0a3](https://github.com/ecomplus/cloud-commerce/commit/5d5c0a3a806cac5ecf15462b2add22804d3d6c0d))
* **storefront:** New <PaymentMethodFlag> component ([2ba386f](https://github.com/ecomplus/cloud-commerce/commit/2ba386fb26dcb72a5c91f4740403302cb4e4a157))
* **types:** Add `service_links` and `payment_methods` (flags) to settings content type ([390be9d](https://github.com/ecomplus/cloud-commerce/commit/390be9d7ec65996bbef1b1431c50de5b195ce8f0))


### Bug Fixes

* **deps:** Update Astro to v2.10.7 ([#210](https://github.com/ecomplus/cloud-commerce/issues/210)) ([fab598f](https://github.com/ecomplus/cloud-commerce/commit/fab598febeb9d2b2d7979497dba08f17b921dcde))
* **deps:** Update dependency unocss to ^0.55.0 ([#213](https://github.com/ecomplus/cloud-commerce/issues/213)) ([55b9626](https://github.com/ecomplus/cloud-commerce/commit/55b96263e141ef5abd340f2146215a0141a02ceb))
* **storefront:** Fix <Drawer> close button z-index ([4ff06db](https://github.com/ecomplus/cloud-commerce/commit/4ff06dbadce0c3261444ea5dcbe57ec294ffa549))
* **storefront:** Increasing sticky header debounce max wait to prevent wrong header final place ([d04b808](https://github.com/ecomplus/cloud-commerce/commit/d04b808ff55a7457d78bc5965d43e5276299a780))
* **storefront:** Minor fix BannerPicture.astro default alt text styles ([6d0aed5](https://github.com/ecomplus/cloud-commerce/commit/6d0aed5ba849af6a0aa8e11da916f7c204e04564))
* **storefront:** Prevent errors with not founds by slug on SSR context load ([eeb3232](https://github.com/ecomplus/cloud-commerce/commit/eeb3232fb79f6440234a257b915f9c9d2de0e7b4))
* **storefront:** Update Astro to v2.10.9 ([3555906](https://github.com/ecomplus/cloud-commerce/commit/35559061843a1c8ba7618c255080289677640b10))


* **ssr:** Expecting fallback static HTML at /~fallback route ([922c9c9](https://github.com/ecomplus/cloud-commerce/commit/922c9c9ddeda661861cf1c80204ebd9adf0bf47e))
* **storefront:** Set href optional on <ALink> to handle common optional link case ([1573c65](https://github.com/ecomplus/cloud-commerce/commit/1573c653126975b3fac1e3291fa01976e98a8052))
* **storefront:** Update `usePageHeader` composable removing `serviceLinks` prop ([e566038](https://github.com/ecomplus/cloud-commerce/commit/e56603848af4013eb29b7604d0fb936238e85d7c))

### [0.23.3](https://github.com/ecomplus/cloud-commerce/compare/v0.23.2...v0.23.3) (2023-08-08)


### Bug Fixes

* **ssr:** Fix CSS filepath at Link header (early hints) ([2761642](https://github.com/ecomplus/cloud-commerce/commit/2761642d4cf0f4b5dab983c5fa0434e5ee4af5a7))

### [0.23.2](https://github.com/ecomplus/cloud-commerce/compare/v0.23.1...v0.23.2) (2023-08-08)


### Features

* **ssr:** Add new `X-Style-Link` header for custom CDN layer early hints ([390d54a](https://github.com/ecomplus/cloud-commerce/commit/390d54aed024838fb36633d5c2a4429b4633b6f6))


### Bug Fixes

* **ssr:** Prevent erro with undefined `cacheControl` on SWR worker ([b926936](https://github.com/ecomplus/cloud-commerce/commit/b926936908a9628a62d13603660d8a87fc7e8ddf))

### [0.23.1](https://github.com/ecomplus/cloud-commerce/compare/v0.23.0...v0.23.1) (2023-08-08)


### Features

* **i18n:** Add `i19minus` and `i19plus` words ([e77b6e8](https://github.com/ecomplus/cloud-commerce/commit/e77b6e83b24947e13c16f3ef491a36d3791511db))
* **ssr:** New script for Cloudflare Worker as SWR and cache key layer [[#135](https://github.com/ecomplus/cloud-commerce/issues/135)] ([b296ac3](https://github.com/ecomplus/cloud-commerce/commit/b296ac35ccc19cf23ba48d56ace0b73c055ce311))
* **storefront:** New `.i-threads` brand icon shortcut ([5b1ab0a](https://github.com/ecomplus/cloud-commerce/commit/5b1ab0ad30a86f5c87c4b76698f67d6ab39636b3))
* **storefront:** New atomi headless <NumberInput> Vue component ([45093e2](https://github.com/ecomplus/cloud-commerce/commit/45093e244acb56fcfd16e2962fd556c942550c56))
* **storefront:** New basic <CheckoutLink> wrapper component ([2d5c1b7](https://github.com/ecomplus/cloud-commerce/commit/2d5c1b7ed6bb2c9a8b4d6b67590370c5e4c5ccdc))
* **storefront:** Update Astro to 2.10 ([#208](https://github.com/ecomplus/cloud-commerce/issues/208)) ([5cbdebb](https://github.com/ecomplus/cloud-commerce/commit/5cbdebba4eda157199d6f7e2c84f55f32520e3d6))


### Bug Fixes

* **api:** Updating Carts and Orders interfaces ([31bf050](https://github.com/ecomplus/cloud-commerce/commit/31bf05021d51c08c215b8eb60998fbedbfd61519))
* **deps:** Update non-major dependencies ([#209](https://github.com/ecomplus/cloud-commerce/issues/209)) ([9a1d02a](https://github.com/ecomplus/cloud-commerce/commit/9a1d02a0c8adc8d3f86957454e0f1317844cfe28))
* **ssr:** Recommended Cloudflare SWR worker must bypass some dynamic pathnames ([3b8a029](https://github.com/ecomplus/cloud-commerce/commit/3b8a029b9a7e706712414b9993e35b72239f6ac4))
* **ssr:** Recommended Cloudflare SWR worker should bypass API/feeds dynamic pathnames ([982cc1b](https://github.com/ecomplus/cloud-commerce/commit/982cc1b6e2885560223c90eca2096aa9478f04ba))
* **storefront:** Add `link` to `useCartItem` return ([626b8fe](https://github.com/ecomplus/cloud-commerce/commit/626b8fe206eacb4bdb34094eb33c99615d60f7f7))
* **storefront:** Fix cart item composable computed `title` ([e7915f9](https://github.com/ecomplus/cloud-commerce/commit/e7915f9af113ce20c7eb5b51bf72d7bcdeec8028))
* **storefront:** Fix shopping cart `parseProduct` to create strict cart item object ([407360f](https://github.com/ecomplus/cloud-commerce/commit/407360f960f2e27475d5f53b1cc771e33273f35b))
* **storefront:** Update `useCartItem` using computed to keep reactive object of shopping cart state ([f4aea98](https://github.com/ecomplus/cloud-commerce/commit/f4aea987f0ae4ab396508d3af2485fe7574abd0b))
* **storefront:** Update Astro to v2.10.2 ([258072e](https://github.com/ecomplus/cloud-commerce/commit/258072eb1f7caab534df6db336a82f8eaac93f21))

## [0.23.0](https://github.com/ecomplus/cloud-commerce/compare/v0.22.4...v0.23.0) (2023-08-02)


### ⚠ BREAKING CHANGES

* **storefront:** Rootlib `server-data` and `browser-env` files removed in favor of named exports on `/sf-lib` with additional utils

### Features

* **storefront:** Add new `useCartItem` composable ([d9da575](https://github.com/ecomplus/cloud-commerce/commit/d9da57555cace183dea11588f8946df2083d9504))
* **storefront:** New utils `useId` and `requestIdleCallback` from `/sf-lib` ([c53d33b](https://github.com/ecomplus/cloud-commerce/commit/c53d33b72a78beb68644b765c2e1f9023bfcc373))


### Bug Fixes

* **cli:** Fix checking SSR `node_modules` dir before reinstall on dev ([aad3bf4](https://github.com/ecomplus/cloud-commerce/commit/aad3bf40dab5b61774e0ce09aa48fca43737ce80))
* **storefront:** Ensure config is set up even without content/settings ([dad8532](https://github.com/ecomplus/cloud-commerce/commit/dad853268a33e213139c0fedb7914e77b1c3de22))

### [0.22.4](https://github.com/ecomplus/cloud-commerce/compare/v0.22.3...v0.22.4) (2023-08-01)


### Bug Fixes

* **deps:** Update non-major dependencies ([#201](https://github.com/ecomplus/cloud-commerce/issues/201)) ([0dc474b](https://github.com/ecomplus/cloud-commerce/commit/0dc474bae93f18be8498a94f189db465cadccbca))
* **storefront:** Update Astro to v2.9.6 ([#200](https://github.com/ecomplus/cloud-commerce/issues/200)) ([dd42847](https://github.com/ecomplus/cloud-commerce/commit/dd42847fe3f9d5990bf9a6c25f8366c4c43eee96))

### [0.22.3](https://github.com/ecomplus/cloud-commerce/compare/v0.22.2...v0.22.3) (2023-07-26)


### Features

* **storefront:** New `useSharedData` composable to make easier setting data before components SSR ([60cdcf0](https://github.com/ecomplus/cloud-commerce/commit/60cdcf0b3315366c39ef5b481eac53dcfea8bff1))


### Bug Fixes

* **storefront:** Update `useShopHeader` to ensure global data is used on function runtime ([abaaad0](https://github.com/ecomplus/cloud-commerce/commit/abaaad0961924995bbb556074f8778e55c34f7b8))

### [0.22.2](https://github.com/ecomplus/cloud-commerce/compare/v0.22.1...v0.22.2) (2023-07-26)


### Features

* **storefront:** Add `listedCategoryFields` option to `usePageHeader` ([75414a2](https://github.com/ecomplus/cloud-commerce/commit/75414a29921b7a1a45bb6bdd362e27e57cea4b32))
* **storefront:** New <SharedData> Astro component and global `$storefront.data` ([900abec](https://github.com/ecomplus/cloud-commerce/commit/900abecba3c47c287d9d75d227ad4097dc6da6c7))


### Bug Fixes

* **storefront:** Properly handling min installment value on `usePrices` ([92608c2](https://github.com/ecomplus/cloud-commerce/commit/92608c2a8f7cf022715ab97487b8662a5d5fc58e))

### [0.22.1](https://github.com/ecomplus/cloud-commerce/compare/v0.22.0...v0.22.1) (2023-07-24)


### Features

* **cli:** Check node_modules and install SSR dependencies on dev command if needed ([b60e94b](https://github.com/ecomplus/cloud-commerce/commit/b60e94b0315bf041392e2c322133d0cf77bd0d19))


### Bug Fixes

* **cli:** Create `functions/.env` with Store ID from config.json on first dev command ([17bf92b](https://github.com/ecomplus/cloud-commerce/commit/17bf92b67bfd29de57a2b1c0950c073b192370ca))
* **deps:** Update non-major dependencies ([#197](https://github.com/ecomplus/cloud-commerce/issues/197)) ([15715b1](https://github.com/ecomplus/cloud-commerce/commit/15715b1b587db364de627a35aafce4b34bb1c2ee))
* **fb-conversions:** Update dependency facebook-nodejs-business-sdk to v17 ([#199](https://github.com/ecomplus/cloud-commerce/issues/199)) ([5cac54e](https://github.com/ecomplus/cloud-commerce/commit/5cac54ee19b33d8f6b1e0ca9a6bab80decd99af6))
* **storefront:** Update dependency astro to v2.9.2 ([#196](https://github.com/ecomplus/cloud-commerce/issues/196)) ([7383674](https://github.com/ecomplus/cloud-commerce/commit/7383674c5980239d81bfa031066c09e948dc23d8))

## [0.22.0](https://github.com/ecomplus/cloud-commerce/compare/v0.21.0...v0.22.0) (2023-07-21)


### ⚠ BREAKING CHANGES

* **storefront:** `composables/use-hero-slider` removed in favor of `useBanner` only and <Banner> component

### Features

* **i18n:** New time units related words ([eae4800](https://github.com/ecomplus/cloud-commerce/commit/eae4800e2b7da1ee6125b81a822bb18d728ce3ae))
* **storefront:** Update `useSections` with new `handleCustomSection` option ([30ab9ee](https://github.com/ecomplus/cloud-commerce/commit/30ab9ee09143771fe707c70138e052fe5156d562))
* **storefront:** Update Astro to v2.9.0 ([7b23afc](https://github.com/ecomplus/cloud-commerce/commit/7b23afc8ab5cb2fc5626d5339706f2e81279b95b))


### Bug Fixes

* **api:** Fix handling fields typedefs for products search ([2096524](https://github.com/ecomplus/cloud-commerce/commit/2096524264c2674e51fd1c40df0412484927b30e))


* **storefront:** Removing `useHeroSlider` as it is not needed and may intuit incorrect use ([15af280](https://github.com/ecomplus/cloud-commerce/commit/15af2805de648286ac8e22f42f7357ccd1bcbc16))

## [0.21.0](https://github.com/ecomplus/cloud-commerce/compare/v0.20.2...v0.21.0) (2023-07-19)


### ⚠ BREAKING CHANGES

* **storefront:** SSR route context `apiDoc` and `apiResource` replaced by `fetchingApiContext` promise and `apiContext` object
* **storefront:** Base.astro is no more rendering <BaseHead> because it should be rendered async with page body (sections)
* **storefront:** BaseStateJson.astro removed in favor of unique BaseHead.astro

[skip ci]

### Features

* **cli:** Update Firebase Hosting config with new rewrites for git-based CMS API middlewares ([ee178f6](https://github.com/ecomplus/cloud-commerce/commit/ee178f6c96d55029d4c6df5c2218d99e40a896d5))


### Bug Fixes

* **ssr:** Async handle styles manifest read to set early hints ([7a79204](https://github.com/ecomplus/cloud-commerce/commit/7a79204f54b946bc57d59134aed039c4f753ddab))


* **storefront:** Fetch API context doc async by default on route load ([7ac707a](https://github.com/ecomplus/cloud-commerce/commit/7ac707aa671e7f6ac8bbfe54a2b4708a01f3b756))

### [0.20.2](https://github.com/ecomplus/cloud-commerce/compare/v0.20.1...v0.20.2) (2023-07-19)


### Bug Fixes

* **ssr:** Properly read CSS files from new `stylesheets.csv` manifest for early hints ([04a38c4](https://github.com/ecomplus/cloud-commerce/commit/04a38c4f1db3b529b8ff5f16b8dc027f13f05e47))

### [0.20.1](https://github.com/ecomplus/cloud-commerce/compare/v0.20.0...v0.20.1) (2023-07-19)


### Features

* **ssr:** Send 103 early hints when there is only one CSS file (UnoCSS bundle) :zap: ([327d829](https://github.com/ecomplus/cloud-commerce/commit/327d829a91d63b68708f25891a1ecc207612a916))

## [0.20.0](https://github.com/ecomplus/cloud-commerce/compare/v0.19.0...v0.20.0) (2023-07-19)


### ⚠ BREAKING CHANGES

* **storefront:** Moving `layout/main/*` composables to `layout/use-page-main` only
* **storefront:** Banner.astro removed in favor of BannerPictures.astro

### Features

* **storefront:** Handling `banners-grid` type on page sections composable ([edf7bfa](https://github.com/ecomplus/cloud-commerce/commit/edf7bfab881335d5516c81cf300c7e722f232bbf))
* **storefront:** New `useBanner` (atomic) composable ([7091967](https://github.com/ecomplus/cloud-commerce/commit/7091967351bfa45748d48ea6cfb3c6ef572b20a0))


### Bug Fixes

* **storefront:** Ensure page sections order ([a50761d](https://github.com/ecomplus/cloud-commerce/commit/a50761d35c260d442f712a7913bc0c7fc8fb5d62))
* **storefront:** Update BannerPictures.astro with img prop optional ([72ddcf1](https://github.com/ecomplus/cloud-commerce/commit/72ddcf192247f5f807e516be9cf9ed54ac53e87e))


* **storefront:** Renaming <Banner> to <BannerPictures> Astro component ([ae0a76d](https://github.com/ecomplus/cloud-commerce/commit/ae0a76ddd5450bb59218c8d69d9ff8674cb9e72c))

## [0.19.0](https://github.com/ecomplus/cloud-commerce/compare/v0.18.2...v0.19.0) (2023-07-18)


### ⚠ BREAKING CHANGES

* **storefront:** <HeroPicture> Astro component removed in favor of <Banner> generic
* **storefront:** Product card composable not accepting cart item anymore
* **storefront:** Many icon aliases (as `.i-shopping-cart`) removed

### Features

* **storefront:** Add `hasVariations` to product card composable exports ([a9ad361](https://github.com/ecomplus/cloud-commerce/commit/a9ad361b14df31d40aceee3cec54d6cdc1457812))
* **storefront:** New `Banner.astro` component to handle pictures with desktop/mobile variants ([61d8715](https://github.com/ecomplus/cloud-commerce/commit/61d8715cea5af86fd1aad8a03b32cd88c4a92359))


### Bug Fixes

* **deps:** Update non-major dependencies ([#195](https://github.com/ecomplus/cloud-commerce/issues/195)) ([ef7d5cd](https://github.com/ecomplus/cloud-commerce/commit/ef7d5cd7d98c52fd393d3397d736f51b4f6f5b1d))
* **ssr:** Properly set X-SSR-Took before headers sent ([b0916d0](https://github.com/ecomplus/cloud-commerce/commit/b0916d05d62935e895bea443d55d26bc276f31a8))
* **storefront:** Edit `useProductCard` composable to always preset `product._id` ([4490bf8](https://github.com/ecomplus/cloud-commerce/commit/4490bf8f46d9d8e21657f5908aa1254b094f5aac))
* **storefront:** Fix `addProductToCart` state method typings ([50fff5f](https://github.com/ecomplus/cloud-commerce/commit/50fff5f68e267e0a002467bf087e4416aa4295a5))
* **storefront:** Update Astro to v2.8.3 ([#194](https://github.com/ecomplus/cloud-commerce/issues/194)) ([5e276d9](https://github.com/ecomplus/cloud-commerce/commit/5e276d981cb1ad7f47da48b893be8419b69023f7))


* **storefront:** Update theme options setting aliases only for icons used on lib components ([95208d0](https://github.com/ecomplus/cloud-commerce/commit/95208d09fae9e6a038f267279a0f08d589babee7))

### [0.18.2](https://github.com/ecomplus/cloud-commerce/compare/v0.18.1...v0.18.2) (2023-07-14)


### Bug Fixes

* **ssr:** Cache on memory only, sync and never out of date ([9c7f00f](https://github.com/ecomplus/cloud-commerce/commit/9c7f00f67be34a95ea3e793277d979ccce4f0917))
* **storefront:** Edit shoping cart and customer session default storage key ([13c801b](https://github.com/ecomplus/cloud-commerce/commit/13c801b3ede543a734058ae360a2a37acf0f7019))

### [0.18.1](https://github.com/ecomplus/cloud-commerce/compare/v0.18.0...v0.18.1) (2023-07-14)


### Bug Fixes

* **ssr:** Never set X-SSR-Took header on responses from cache ([e744ceb](https://github.com/ecomplus/cloud-commerce/commit/e744ceb4f734ae4f8aa0c2d354a6794fd3c70dae))

## [0.18.0](https://github.com/ecomplus/cloud-commerce/compare/v0.17.0...v0.18.0) (2023-07-14)


### ⚠ BREAKING CHANGES

* **infinitepay:** InfinitePay integration removed

### Features

* **ssr:** Handle reverse proxy on route `/~reverse-proxy?url=*` ([a202cfc](https://github.com/ecomplus/cloud-commerce/commit/a202cfce72b6b98b53b6b96ea8b0277e436a8198))
* **storefront:** Add `totalItems` computed to shopping cart state exports ([4be3fae](https://github.com/ecomplus/cloud-commerce/commit/4be3fae482ff15a504890ce60bc30aa1f315e7f3))
* **storefront:** New `backdropTarget` prop to <Drawer> component ([c890150](https://github.com/ecomplus/cloud-commerce/commit/c890150179ece483e77270a2741a8d51727a9b57))
* **storefront:** New computed exports from modules info state (abstractions) ([fd00fb7](https://github.com/ecomplus/cloud-commerce/commit/fd00fb711600e5086523d7ef5668f287123130ba))


### Bug Fixes

* **ssr:** Prevent headers already sent warn with writeHead + send methods (on cached response) ([ab0ff25](https://github.com/ecomplus/cloud-commerce/commit/ab0ff2585e1f09e73d713508e9011b9233959098))
* **storefront:** Fix <Drawer> position with placement end ([a756c92](https://github.com/ecomplus/cloud-commerce/commit/a756c928edb2859477ea78414119a8eb67184303))
* **storefront:** Increase teleport containers z-index (custom) ([2a9b85d](https://github.com/ecomplus/cloud-commerce/commit/2a9b85dda36b6bff9087e6dc2cdb925e77153158))
* **storefront:** New optional `alt` prop to AImg global component ([ecf4205](https://github.com/ecomplus/cloud-commerce/commit/ecf420558ac7c88747b79f0253ddfe0d3dbb89ad))


### revert

* **infinitepay:** Removing InfinitePay app and package ([3d1f790](https://github.com/ecomplus/cloud-commerce/commit/3d1f79096214d300086c40ad696e81d3145d604f))

## [0.17.0](https://github.com/ecomplus/cloud-commerce/compare/v0.16.4...v0.17.0) (2023-07-11)


### ⚠ BREAKING CHANGES

* **storefront:** Route context `apiState.categories` is now undefined by default

### Bug Fixes

* **ssr:** Properly debugging time on X-Cache-Key-Took header ([992cf5d](https://github.com/ecomplus/cloud-commerce/commit/992cf5dbe4687945c67f82d421c5e92cabd239dc))


* **storefront:** No API endpoints to prefetch by default (current route slug only) ([4b20ace](https://github.com/ecomplus/cloud-commerce/commit/4b20ace9c828cf674f152803a62c56d2cba66724))

### [0.16.4](https://github.com/ecomplus/cloud-commerce/compare/v0.16.3...v0.16.4) (2023-07-11)


### Bug Fixes

* **ssr:** Ensure valid Firestore doc path for home SSR cache ([2ae2b4e](https://github.com/ecomplus/cloud-commerce/commit/2ae2b4e5f89a3713bbb318311ce04ffa887740c4))

### [0.16.3](https://github.com/ecomplus/cloud-commerce/compare/v0.16.2...v0.16.3) (2023-07-11)


### Features

* **ssr:** Handle new optional `SSR_CACHE_MAXAGE` and `SSR_CACHE_SWR` (bool) env vars ([f92155a](https://github.com/ecomplus/cloud-commerce/commit/f92155a9374ff9fa1337969c2097f4ebda93cb0f))


### Bug Fixes

* **ssr:** Properly write response body even with headers sent ([b4cd667](https://github.com/ecomplus/cloud-commerce/commit/b4cd667fd500bbfd72946423f3f316f3236a86ec))

### [0.16.2](https://github.com/ecomplus/cloud-commerce/compare/v0.16.1...v0.16.2) (2023-07-11)


### Bug Fixes

* **ssr:** Use `writeHead` middleware to set X-SSR-Took header ([cdee5c5](https://github.com/ecomplus/cloud-commerce/commit/cdee5c54680ca5f28d48a286f407946781eebc14))

### [0.16.1](https://github.com/ecomplus/cloud-commerce/compare/v0.16.0...v0.16.1) (2023-07-11)


### Features

* **ssr:** Debug SSR time on new X-SSR-Took response header ([ed333c9](https://github.com/ecomplus/cloud-commerce/commit/ed333c9fba55164b55b32511142859adb1b9923e))
* **storefront:** Update <Carousel> to support multi-slides per page ([1d07555](https://github.com/ecomplus/cloud-commerce/commit/1d075551c3e4f270ee6896c5fa0b47e916d3b204))


### Bug Fixes

* **deps:** Update non-major dependencies ([#192](https://github.com/ecomplus/cloud-commerce/issues/192)) ([5bc9102](https://github.com/ecomplus/cloud-commerce/commit/5bc9102debf14e4c32bc9228704ff40138f7558b))
* **storefront:** Update dependency astro to v2.8.0 ([#193](https://github.com/ecomplus/cloud-commerce/issues/193)) ([058acbc](https://github.com/ecomplus/cloud-commerce/commit/058acbc9ee6b17ad880b8aa7cf1c9dee8975cfe6))

## [0.16.0](https://github.com/ecomplus/cloud-commerce/compare/v0.15.1...v0.16.0) (2023-07-07)


### ⚠ BREAKING CHANGES

* New Firebase project needed with different region, or regions must be explicitly set

### Bug Fixes

* **firebase:** Set SSR function region with `SSR_DEPLOY_REGION || DEPLOY_REGION` ([a983828](https://github.com/ecomplus/cloud-commerce/commit/a9838285636c9b5304e4595974807cceabe7d8d7)), closes [#164](https://github.com/ecomplus/cloud-commerce/issues/164)


* Moving deploy to us-east4 GCP region, all resources on same region [[#164](https://github.com/ecomplus/cloud-commerce/issues/164)] ([64d9a21](https://github.com/ecomplus/cloud-commerce/commit/64d9a21791801050739eebe9c8339eaac5db45e0))

### [0.15.1](https://github.com/ecomplus/cloud-commerce/compare/v0.15.0...v0.15.1) (2023-07-07)


### Bug Fixes

* **emails:** Fix importing `firebase-functions/logger` ([44eb940](https://github.com/ecomplus/cloud-commerce/commit/44eb9408d7ec0b0820e7e2081b072ee69d537dea))
* **types:** Fix Carts interface customers typedef (Resource ID) ([6405bb3](https://github.com/ecomplus/cloud-commerce/commit/6405bb36aa100505c22f0461a02068161bcf9f59))

## [0.15.0](https://github.com/ecomplus/cloud-commerce/compare/v0.14.1...v0.15.0) (2023-07-07)


### ⚠ BREAKING CHANGES

* **storefront:** `useHeroSection` renamed (moved) to `usePageHero`, `useSections` renamed to `usePageSections`
* **storefront:** `useHomeMain` removed as it may not be used at all, `Sections.astro` file should import `useSections` directly
* **storefront:** `import 'uno.css';` must be mannualy imported now for every page
* **storefront:** New config/storefront.{tailwind|unocss}.cjs files in place of root ones to prevent duplicated (more or less complex) config generations
* **storefront:** Old (bad named) `preflight.css` file removed

May look to https://unocss.dev/guide/style-reset\#tailwind-compat in a future
* **storefront:** Removing no more needed `routeContext` prop on many nested Astro components, getting from `Astro.locals` instead
* **storefront:** Renamed exports `loadPageContext` and type `PageConext` to `loadRouteContext` and `RouteContext` instead
* **storefront:** Expecing content/pages/home.json instead of content/home.json , `HomeContent` removed from contend.d.ts exports

### Features

* **affilate-program:** Setup app to handle simple affiliate program  ([#167](https://github.com/ecomplus/cloud-commerce/issues/167)) ([7a29529](https://github.com/ecomplus/cloud-commerce/commit/7a29529f326f3e04646d29e9e6a8b3d54e1a170d))
* **api:** Add `SearchItems` and `SearchResult` types ([4326f7c](https://github.com/ecomplus/cloud-commerce/commit/4326f7c0ff0ccfa23937336c623bf48d4859946b))
* **api:** Add optional `config.fields` option ([af47797](https://github.com/ecomplus/cloud-commerce/commit/af47797d9f45f2741244b85cd0bb4a1e8f7826f0))
* **api:** Add optional config common params for list ([97c4e17](https://github.com/ecomplus/cloud-commerce/commit/97c4e179c1501e1a30053bc26ea19f42f0d263f2))
* **api:** Add optional global `$apiMergeConfig` for all in-context requests (may be overwritten) ([ef88575](https://github.com/ecomplus/cloud-commerce/commit/ef88575b3028ad86ca7b0a14971e10e3c14b880d))
* **apps:** Many optional env vars for apps credentials ([#179](https://github.com/ecomplus/cloud-commerce/issues/179)) ([881530a](https://github.com/ecomplus/cloud-commerce/commit/881530ae2383bd9ff37d794525f133cdd88d455c))
* **discounts:** Updating with original app v1.15.1 ([29f97ab](https://github.com/ecomplus/cloud-commerce/commit/29f97ab8aea801422ab2b4afea87aaad44e0b63f))
* **firebase:** Update config object with new `metafields: Record<string, any>` ([636e7e8](https://github.com/ecomplus/cloud-commerce/commit/636e7e82c82175042c7819f40828f92cb5dc1d19)), closes [#discussion_r1221705606](https://github.com/ecomplus/cloud-commerce/issues/discussion_r1221705606)
* **flash-courier:** Add app to integrate Flash Courier ([#166](https://github.com/ecomplus/cloud-commerce/issues/166)) ([a157a1c](https://github.com/ecomplus/cloud-commerce/commit/a157a1c5d38e5f77caeee33f4054d33faa76462a))
* **modules:** Updating schemas with https://github.com/ecomplus/modules-api/releases/tag/v0.12.58 ([e2a803d](https://github.com/ecomplus/cloud-commerce/commit/e2a803d9be83ddd91ff61b137f4c6fe18f7461af))
* **storefront:** Additional computed within `useProductCard` ([9f20334](https://github.com/ecomplus/cloud-commerce/commit/9f203344423bc011921bd13c79b3470790d1c30c))
* **storefront:** Additional computed within `useProductCard` ([bf19fa3](https://github.com/ecomplus/cloud-commerce/commit/bf19fa33730eb18be95d56d54424a8ceb521938c))
* **storefront:** Consistent named exports for all Vue composables ([603e8ec](https://github.com/ecomplus/cloud-commerce/commit/603e8ecbbc8969da268e539a333343721952451f))
* **storefront:** New `useSections` layout Astro composable ([ae709cd](https://github.com/ecomplus/cloud-commerce/commit/ae709cda9920a3ca008c292ac57f659163eb5190))
* **storefront:** Set `Astro.locals.routeContext` globally available on Astro components ([79b1111](https://github.com/ecomplus/cloud-commerce/commit/79b1111330d0464c9d8eeeb19b03a9ec2fccf43c))
* **storefront:** Setup `useProductCard` with fetch if product undefined and minor title i18n parse ([20d8f78](https://github.com/ecomplus/cloud-commerce/commit/20d8f78119158faf3cb4a5b6a8cdacb8acc5b6ea))
* **storefront:** Setup new `useProductShelf` Vue composable ([507e968](https://github.com/ecomplus/cloud-commerce/commit/507e968dd86e61996e412efd0e4c26f897d3b7a3))
* **storefront:** Update Astro to v2.6.0 ([35b7ac1](https://github.com/ecomplus/cloud-commerce/commit/35b7ac1fa2cd9d5b0c42e2f43562061b531beec7))


### Bug Fixes

* **affiliate-program:** Fix handling orders/customers events ([#173](https://github.com/ecomplus/cloud-commerce/issues/173)) ([07ffc61](https://github.com/ecomplus/cloud-commerce/commit/07ffc61fd13754c117c598f721448a5ebb1ec43b))
* **api:** Fix `SearchItems` pictures to match partial `Products` picture ([abb0fd9](https://github.com/ecomplus/cloud-commerce/commit/abb0fd918346d757c2228f5af693a6cd6847491e))
* **api:** Fix `SearchItems` pictures type def ([c98edf6](https://github.com/ecomplus/cloud-commerce/commit/c98edf62a5f6b26a0ca574fa05780c44ea01dc42))
* **api:** Update `Endpoint` type def to accept doc find by field ([5ca53e7](https://github.com/ecomplus/cloud-commerce/commit/5ca53e7ec316e3bb4d400d8cf2302deecb42745b))
* **api:** Update `SearchItems` type with `item._score` number ([97b517e](https://github.com/ecomplus/cloud-commerce/commit/97b517e8aff75efa37483bffd8c183e11468ffde))
* **config:** Stop using `import.meta.env` for global config ([4100f74](https://github.com/ecomplus/cloud-commerce/commit/4100f745416860fb2ea16101749f1063955b9e33))
* **deps:** Update `@ecomplus/utils` to v1.5.0-rc.4 ([754f3ea](https://github.com/ecomplus/cloud-commerce/commit/754f3ea10ede64370cc0fce9b6fbd83047b4f8e0))
* **deps:** Update `@ecomplus/utils` to v1.5.0-rc.5 ([8794ca6](https://github.com/ecomplus/cloud-commerce/commit/8794ca65e51b8417a439bc01ab09c64398622fbb))
* **deps:** Update Astro to v2.5.5 ([3b6037c](https://github.com/ecomplus/cloud-commerce/commit/3b6037ca41df1cbb7cd28dc9548e005ce2466a65)), closes [#issuecomment-1568864726](https://github.com/ecomplus/cloud-commerce/issues/issuecomment-1568864726)
* **deps:** Update Astro to v2.5.6 with `@astrojs/vue` v2.2.1 ([38c906e](https://github.com/ecomplus/cloud-commerce/commit/38c906eaa93077d736bff733a289fd7f7afc4615))
* **deps:** Update dependency astro to v2.5.7 ([#169](https://github.com/ecomplus/cloud-commerce/issues/169)) ([b381ebe](https://github.com/ecomplus/cloud-commerce/commit/b381ebe9efbef136f50223dccc2d57a62b67855e))
* **deps:** Update non-major dependencies ([#162](https://github.com/ecomplus/cloud-commerce/issues/162)) ([76952eb](https://github.com/ecomplus/cloud-commerce/commit/76952eb62884cd11158827eb7269f141556ea998))
* **deps:** Update non-major dependencies ([#163](https://github.com/ecomplus/cloud-commerce/issues/163)) ([d2ec64f](https://github.com/ecomplus/cloud-commerce/commit/d2ec64f33a35a4722d6f608343e566555ddfbad2))
* **deps:** Update non-major dependencies ([#168](https://github.com/ecomplus/cloud-commerce/issues/168)) ([7363e85](https://github.com/ecomplus/cloud-commerce/commit/7363e8511fb62b7b601df67efe7363b8f8bb4ef4))
* **deps:** Update non-major dependencies ([#171](https://github.com/ecomplus/cloud-commerce/issues/171)) ([79c5240](https://github.com/ecomplus/cloud-commerce/commit/79c52409f142dac2f5901da502ae9e55b9e4447d))
* **deps:** Update non-major dependencies ([#176](https://github.com/ecomplus/cloud-commerce/issues/176)) ([495f0fa](https://github.com/ecomplus/cloud-commerce/commit/495f0fa77a934e42e74f99217686feb3f9587245))
* **flash-courier:** Fix functions namespace and package exports filename ([11628d6](https://github.com/ecomplus/cloud-commerce/commit/11628d66dfac67a970e75774dd8eb8249a185c7b))
* **flash-courier:** Update app event function ([#174](https://github.com/ecomplus/cloud-commerce/issues/174)) ([74e5120](https://github.com/ecomplus/cloud-commerce/commit/74e5120a6bb2fa74e1d3aedbb6598a02685e72cd))
* **flash-courier:** Updating tracking status parses ([d7914ce](https://github.com/ecomplus/cloud-commerce/commit/d7914ce3d82d0425f73035dd24968660751b0e66))
* **flash-courier:** Updating with legacy v1.3.0 ([b4bffd3](https://github.com/ecomplus/cloud-commerce/commit/b4bffd361e6c9d36bb4a4b685a28e8be365f653b))
* Many apps type def fixes ([#177](https://github.com/ecomplus/cloud-commerce/issues/177)) [skip ci] ([9194b1e](https://github.com/ecomplus/cloud-commerce/commit/9194b1e577c377eda8d28e2eff29edf367a755ea))
* **mercadopago:** Fix path for oload expression script on list payments ([#180](https://github.com/ecomplus/cloud-commerce/issues/180)) ([ebd6d5d](https://github.com/ecomplus/cloud-commerce/commit/ebd6d5d62aacd34b86de0e1e97b204018ec3bebf))
* **modules:** Type fixes with nested IDs and minor syntax updates ([06fb211](https://github.com/ecomplus/cloud-commerce/commit/06fb211c01ad67628f0d5665416e094ad31cec4c))
* **pagarme:** Update with legacy v1.5.0 ([df2e61d](https://github.com/ecomplus/cloud-commerce/commit/df2e61de9157805d1e5be8eae5a03f91e903afa5))
* Replacing wrong (out of date) imports from `@cloudcommerce/api/lib/types` ([7e6971c](https://github.com/ecomplus/cloud-commerce/commit/7e6971c5c46a2e14480d37123fc30d663ebe5b76))
* **storefront:** Caching only root CMS content (not collections) ([ef77ae8](https://github.com/ecomplus/cloud-commerce/commit/ef77ae860f86831828535bcd806f2faab80fe5c3))
* **storefront:** Fix `useProductCard` composable returned type ([c07a525](https://github.com/ecomplus/cloud-commerce/commit/c07a52555d5ebdce54f5ba29eb2159a5243efe50))
* **storefront:** Fix global <AImg> prop `picture` typedef ([39ac9e5](https://github.com/ecomplus/cloud-commerce/commit/39ac9e51d309a7b7ffc16f0a59c737c6412878e7))
* **storefront:** Properly handling product shelf options ([650fc6e](https://github.com/ecomplus/cloud-commerce/commit/650fc6e0179330d3cc0e4a19ddf1d7e63f0a8c91))
* **storefront:** Removing `uno.css` import to be imported after custom UI classes ([b66f847](https://github.com/ecomplus/cloud-commerce/commit/b66f8479ad4511a5f5f3d535a728ac866a489092))
* **storefront:** Strict `routeContext.cmsContent` type with page content object ([aaa7355](https://github.com/ecomplus/cloud-commerce/commit/aaa73557bde2757b56993bc71af9633804d62fff))
* **storefront:** Update `useProductShelf` for easier use on Astro (SSR) composables ([e6e562b](https://github.com/ecomplus/cloud-commerce/commit/e6e562b9aaeb52ab5397cd2474c0732631f40957))
* **storefront:** Update astro ([#189](https://github.com/ecomplus/cloud-commerce/issues/189)) ([4634f88](https://github.com/ecomplus/cloud-commerce/commit/4634f8833343ed85d8850c238763d681bde65a15))
* **storefront:** Update astro to v2.7.0 ([#182](https://github.com/ecomplus/cloud-commerce/issues/182)) ([6588688](https://github.com/ecomplus/cloud-commerce/commit/65886887ad3c9fd1e6c41281618b08c048a39165))
* **storefront:** Update dependency astro to v2.6.3 ([#170](https://github.com/ecomplus/cloud-commerce/issues/170)) ([ce8379d](https://github.com/ecomplus/cloud-commerce/commit/ce8379dd30d4699660331652a18b7d2aa31c3a82))
* **storefront:** Update global `<ALink>` to keep same window on relative href ([ca15480](https://github.com/ecomplus/cloud-commerce/commit/ca154806666d747b5eef33f6ae521be0ccc8e75d))
* **tiny-erp:** Type fixes with nested resource IDs and resource find ([165400c](https://github.com/ecomplus/cloud-commerce/commit/165400cdf2d8e314c3b71addfd3b8eec293de228))
* **types:** Fix Carts interface items nested IDs [skip ci] ([c7c1fa2](https://github.com/ecomplus/cloud-commerce/commit/c7c1fa230f10d7c5936e46ee36590aa356aefd89))
* **types:** Properly defining nested Object IDs on many resources interfaces ([8a20504](https://github.com/ecomplus/cloud-commerce/commit/8a20504082f33d31645a8eabb0ab3d681c1ae401))
* **types:** Update CMS settings metafields accept any value ([2fd0597](https://github.com/ecomplus/cloud-commerce/commit/2fd0597d00b4e5149c7b650b0c2e069ff4d22f28))


### build

* **storefront:** Read custom `.ui-*` classes from src/assets/style.css for Tailwind IntelliSense ([244a9e7](https://github.com/ecomplus/cloud-commerce/commit/244a9e7023c4643ddb766ff7a6ef4f58baa248bb))


* **storefront:** Renaming (SSR) `pageContext` to `routeContext` ([ceffb44](https://github.com/ecomplus/cloud-commerce/commit/ceffb44fd4e43fbdf51fa790019aa4fef4ad4e2a))
* **storefront:** Renaming `assets/preflight.css` to `assets/reset.css` ([cd01bd9](https://github.com/ecomplus/cloud-commerce/commit/cd01bd93b662f196ffeecb905fc1dd485a387e00))
* **storefront:** Renaming Astro sections composables ([5cf529c](https://github.com/ecomplus/cloud-commerce/commit/5cf529c2284ebace2e13670ba4dfb38dee79db4b))
* **storefront:** Using generic `PageContent` typedef instead of previous `HomeContent` ([4f566c9](https://github.com/ecomplus/cloud-commerce/commit/4f566c9fabe39ce7e32cf3bb4d315182da1d08e7))

### [0.14.1](https://github.com/ecomplus/cloud-commerce/compare/v0.14.0...v0.14.1) (2023-05-17)


### Bug Fixes

* **feeds:** Use default functions (non-SSR) region to deploy ([ca2d141](https://github.com/ecomplus/cloud-commerce/commit/ca2d14187abcf9e8425060e3986d1df4ab67901b))

## [0.14.0](https://github.com/ecomplus/cloud-commerce/compare/v0.12.1...v0.14.0) (2023-05-17)


### ⚠ BREAKING CHANGES

* **firebase:** Must add `import '@cloudcommerce/firebase/lib/init';` on all codebases except ssr

### Bug Fixes

* **firebase:** Do not run app init on all functions sources excepting SSR ([010e722](https://github.com/ecomplus/cloud-commerce/commit/010e7227e12951709f1b0a8c30766957c0e36aa0))

### [0.12.1](https://github.com/ecomplus/cloud-commerce/compare/v0.12.0...v0.12.1) (2023-05-16)

## [0.12.0](https://github.com/ecomplus/cloud-commerce/compare/v0.11.0...v0.12.0) (2023-05-16)


### ⚠ BREAKING CHANGES

* **types:** Many global vars renamed, especially `$renderStorefront` required for SSR
* **api:** No more `/fetch-polyfill` export

### Features

* **api:** Updated `orders` interface with `transactions.account_deposit` optional object ([13ad5c6](https://github.com/ecomplus/cloud-commerce/commit/13ad5c694344568216b096072ea1c3a8fe7af9cd))
* **deps:** Update astro to v2.4.5 ([#158](https://github.com/ecomplus/cloud-commerce/issues/158)) ([f32f936](https://github.com/ecomplus/cloud-commerce/commit/f32f93643fb775449a1749c2c797bb8fad7adbc3))
* **types:** Properly declaring many global vars ([d10923a](https://github.com/ecomplus/cloud-commerce/commit/d10923a2e2d0b00fbc5a9e038950a3e5dadb3ac3))


### Bug Fixes

* **deps:** Update non-major dependencies ([#159](https://github.com/ecomplus/cloud-commerce/issues/159)) ([1dc410a](https://github.com/ecomplus/cloud-commerce/commit/1dc410aa3354ec9cb55fda00b0ac418281ec0d02))


* **api:** Removing not used `fetch-polyfill` ([d701895](https://github.com/ecomplus/cloud-commerce/commit/d701895ef2aa03e5a066a84cdc7ba6dfc84cae9c))

## [0.11.0](https://github.com/ecomplus/cloud-commerce/compare/v0.10.0...v0.11.0) (2023-05-11)


### ⚠ BREAKING CHANGES

* **storefront:** Previously duplicated function `pageContext.cms` removed in favor of `pageContext.getContent` only
* **types:** Export `CmsSettings` no more existing from `@cloudcommerce/types`

### Bug Fixes

* **deps:** Update non-major dependencies ([#152](https://github.com/ecomplus/cloud-commerce/issues/152)) ([9e27ab8](https://github.com/ecomplus/cloud-commerce/commit/9e27ab8855b457b2ae7efa5c7e923d50fe17f207))
* **discounts:** Do not count cancelled order on count for max usages ([c668701](https://github.com/ecomplus/cloud-commerce/commit/c668701b327cd31981dbb4ddd3a38e7e3502d560))
* **storefront:** Explicit ignore /admin/ folder on Workbox precache ([1eae550](https://github.com/ecomplus/cloud-commerce/commit/1eae55035e968158da15b683a733e141f8b40547))
* **storefront:** Fix `SettingsContent` metafields typedef [[#149](https://github.com/ecomplus/cloud-commerce/issues/149)] ([5d6ea94](https://github.com/ecomplus/cloud-commerce/commit/5d6ea94957f0b9a44acc4925f9c356e91e15ebd6))
* **storefront:** Update Astro to v2.3.3 ([#153](https://github.com/ecomplus/cloud-commerce/issues/153)) ([0e6523d](https://github.com/ecomplus/cloud-commerce/commit/0e6523d10f7f2b86753bd3e1b4927d5947ded552))


* **storefront:** Renaming "CMS" things to "content" ([a48653d](https://github.com/ecomplus/cloud-commerce/commit/a48653d0281123531ee2d4146046ecae81abb89f))
* **types:** Renaming `CmsSettings` to `SettingsContent` ([3fe4f7a](https://github.com/ecomplus/cloud-commerce/commit/3fe4f7a0a1e3e3b082e7942ae26bf5c993077094))

## [0.10.0](https://github.com/ecomplus/cloud-commerce/compare/v0.9.1...v0.10.0) (2023-04-28)


### ⚠ BREAKING CHANGES

* Many functions moved to v1 on https://github.com/ecomplus/cloud-commerce/commit/95287ac527ac9e9c86095a00a5c895a487d77265

### Features

* **storefront:** Foundation for Tina CMS ([#136](https://github.com/ecomplus/cloud-commerce/issues/136)) ([3774453](https://github.com/ecomplus/cloud-commerce/commit/3774453201b2e0b931ea8a2187677f7f5a5ad91e))


### Bug Fixes

* **cli:** Colored subprocess outputs ([e619e9f](https://github.com/ecomplus/cloud-commerce/commit/e619e9f55c141d67ab8d424f6d3e90982eee7db6))
* **storefront:** Edit config to prevent breaks on dev env without Store ID ([e3cb69c](https://github.com/ecomplus/cloud-commerce/commit/e3cb69cf7045d5d3cd7bf6d2e7eb0d5f2b41db00))


* Changelog ([8bd8f9f](https://github.com/ecomplus/cloud-commerce/commit/8bd8f9f45be009ca29a59d2245837b0bed706491))

### [0.9.1](https://github.com/ecomplus/cloud-commerce/compare/v0.9.0...v0.9.1) (2023-04-19)


### Bug Fixes

* **cli:** Faster `dev` without precedent build ([d39b680](https://github.com/ecomplus/cloud-commerce/commit/d39b6802c7d6391ff77dd7fd3a3f2f42f3e5d03e))
* **config:** Prevent breaks on dev env without Store ID ([b8357b3](https://github.com/ecomplus/cloud-commerce/commit/b8357b3cad494172a5836411c8661014e26f099e))
* **deps:** Update all non-major dependencies ([83ab6b3](https://github.com/ecomplus/cloud-commerce/commit/83ab6b3ad579e709f796d0eb155a64049f52bceb))
* **storefront:** Fixing <Carousel> component rewind ([afcd662](https://github.com/ecomplus/cloud-commerce/commit/afcd6625e059fd3f0ee98fc6003349eefdbc0df9))

## [0.9.0](https://github.com/ecomplus/cloud-commerce/compare/v0.8.7...v0.9.0) (2023-04-17)


### ⚠ BREAKING CHANGES

* **storefront:** `tsconfig.json` updated with `astro/tsconfigs/strict`, may have to fix null/undefined checks
* **storefront:** Import `@@sf/components/ProductCard.vue` throws error
* **storefront:** Import `@@sf/layouts/PagesLayout.astro` no more working
* **storefront:** Expecting new `content/layout.json` for layout base and header to work properly

### Features

* **storefront:** Add `getContent` alias to `cms` function on SSR page context ([78b608a](https://github.com/ecomplus/cloud-commerce/commit/78b608a2487c9c1a9ec0f3f35889f0a450a4808e))
* **storefront:** Add tailwind new 950 colors ([124b85b](https://github.com/ecomplus/cloud-commerce/commit/124b85b8d778fa3b69b568364d7be0f3d5b492ee))
* **storefront:** Bump VueUse to v10 ([b5251dd](https://github.com/ecomplus/cloud-commerce/commit/b5251dda1afbc7ac9bb67c19a221f2a8468aa75a))
* **storefront:** New `HeroPicture.astro` component optimize hero images with common abstractions ([296b6a0](https://github.com/ecomplus/cloud-commerce/commit/296b6a0f4ac0954f4d3f3568d205fd9cd5c4263d))
* **storefront:** New `useHeroSlider` composable to abstract hero slider component common handlers ([1a7b7cb](https://github.com/ecomplus/cloud-commerce/commit/1a7b7cbe6aa2775467498b39fe55fd9ff8e698f2))
* **storefront:** New `useHomeMain` and `useHeroSection` layout composables ([f5f7633](https://github.com/ecomplus/cloud-commerce/commit/f5f76334c63c673a35ef8e601d438a07280485c0))
* **storefront:** Update custom <Picture> to also parse `.max-w-screen-*` classes to sizes attr ([78b9234](https://github.com/ecomplus/cloud-commerce/commit/78b92349b41188aaaed649d6d21b2a9caae3e9ba))
* **storefront:** Update Tailwind config adding new 950 tone to brands colors ([0f6ff72](https://github.com/ecomplus/cloud-commerce/commit/0f6ff724278065d6b613ba7ee181db20b19743d1))


### Bug Fixes

* **apps:** Properly using IDs from config to read apps data ([#144](https://github.com/ecomplus/cloud-commerce/issues/144)) ([d047561](https://github.com/ecomplus/cloud-commerce/commit/d0475613c0bc32855326b92ae50fd91eb28a3db8))
* **deps:** Update Astro to v2.2.0 ([97c810d](https://github.com/ecomplus/cloud-commerce/commit/97c810d1d62abb627fa78ac187f6de8f0503910d))
* **deps:** Update Astro to v2.3.0 ([#148](https://github.com/ecomplus/cloud-commerce/issues/148)) ([93d9624](https://github.com/ecomplus/cloud-commerce/commit/93d9624d365b1975ae749601bcead5a929b0f06c))
* **deps:** Update dependency astro to v2.2.1 ([#143](https://github.com/ecomplus/cloud-commerce/issues/143)) ([537f4eb](https://github.com/ecomplus/cloud-commerce/commit/537f4eb160e9287767e4e7a20b1b3ba49e289a49))
* **deps:** Update non-major dependencies ([#140](https://github.com/ecomplus/cloud-commerce/issues/140)) ([b826d54](https://github.com/ecomplus/cloud-commerce/commit/b826d54750181125ae34399023b25bc546c95e08))
* **deps:** Update non-major dependencies ([#142](https://github.com/ecomplus/cloud-commerce/issues/142)) ([6f687a8](https://github.com/ecomplus/cloud-commerce/commit/6f687a8b8a80e0bd6191c3a94d50380658bd8629))
* **galaxpay:** Double check transaction status and handle Galaxpay cancel webhooks ([#145](https://github.com/ecomplus/cloud-commerce/issues/145)) ([4ac1c92](https://github.com/ecomplus/cloud-commerce/commit/4ac1c923f0b34a94badeba268baba8e85673f28c))
* **storefront:** Fix UnoCSS config generating brand colors foregrounds (on-*) ([76e4b9d](https://github.com/ecomplus/cloud-commerce/commit/76e4b9dcc72a85025a1df72aa9fec9c5fe14ec96))
* **storefront:** Fix Vue global <Carousel> to work with Astro slots ([0a0dc70](https://github.com/ecomplus/cloud-commerce/commit/0a0dc7089c1802059ec5454ccc180018c45e216e))
* **storefront:** Fixing default Vue to teleport elements z-index (.z-10) ([ca8629a](https://github.com/ecomplus/cloud-commerce/commit/ca8629ae7c35aaa2d5d13c7cf728897ec5470be3))
* **storefront:** Fixing Vue global custom properties (`$settings` and `$context`) typedef ([e17e3e7](https://github.com/ecomplus/cloud-commerce/commit/e17e3e7e78a59cb8c7d78f5aedfa8db072a3911d))
* **storefront:** General null/undefined fixes using TS strict mode ([f06af89](https://github.com/ecomplus/cloud-commerce/commit/f06af89d6c75396970feba4a071f151697443bfe))
* **storefront:** Properly setting `cmsContent` on home page context ([feb78a4](https://github.com/ecomplus/cloud-commerce/commit/feb78a404a8cf17f770a24a87ee1756c54968082))
* **storefront:** Update Astro to v2.1.9 ([#141](https://github.com/ecomplus/cloud-commerce/issues/141)) ([6d61253](https://github.com/ecomplus/cloud-commerce/commit/6d612536a15f35ddbac87091af95d2b9b889a22d))


* **storefront:** Edit CMS function type to fixed expected filenames ([33ffcc3](https://github.com/ecomplus/cloud-commerce/commit/33ffcc36d113c278a8318c0a7d0a0fe43686d11a))
* **storefront:** Remove `PagesLayout.astro` in favor of `use-page-layout` composable ([7955a6f](https://github.com/ecomplus/cloud-commerce/commit/7955a6fec9d622188e05152a1c507e20c6996af3))
* **storefront:** Removing test-only (yet) `ProductCard` component ([c3181c4](https://github.com/ecomplus/cloud-commerce/commit/c3181c40a9b5fa3594602e9f9978592ba500b1de))

### [0.8.7](https://github.com/ecomplus/cloud-commerce/compare/v0.8.6...v0.8.7) (2023-03-31)


### Bug Fixes

* **storefront:** Ensure alt attr on <Picture> img ([d55c572](https://github.com/ecomplus/cloud-commerce/commit/d55c5724599d4494a4a5fa9859df101b5f2a26ac))

### [0.8.6](https://github.com/ecomplus/cloud-commerce/compare/v0.8.5...v0.8.6) (2023-03-24)


### Bug Fixes

* **storefront:** Keep <Picture> images without version suffix on static build ([61d147f](https://github.com/ecomplus/cloud-commerce/commit/61d147f035f970efe5ef2a4bfe4dff4cf60abf40))
* **storefront:** Using `import.meta.env` in place of `process.env` for not-node env support ([ad5e0cb](https://github.com/ecomplus/cloud-commerce/commit/ad5e0cb1d499ba6a48092f239f51f6d613179408))

### [0.8.5](https://github.com/ecomplus/cloud-commerce/compare/v0.8.4...v0.8.5) (2023-03-23)


### Features

* **storefront:** Make <Picture> `sizes` optional and parse it from `.max-w-[]` classes or `widths` ([cf1eb58](https://github.com/ecomplus/cloud-commerce/commit/cf1eb5825e8074f0099eb8725cb507f9ac90d934))


### Bug Fixes

* **deps:** Update non-major dependencies ([#133](https://github.com/ecomplus/cloud-commerce/issues/133)) ([97d058b](https://github.com/ecomplus/cloud-commerce/commit/97d058b57c017a980ecc8599bd11fc7d8d6d938c))
* **emails:** Bump `@ecomplus/transactional-mails` to v2 ([ad920af](https://github.com/ecomplus/cloud-commerce/commit/ad920afe5ff76310f6ecd7365ca60ad4dcf10809))
* **storefront:** Prefer setting <Picture> sources sizes by max-width media queries ([8e377bb](https://github.com/ecomplus/cloud-commerce/commit/8e377bb6ac438397930a17f8e88e60198c1c03cd))
* **storefront:** Remove `width: auto;` on <Picture> images to fix CLS errors ([4df40be](https://github.com/ecomplus/cloud-commerce/commit/4df40be5e47b897b21988346a07086ca457dec16))

### [0.8.4](https://github.com/ecomplus/cloud-commerce/compare/v0.8.3...v0.8.4) (2023-03-18)


### Features

* **storefront:** Update custom `<Picture>` to support lazy load libs with `hasImg={false}` prop ([be9bbdc](https://github.com/ecomplus/cloud-commerce/commit/be9bbdc46635717b52dd23ab0f5daec11c3a37a8))


### Bug Fixes

* **storefront:** Fix built (fav)icon format to png only ([e02b3cc](https://github.com/ecomplus/cloud-commerce/commit/e02b3cc0e35d7330c4c317e1a7d70e0032844afc))

### [0.8.3](https://github.com/ecomplus/cloud-commerce/compare/v0.8.2...v0.8.3) (2023-03-18)


### Features

* **ssr:** Simple fallback to /_image route reading images manifest ([3fb19b0](https://github.com/ecomplus/cloud-commerce/commit/3fb19b06452082f270e9e3c853e53efe1eaa4b51))
* **storefront:** Add hidden icon (if set) on body with <Picture> to pre-compile [[#129](https://github.com/ecomplus/cloud-commerce/issues/129)] ([a4838f0](https://github.com/ecomplus/cloud-commerce/commit/a4838f00310674a0da747a21e596c57ad5107826))


### Bug Fixes

* **ssr:** Edit /_image route fallback to just return original href if no built image found ([6d38140](https://github.com/ecomplus/cloud-commerce/commit/6d381400648309b39089faa80c5c4a9d32c5b8c2))
* **storefront:** Prevent fatal error with unmatched built image ([b4dc6f8](https://github.com/ecomplus/cloud-commerce/commit/b4dc6f8acf47ac49e310a8b0b4377c236120e238))
* **storefront:** Use `STOREFRONT_BASE_DIR` if set to read images manifest files ([bee44a7](https://github.com/ecomplus/cloud-commerce/commit/bee44a73a1f56a5594458100bd42ff959bb7a462))

### [0.8.2](https://github.com/ecomplus/cloud-commerce/compare/v0.8.1...v0.8.2) (2023-03-17)


### Bug Fixes

* **ssr:** Prevent fatal `ERR_HTTP_HEADERS_SENT` on SSR error ([2e9c137](https://github.com/ecomplus/cloud-commerce/commit/2e9c137cf004c70050222721e3059be83be576c9))

### [0.8.1](https://github.com/ecomplus/cloud-commerce/compare/v0.8.0...v0.8.1) (2023-03-17)

## [0.8.0](https://github.com/ecomplus/cloud-commerce/compare/v0.7.1...v0.8.0) (2023-03-17)


### ⚠ BREAKING CHANGES

* **storefront:** Imported image assets cant be used with `@@sf/components/Picture.astro` anymore

Preparing to https://github.com/ecomplus/cloud-commerce/issues/129

### Features

* **storefront:** New `Picture.runtime.astro` dealing with pre-compiled images :tada: ([c77b910](https://github.com/ecomplus/cloud-commerce/commit/c77b91062d0ef10ac94a355f458b2f150e7d1958))


* **storefront:** Custom <Picture> component should accept string src ("remote") only ([65c9539](https://github.com/ecomplus/cloud-commerce/commit/65c9539bbbccfe32653b56e56c4dc1b1f9c12323))

### [0.7.1](https://github.com/ecomplus/cloud-commerce/compare/v0.7.0...v0.7.1) (2023-03-17)


### Bug Fixes

* **cli:** Edit `firebase.json` to ignore `_astro` dir ([272b8e8](https://github.com/ecomplus/cloud-commerce/commit/272b8e84f6b6ec767f7f5914fd617bd102f8ea39))

## [0.7.0](https://github.com/ecomplus/cloud-commerce/compare/v0.6.13...v0.7.0) (2023-03-17)


### ⚠ BREAKING CHANGES

* **storefront:** Imports  `@@sf/ssr/*` no more working

### Features

* **tiny:** Updating with https://github.com/ecomplus/app-tiny-erp ([259ae68](https://github.com/ecomplus/cloud-commerce/commit/259ae688d23e2094f6d41194aeaa1494aaf39c5b))


### Bug Fixes

* **deps:** Update all non-major dependencies ([#130](https://github.com/ecomplus/cloud-commerce/issues/130)) ([876775e](https://github.com/ecomplus/cloud-commerce/commit/876775e253b14719e8bc73d389c2bb6fa475be9b))
* **deps:** Update all non-major dependencies ([#131](https://github.com/ecomplus/cloud-commerce/issues/131)) ([9b63c62](https://github.com/ecomplus/cloud-commerce/commit/9b63c620e8732905dd501fa574fd5341ac0d6157))
* **storefront:** Moved `@@sf/components/Picture` with fixed vwesioned src ([fb1254b](https://github.com/ecomplus/cloud-commerce/commit/fb1254b96b05c4d9d900bc4ffb067f0de0132042))


* **storefront:** Removing `lib/ssr` dir and `image` module ([a66c1f5](https://github.com/ecomplus/cloud-commerce/commit/a66c1f502a2a1a47a84f8cfe270ec9f0236ac369))

### [0.6.13](https://github.com/ecomplus/cloud-commerce/compare/v0.6.12...v0.6.13) (2023-03-02)

### [0.6.12](https://github.com/ecomplus/cloud-commerce/compare/v0.6.11...v0.6.12) (2023-03-02)

### [0.6.11](https://github.com/ecomplus/cloud-commerce/compare/v0.6.10...v0.6.11) (2023-03-01)


### Bug Fixes

* **cli:** Prevent breaking Firebase deploy on SSR warnings ([91dd0cb](https://github.com/ecomplus/cloud-commerce/commit/91dd0cb3adff8886260a0eb9ba31e077e9bb54ca))
* **ssr:** Fixing `@vueuse/core` dependency semver ([a6351f9](https://github.com/ecomplus/cloud-commerce/commit/a6351f9c376c1eda16ada092595a88ad1e1fe882))

### [0.6.10](https://github.com/ecomplus/cloud-commerce/compare/v0.6.9...v0.6.10) (2023-03-01)

### [0.6.9](https://github.com/ecomplus/cloud-commerce/compare/v0.6.8...v0.6.9) (2023-03-01)

### [0.6.8](https://github.com/ecomplus/cloud-commerce/compare/v0.6.7...v0.6.8) (2023-03-01)


### Features

* **storefront:** Add `$settings` and `$context` to Vue app global properties ([5b0c49d](https://github.com/ecomplus/cloud-commerce/commit/5b0c49dbcbf5733722ef9579537617467c119680))
* **types:** Add optional `metafields?: Record<string, string>` to CMS settings type ([b73231a](https://github.com/ecomplus/cloud-commerce/commit/b73231a13291e0d80824b7b65722b38e8f8527d8))


### Bug Fixes

* **deps:** Update `@vite-pwa/astro` and `vitest` ([#126](https://github.com/ecomplus/cloud-commerce/issues/126)) ([25b4b8d](https://github.com/ecomplus/cloud-commerce/commit/25b4b8daaf8df3472810f0ed7ca7f41f12596d04))
* **deps:** Update all non-major dependencies ([47c18d0](https://github.com/ecomplus/cloud-commerce/commit/47c18d0ae02f248b82f106752b86d1c068c04128))
* **storefront:** Fix typedef for `loadPageContext` with Astro v2.0.16 ([b45affb](https://github.com/ecomplus/cloud-commerce/commit/b45affb18ea20b1f56664b3f4dbd212a18c853e0))
* **storefront:** Set <img> height/width on Astro <Picture> with local image ([596846d](https://github.com/ecomplus/cloud-commerce/commit/596846d85c9232efda7bdc79c6336fa47ccce0f5))

### [0.6.7](https://github.com/ecomplus/cloud-commerce/compare/v0.6.6...v0.6.7) (2023-02-26)


### Features

* **storefront:** Add new `AccountLink` atomic component ([5f07602](https://github.com/ecomplus/cloud-commerce/commit/5f07602231664a2b116684da33c615c50f436585))
* **storefront:** Update pages header layout to pass `serviceLinks` prop from CMS ([8c6c8a6](https://github.com/ecomplus/cloud-commerce/commit/8c6c8a65309d6c148e176e62c8f26a0b61287667))
* **types:** Add optional app links to `CmsSettings` object typedef ([ad3cf2e](https://github.com/ecomplus/cloud-commerce/commit/ad3cf2e88125357bf0644ed7d84798aad394240d))


### Bug Fixes

* **apps:** Remove wrong .gitignore to publish minified assets to npm ([1ac4df9](https://github.com/ecomplus/cloud-commerce/commit/1ac4df963bad38df7b41695b06f1cea7e32da088))

### [0.6.6](https://github.com/ecomplus/cloud-commerce/compare/v0.6.5...v0.6.6) (2023-02-25)


### Bug Fixes

* **cli:** Fix passing deploy options to command arguments with zx ([46e838f](https://github.com/ecomplus/cloud-commerce/commit/46e838ff9bf59116c05329e188a6661275f95493))
* **cli:** Prevent passing --only and --codebase args as true ([9266111](https://github.com/ecomplus/cloud-commerce/commit/92661117b1842d6e7dfa74d507426343d5c920b4))
* **storefront:** Fix `Drawer` vertical placement slide and handle scrollbar width ([7c6b916](https://github.com/ecomplus/cloud-commerce/commit/7c6b91602597274d962887951824590cef4ced28))

### [0.6.5](https://github.com/ecomplus/cloud-commerce/compare/v0.6.4...v0.6.5) (2023-02-24)


### Bug Fixes

* **cli:** Do not deploy with `--force` if other options passed ([5cda086](https://github.com/ecomplus/cloud-commerce/commit/5cda086c8e96f59fb0828a4c655041b5308342ca))
* **firebase:** Update config `ssrFunctionOptions` to 1GiB runtime by default ([f337537](https://github.com/ecomplus/cloud-commerce/commit/f3375370800d6a63b5f815674cb9796e3ac01e01))
* **storefront:** Global `Fade` transition component should not have scoped CSS ([cf57779](https://github.com/ecomplus/cloud-commerce/commit/cf57779437c3509aeec2b90dadbaf1dd55f3d45e))
* **storefront:** Reset `Carousel` scroll on window resize ([f66e883](https://github.com/ecomplus/cloud-commerce/commit/f66e883638ea3aab684810704093594776a37142))

### [0.6.4](https://github.com/ecomplus/cloud-commerce/compare/v0.6.3...v0.6.4) (2023-02-22)


### Features

* **api:** Improved product and cart/order item picture object typedef ([aa2f206](https://github.com/ecomplus/cloud-commerce/commit/aa2f20628599321951fe4992f8babdb753b4ce57))
* **storefront:** Add new `AImg` global Vue component ([ac4be0b](https://github.com/ecomplus/cloud-commerce/commit/ac4be0bd710fbb380bac16958f073648e999e0fb))


### Bug Fixes

* **ssr:** Fix handling not found routes ([7749baa](https://github.com/ecomplus/cloud-commerce/commit/7749baad91308d8b39fa5dc548cf46058f307136))
* **storefront:** Ensure Web App Manifest <link> ([d17dcb4](https://github.com/ecomplus/cloud-commerce/commit/d17dcb46e72c651d8a2e0ad46143785c25f081a2))

### [0.6.3](https://github.com/ecomplus/cloud-commerce/compare/v0.6.2...v0.6.3) (2023-02-21)


### Features

* **storefront:** Add new `useShopHeaderSubmenu` composable ([f2a73d3](https://github.com/ecomplus/cloud-commerce/commit/f2a73d36da2d069c05a9607d71a57bc834f704ac))
* **storefront:** Edit default SSR prefetch endpoint to also get categories first picture field ([fd81185](https://github.com/ecomplus/cloud-commerce/commit/fd81185fc0b8b33b16bed6a61730e6fb6fe25677))
* **storefront:** Update `useShopHeader` to handle CMS header config for categories ([ccbf0a9](https://github.com/ecomplus/cloud-commerce/commit/ccbf0a9667d5eb6bbe52afe03c1bbfacf7314f67))


### Bug Fixes

* **deps:** Update all non-major dependencies ([#125](https://github.com/ecomplus/cloud-commerce/issues/125)) ([884f1f4](https://github.com/ecomplus/cloud-commerce/commit/884f1f451f6bd4d5ac95cd734544e24a90bd5037))
* **storefront:** Fixing `useShopHeaderSubmenu` returned `categoryPicture` ([32ba21b](https://github.com/ecomplus/cloud-commerce/commit/32ba21bf5679bfccba2d439ccfecb113340956e3))
* **storefront:** Support parameters on API prefetch endpoints keeping only resource on `apiState` ([03c66df](https://github.com/ecomplus/cloud-commerce/commit/03c66dfe8e9c5a5a332a11cbc18d6a608cf2c788))

### [0.6.2](https://github.com/ecomplus/cloud-commerce/compare/v0.6.1...v0.6.2) (2023-02-19)


### Bug Fixes

* **storefront:** Fix state `useStorage` to prevent _localStorage is not defined_ ([94b5f6a](https://github.com/ecomplus/cloud-commerce/commit/94b5f6a31b3b6d0acaefd0879ef54b2bc5b37f6c))

### [0.6.1](https://github.com/ecomplus/cloud-commerce/compare/v0.6.0...v0.6.1) (2023-02-19)

## [0.6.0](https://github.com/ecomplus/cloud-commerce/compare/v0.5.0...v0.6.0) (2023-02-19)


### ⚠ BREAKING CHANGES

* **storefront:** `ADrawer` and `LoginDrawer` components no more exists
* **storefront:** Importing `@@sf/state/customer-session` does not start Firebase Auth automatically anymore, must call `initializeFirebaseAuth`

### Features

* **storefront:** Add `@@sf/browser-env` to exporting booleans for navigator and screen detection ([1281ad5](https://github.com/ecomplus/cloud-commerce/commit/1281ad50b6d23e7336dde1d5e5d4519ddeddcfa7))
* **storefront:** Add `@@sf/server-data` exporting `settings` and `apiContext` SSRred objects ([40ac1db](https://github.com/ecomplus/cloud-commerce/commit/40ac1db1a30ceb818a019ef21606c7541ceb229c))
* **storefront:** Also set `globalThis.storefront.context` on SSR context ([2c2fe64](https://github.com/ecomplus/cloud-commerce/commit/2c2fe642a1c07f32a5ee9851cf9c9dfde77e854a))
* **storefront:** New `SocialNetworkIcon` and `SocialNetworkLink` components ([9702da6](https://github.com/ecomplus/cloud-commerce/commit/9702da68bac461a085c58de143ddf1b5d0c120c7))


### Bug Fixes

* **storefront:** Auto set customer session email from Firebase if empty, even if not verified ([f1741a9](https://github.com/ecomplus/cloud-commerce/commit/f1741a9696b1bfa3f253aa05404a5c57f5387c7c))
* **storefront:** Fix `ALink` global component to target _blank on external host ([dffe5d8](https://github.com/ecomplus/cloud-commerce/commit/dffe5d81c6b7261aab3c4bda22b94e337f65e013))
* **storefront:** Fixing default context API doc minifier regex ([711413f](https://github.com/ecomplus/cloud-commerce/commit/711413f993a087395078aca723483e3ffa4e5aae))
* **storefront:** Make customer session state SSR friendly ([7dd8dff](https://github.com/ecomplus/cloud-commerce/commit/7dd8dff3680a112f9e9afd348b3a8696466056ff))
* **storefront:** Update customer session state `isLogged` with email verified only ([d5ada3a](https://github.com/ecomplus/cloud-commerce/commit/d5ada3a130b7082d328611071178d4b92e4721cc))


* **storefront:** Removing not intended to use `ADrawer` (=> `Drawer`) and `LoginDrawer` components ([0254f4c](https://github.com/ecomplus/cloud-commerce/commit/0254f4c82a76048b71e29bdcfeffa37b6992793d))

## [0.5.0](https://github.com/ecomplus/cloud-commerce/compare/v0.4.1...v0.5.0) (2023-02-16)


### ⚠ BREAKING CHANGES

* **storefront:** `cms` function is no more always sync

### Features

* **storefront:** Return `categoryTrees` and getters on `useShopHeader` ([b19cc85](https://github.com/ecomplus/cloud-commerce/commit/b19cc85c7b82c26ea09da17035830abd01331101))
* **storefront:** Starting new `useShopHeader` composable ([5b83e21](https://github.com/ecomplus/cloud-commerce/commit/5b83e21f9a0a2b2c1d540c46bc9e50bbd93f2bbd))
* **storefront:** Update `cms()` to return promise excepting to settings ([a4e011a](https://github.com/ecomplus/cloud-commerce/commit/a4e011aa649f591929181f442f1851a141057b67))
* **types:** Add social network links and Whatsapp number to `CmsSettings` (optionals) ([eeb7fb2](https://github.com/ecomplus/cloud-commerce/commit/eeb7fb2ee11a4f487e74fc6949f89344a43b43f9))


### Bug Fixes

* **deps:** Update all non-major dependencies ([#123](https://github.com/ecomplus/cloud-commerce/issues/123)) ([cb11bc0](https://github.com/ecomplus/cloud-commerce/commit/cb11bc0f6b336f06351252c6294d1ffe1a5c547b))
* **modules:** Limit `client_user_agent` from header to 355 chars ([9992da0](https://github.com/ecomplus/cloud-commerce/commit/9992da0fdd2d7ca4cdb89873f90fffa8f528dd86))
* **storefront:** Fix `Drawer` relative container height ([e939f91](https://github.com/ecomplus/cloud-commerce/commit/e939f91f4ad52b8e7e54614402b62dea91dd2878))
* **storefront:** Fix CMS result typedefs ([c56f09f](https://github.com/ecomplus/cloud-commerce/commit/c56f09fd3278813da9ef3a75f17aff03ba85b15e))
* **storefront:** Making content files optional excepting settings ([96ce212](https://github.com/ecomplus/cloud-commerce/commit/96ce212d0871363a7b1a196a000bc3160987a9fc))
* **storefront:** Prevent error throw on CMS collection list if dir not exists ([179e20d](https://github.com/ecomplus/cloud-commerce/commit/179e20dcaf8f64112ea92dbd12fbcba74f5a7c90))
* **storefront:** Update `PagesHeader` layout to import store src `ShopHeader` component ([6322160](https://github.com/ecomplus/cloud-commerce/commit/63221600b7ab25e7dd5f9f8d01d0a3bb32503c5a))

### [0.4.1](https://github.com/ecomplus/cloud-commerce/compare/v0.4.0...v0.4.1) (2023-02-09)


### Features

* **app-webhooks:** Create app for general carts/orders webhooks ([#112](https://github.com/ecomplus/cloud-commerce/issues/112)) ([25f6c6b](https://github.com/ecomplus/cloud-commerce/commit/25f6c6b46ef91ffa16516a2adc1ecd451df52cb0))
* **cli:** Create GCP service account with REST API if no `gcloud` CLI available ([#119](https://github.com/ecomplus/cloud-commerce/issues/119)) ([3cda825](https://github.com/ecomplus/cloud-commerce/commit/3cda8256a0996b65ca480633690051eb06ebaa32))
* **events:** Start handling delayed events, add `carts-delayed` ([#115](https://github.com/ecomplus/cloud-commerce/issues/115)) ([3e488db](https://github.com/ecomplus/cloud-commerce/commit/3e488dbdaa140b2be521b9f1f059c0ce5e364850))
* **storefront:** Adding `Drawer` component backdrop ([6739153](https://github.com/ecomplus/cloud-commerce/commit/6739153e0b63145a2a5a965d638e8ba7ca6a1e6a))


### Bug Fixes

* **deps:** Update all non-major dependencies ([#116](https://github.com/ecomplus/cloud-commerce/issues/116)) ([f4f886d](https://github.com/ecomplus/cloud-commerce/commit/f4f886ded7a50f10553133fe375dc5df0c68fcbb))
* **modules:** Properly handling IP and User-Agent on checkout ([addf5aa](https://github.com/ecomplus/cloud-commerce/commit/addf5aae43c2083364c577fd671636b99247d388))
* **storefront:** Set default teleported divs z-index ([85c8bb6](https://github.com/ecomplus/cloud-commerce/commit/85c8bb60f98a3a70e1cef0a9139fd6e6852e4279))

## [0.4.0](https://github.com/ecomplus/cloud-commerce/compare/v0.3.0...v0.4.0) (2023-02-05)


### ⚠ BREAKING CHANGES

* **storefront:** Prices component no more available, must be set on local store src/components/
* **storefront:** Removing all styled components to be set on store src, keeping only atomics headless components. Using composables for shop components.

### Features

* **storefront:** Add `logo-picture` slot to pages header Astro component (layout) ([1fe3e48](https://github.com/ecomplus/cloud-commerce/commit/1fe3e486e1b74d326fc60fadb62f8010e88e5fcb))
* **storefront:** Edit `StickyHeader` to be easly (classes) editable ([f526480](https://github.com/ecomplus/cloud-commerce/commit/f52648057bbb7627f7fbb34f4a083dc51f0de9b8))


### Bug Fixes

* **storefront:** Setting `#teleported-top` and `#teleported-bottom` divs for teleports instead ([6197557](https://github.com/ecomplus/cloud-commerce/commit/61975578b3dc2c7588c152ab553aa154172a350c))
* **storefront:** Stop `Drawer` from removing header backdrop by default ([b026bc7](https://github.com/ecomplus/cloud-commerce/commit/b026bc7bd7e12e70b70768fc820ccbf2d88730e6))


* **storefront:** Removing `PitchBar` in favor of new `usePitchBar` composable ([f9e4551](https://github.com/ecomplus/cloud-commerce/commit/f9e45518f05bb0f603487b3637f60f0558d625fe))
* **storefront:** Removing `Prices` component in favor of `usePrices` composable ([101e778](https://github.com/ecomplus/cloud-commerce/commit/101e7783c28fc8418827481196f241397399d792))

## [0.3.0](https://github.com/ecomplus/cloud-commerce/compare/v0.2.3...v0.3.0) (2023-02-01)


### ⚠ BREAKING CHANGES

* **storefront:** CSS var `--content-max-width` no more set, <main> width no more limited by default

### Features

* **i18n:** Add `i19buyTogether` `i19buyTogetherWith` `i19report` `i19toggleMenu` ([a963273](https://github.com/ecomplus/cloud-commerce/commit/a9632736c9ae917d286e3507cbb76c6541ea9a2e))
* **melhor-envio:**  Ceate app to integrate Melhor Envio ([#111](https://github.com/ecomplus/cloud-commerce/issues/111)) ([a9ac8d3](https://github.com/ecomplus/cloud-commerce/commit/a9ac8d30178305ecb6145b27ed9197b6a951ef72))
* **storefront:** Add `isFloating` option (prop) to global `Fade` component ([666509a](https://github.com/ecomplus/cloud-commerce/commit/666509a00fadc707d587ef0929e1ec0732ad1de2))
* **storefront:** Add `slide` and `controls` slot to `PitchBar` ([88c60fa](https://github.com/ecomplus/cloud-commerce/commit/88c60fa08c1a55e84ebd0ac27c292f23168271b5))
* **storefront:** Add new `--transition-fast` root CSS var ([3d85ae2](https://github.com/ecomplus/cloud-commerce/commit/3d85ae266e435c73f29dc45f4cc9b2224a123ca5))
* **storefront:** Add new `Drawer` component ([53f0131](https://github.com/ecomplus/cloud-commerce/commit/53f0131cc9bc9b21c6edb4add95fa205b870bd0b))
* **storefront:** Add new `StickyHeader.vue` (almost) headless component ([a9987b3](https://github.com/ecomplus/cloud-commerce/commit/a9987b3ae7b4ec84c110f7e841550d22474dcbf7))
* **storefront:** Defining custom `<d-md>` tag  for responsive tricks in /content JSON ([5108aaf](https://github.com/ecomplus/cloud-commerce/commit/5108aaf6b2c18470a35916df80794972e1a04701))
* **storefront:** Starting with `ShopHeader.vue` component ([c078cc1](https://github.com/ecomplus/cloud-commerce/commit/c078cc18eb0b7225faee0d4b64d5a0309a0e0ddc))


### Bug Fixes

* **deps:** Update all non-major dependencies ([#110](https://github.com/ecomplus/cloud-commerce/issues/110)) ([ffc310c](https://github.com/ecomplus/cloud-commerce/commit/ffc310c38bd1aa9facceffa4eb2c1665dde867fd))
* **storefront:** Fix `Carousel` index calc with 5px approximate ([32763ab](https://github.com/ecomplus/cloud-commerce/commit/32763abd38bd4790056c0d4431fefc3b3a700eb8))
* **storefront:** Fix `Fade` to clear inline height/width on transition after enter ([3a8f75e](https://github.com/ecomplus/cloud-commerce/commit/3a8f75e299dc8f15526068485c04a0017965b66f))
* **storefront:** Update `useComponentVariant` composable to ignore `modelValue` ([ef7ab8f](https://github.com/ecomplus/cloud-commerce/commit/ef7ab8f4038a5179fe36a163250b8b25739ae4ce))
* **storefront:** Update UnoCSS config with correct shortcuts order ([1993e42](https://github.com/ecomplus/cloud-commerce/commit/1993e4232b36963f2aacf1d5dbace3b5fc8f31a6))


* **storefront:** Removing `--content-max-width` from base.css ([a214b3e](https://github.com/ecomplus/cloud-commerce/commit/a214b3e43e6f38b18bbfe621536b2db42d1c47c8))

### [0.2.3](https://github.com/ecomplus/cloud-commerce/compare/v0.2.2...v0.2.3) (2023-01-26)


### Features

* **fb-conversions:** Handle new cart event to send `InitiateCheckout` ([#109](https://github.com/ecomplus/cloud-commerce/issues/109)) ([4fecb0f](https://github.com/ecomplus/cloud-commerce/commit/4fecb0f2fa5df546bae1115839677b4d486d2da4))
* **storefront:** Update deps to Astro v2 (and Vite 4) ([91d0dd7](https://github.com/ecomplus/cloud-commerce/commit/91d0dd73ca64356acb243385121a4967be7861eb))


### Bug Fixes

* **storefront:** Fix `Prices` component fade animations on values load ([d21b9f3](https://github.com/ecomplus/cloud-commerce/commit/d21b9f3ea409c14b55fdb35ae622a2a4a295498d))
* **storefront:** Minor fix typedef for `Picture` with Astro v4 ([8652bc8](https://github.com/ecomplus/cloud-commerce/commit/8652bc85397e05021d88ecba1484a59cdba2f04d))

### [0.2.2](https://github.com/ecomplus/cloud-commerce/compare/v0.2.1...v0.2.2) (2023-01-25)


### Features

* **paghiper:** Create PagHiper app from https://github.com/ecomplus/app-paghiper  ([#105](https://github.com/ecomplus/cloud-commerce/issues/105)) ([5f1c7c5](https://github.com/ecomplus/cloud-commerce/commit/5f1c7c5f5ba0f64d20637f403339e61c595e4633))
* **storefront:** Add /img and /assets Vite aliases to public dir on Astro config ([93a9da3](https://github.com/ecomplus/cloud-commerce/commit/93a9da389817818f0ba36e5e85353267d63e66ca))
* **storefront:** Add `parseShippingPhrase` util to modules info state exports ([6645159](https://github.com/ecomplus/cloud-commerce/commit/6645159c1f81a24898bc810d7206db7ddfa094df))
* **storefront:** Export new `getAspecRatio` on SSR image helpers ([7626a53](https://github.com/ecomplus/cloud-commerce/commit/7626a532ba400c58b0ba0d7b5c741bf905203ec6))
* **storefront:** Load modules info presets (payment, shipping) from CMS settings ([56afb71](https://github.com/ecomplus/cloud-commerce/commit/56afb71c9b05c34954b4ea56adf304abc0b281cb))
* **storefront:** New `ssr/Picture.astro` to automatically handle aspect ration for local images ([3da9bb2](https://github.com/ecomplus/cloud-commerce/commit/3da9bb2831c1f110497993e2f1c7fd1598f6b56b))


### Bug Fixes

* **storefront:** Add SSR `global.storefront.onLoad` emitter and async load modules info preset ([235934d](https://github.com/ecomplus/cloud-commerce/commit/235934d46295ca41496ceb2be305c765d1aa337c))
* **storefront:** Also load modules info preset on SSR, prevents hydration mismatch ([911ab0e](https://github.com/ecomplus/cloud-commerce/commit/911ab0e6951fdbc82202e396aff60337a25fb49d))
* **storefront:** Config fallbacks to `config.json` when `ECOM_STORE_ID` not set (dev) ([13d8db7](https://github.com/ecomplus/cloud-commerce/commit/13d8db713928328ba229e58891fd5ce8b04d134c))
* **storefront:** Fix merged `CmsSettings` typedef and update `window.storefront` interface ([2dfee42](https://github.com/ecomplus/cloud-commerce/commit/2dfee422a9f782daaca8d37568d56fdad2c93a2a))
* **storefront:** Move base ES Lint config to Storefront codebase to be imported ([62c8ba4](https://github.com/ecomplus/cloud-commerce/commit/62c8ba446a88f68192d113bb9bbfd14d436db64d))
* **storefront:** Reduce default darken factor for brand colors pallete (bold) ([6441ef8](https://github.com/ecomplus/cloud-commerce/commit/6441ef8fa836958c0cf2f6e66df496e8934cf4ef))
* **storefront:** Update `PitchBar` to use `parseShippingPhrase` and check number of slides ([9c0fe4a](https://github.com/ecomplus/cloud-commerce/commit/9c0fe4aa48ceca87a433497edc5fd4f9d037f71f))

### [0.2.1](https://github.com/ecomplus/cloud-commerce/compare/v0.2.0...v0.2.1) (2023-01-21)


### Bug Fixes

* **datafrete:** Update `@cloudcommerce/firebase` dependency to current version ([2b1fb33](https://github.com/ecomplus/cloud-commerce/commit/2b1fb33b54fdc7a7bb342f3e065f7973911a3978))

## [0.2.0](https://github.com/ecomplus/cloud-commerce/compare/v0.1.7...v0.2.0) (2023-01-21)


### ⚠ BREAKING CHANGES

* **storefront:** `@@components/**` imports no more working
* **storefront:** `shoppingCartIcon`, `cashbackIcon` fields no more working as Storefront Tailwind config (gen) options
* **storefront:** Getting money values from dataset no more available

### Features

* **datafrete:** Create app to integrate Datafrete shipping gateway  ([#103](https://github.com/ecomplus/cloud-commerce/issues/103)) ([5c28ab1](https://github.com/ecomplus/cloud-commerce/commit/5c28ab15ddc45f5d7d5570896cc1dcabec69ac51))
* **google-analytics:** App to send orders events to GA4 server side ([#102](https://github.com/ecomplus/cloud-commerce/issues/102)) ([899e308](https://github.com/ecomplus/cloud-commerce/commit/899e308a1cc78b5ef3801cab3961af6b0950afbe))
* **storefront:** Add `autoplay` prop (ms) to Carousel component ([18b91dd](https://github.com/ecomplus/cloud-commerce/commit/18b91dd0589c7ce53120d3fd1c630002ffb5512c))
* **storefront:** Add `CarouselControl` child-component for headless Carousel ([8c43757](https://github.com/ecomplus/cloud-commerce/commit/8c43757942ca553e4e984ff31d805f6b6a406e31))
* **storefront:** Add `PitchBar` component with carousel slides ([c86d845](https://github.com/ecomplus/cloud-commerce/commit/c86d845803dbaa7856324ed30ad4ed4033bc23ca))
* **storefront:** Add new `Carousel.vue` headless component ([9f01ff6](https://github.com/ecomplus/cloud-commerce/commit/9f01ff616eed45d13496b8bf1c8b5153e788c69c))
* **storefront:** New global Vue component `ALink` ([58b552f](https://github.com/ecomplus/cloud-commerce/commit/58b552fda2849f61148c88a89623a91e3efb9796))
* **storefront:** Use an object `iconAliases` on UnoCSS/Tailwind configs, add chevron icons aliases ([2cc164d](https://github.com/ecomplus/cloud-commerce/commit/2cc164d7438c8a322f8c106c74681331abe64a47))


### Bug Fixes

* **deps:** Update all non-major dependencies ([#104](https://github.com/ecomplus/cloud-commerce/issues/104)) ([6cb0644](https://github.com/ecomplus/cloud-commerce/commit/6cb0644d463989cccf808974ea08e8fa559531a0))
* **galaxpay:** Fix the name of the collection ([db63905](https://github.com/ecomplus/cloud-commerce/commit/db6390503e632ad1c3b8ffdbeebaf412c13339c3))
* **storefront:** Fix `client.d.ts` Window interface ([9ec46c9](https://github.com/ecomplus/cloud-commerce/commit/9ec46c9b2b359f37bcc5e390a03f914c33353b15))
* **storefront:** Fix TS shims, update Vue globals typedef and add `vue/ref-macros` types ([97fa988](https://github.com/ecomplus/cloud-commerce/commit/97fa988cfb52b96395c588e3b09f1dc1254444ed))
* **storefront:** Import SW before /head, use `@vite-pwa/astro` ([30e254b](https://github.com/ecomplus/cloud-commerce/commit/30e254ba85671f1a4505111987aeb574632270cc))


* **storefront:** Removing `@[@components](https://github.com/components)` alias for now ([441cfb7](https://github.com/ecomplus/cloud-commerce/commit/441cfb74f26ab0b70caaa97fe724fd205a752f18))
* **storefront:** Update `Prices` component removing values for secondary [data-sf-prices-*] attrs ([fae36af](https://github.com/ecomplus/cloud-commerce/commit/fae36afb2f3d5c20535f4cd3d3411cb6016069a8))

### [0.1.7](https://github.com/ecomplus/cloud-commerce/compare/v0.1.6...v0.1.7) (2023-01-04)


### Features

* **storefront:** New optional global `window.storefront.modulesInfoPreset` ([aa587fd](https://github.com/ecomplus/cloud-commerce/commit/aa587fd977016116b65b52847fd76121673dd464))


### Bug Fixes

* **deps:** update all non-major dependencies ([#101](https://github.com/ecomplus/cloud-commerce/issues/101)) ([9fcfe7c](https://github.com/ecomplus/cloud-commerce/commit/9fcfe7cfaed2a643cc19bad927d1bce42845655e))
* **storefront:** Edit `usePrices` composable to support compound discount labels ([7ae2114](https://github.com/ecomplus/cloud-commerce/commit/7ae211456949b8728857be79142d019a8653dabb))
* **storefront:** Fix `Prices` component slots binds to pass values instead of Computed/Ref objects ([951507a](https://github.com/ecomplus/cloud-commerce/commit/951507ace35fc69b96ba7387d5a557ee46a1ec06))
* **storefront:** Fix `window.storefront.modulesInfoPreset` typedef ([8bf3cc5](https://github.com/ecomplus/cloud-commerce/commit/8bf3cc53bf20c767d14915aa5f16bcd2d3bdc0e4))
* **storefront:** Fix typedef and cashback/installments handlers on `usePrices` and `Prices` ([f0bd969](https://github.com/ecomplus/cloud-commerce/commit/f0bd969cd6d646237d7c36df503d759ae1711fbf))
* **storefront:** Minor fix SSR image transform typedef to not require `alt` property ([0875cb0](https://github.com/ecomplus/cloud-commerce/commit/0875cb043bc002b765f02c04916aaa0633de605f))
* **storefront:** Remove root slot from `Prices` to support attributes inheritance ([9a0a8b0](https://github.com/ecomplus/cloud-commerce/commit/9a0a8b0246999d6cd48be2bad0896df95c944345))

### [0.1.6](https://github.com/ecomplus/cloud-commerce/compare/v0.1.5...v0.1.6) (2022-12-29)


### Features

* **fb-conversions:** App to send carts/orders to Facebook Conversions API ([#99](https://github.com/ecomplus/cloud-commerce/issues/99)) ([1c6a785](https://github.com/ecomplus/cloud-commerce/commit/1c6a785b194c4dda81409c6ddfd36aaeea974e5b))


### Bug Fixes

* **fb-conversions:** Add `firebase-admin` (peer) to dependencies ([6a0cf07](https://github.com/ecomplus/cloud-commerce/commit/6a0cf07a267316538ce04ce637b4f30103c498cb))

### [0.1.5](https://github.com/ecomplus/cloud-commerce/compare/v0.1.4...v0.1.5) (2022-12-28)


### Features

* **storefront:** New icon alias `i-cashback` used on Prices component by default ([456ddd4](https://github.com/ecomplus/cloud-commerce/commit/456ddd4c2078ab62f0fae5bb51e2dcfc082f5365))


### Bug Fixes

* **storefront:** Merge theme options object as argument for Tailwind/UnoCSS config gen ([a5673f0](https://github.com/ecomplus/cloud-commerce/commit/a5673f0dfbb385bb47109c8221b07ee0b7c134ad))
* **storefront:** Pass theme options from UnoCSS config to `genTailwindConfig` ([280f1ac](https://github.com/ecomplus/cloud-commerce/commit/280f1ac04e1c9f0167d97365803670246e234f77))

### [0.1.4](https://github.com/ecomplus/cloud-commerce/compare/v0.1.3...v0.1.4) (2022-12-27)


### Features

* **frenet:** Create Frenet app events for shipping status auto-update ([#97](https://github.com/ecomplus/cloud-commerce/issues/97)) ([d71b46b](https://github.com/ecomplus/cloud-commerce/commit/d71b46b617120f143647fa7d4ca4853ebd45568e))


### Bug Fixes

* **deps:** Update dependency unocss to ^0.48.0 ([#98](https://github.com/ecomplus/cloud-commerce/issues/98)) ([d25cc84](https://github.com/ecomplus/cloud-commerce/commit/d25cc84b88a3b9009333cd00e8a03a2b432d1cca))
* **storefront:** Update default bold/subtle diffs ([7380a8e](https://github.com/ecomplus/cloud-commerce/commit/7380a8e7bb7a26048fe97eebffda7a177ba90db5))
* **storefront:** Use RGB values on CSS vars to support color utils with opacity ([5c37128](https://github.com/ecomplus/cloud-commerce/commit/5c371288e101b111bdfb7f88da9755ebf03b12b0)), closes [#discussioncomment-4491119](https://github.com/ecomplus/cloud-commerce/issues/discussioncomment-4491119)

### [0.1.3](https://github.com/ecomplus/cloud-commerce/compare/v0.1.2...v0.1.3) (2022-12-24)


### Bug Fixes

* **deps:** Update all non-major dependencies ([dae94d3](https://github.com/ecomplus/cloud-commerce/commit/dae94d37862f3b01c1799cc7be4906893b111a46))
* **ssr:** Add `@vueuse/core` and `@headlessui/vue` to SSR deps ([6c7204e](https://github.com/ecomplus/cloud-commerce/commit/6c7204ee3569a81075e36407fd962f36fac1c669))

### [0.1.2](https://github.com/ecomplus/cloud-commerce/compare/v0.1.1...v0.1.2) (2022-12-22)


### Bug Fixes

* **ssr:** For global directive, `floating-vue` must be at SSR deps ([3cc4b17](https://github.com/ecomplus/cloud-commerce/commit/3cc4b17bd43dcfb40922887c5a257e2359ae5b59))

### [0.1.1](https://github.com/ecomplus/cloud-commerce/compare/v0.1.0...v0.1.1) (2022-12-22)


### Features

* **loyalty-points:** Setup loyalty points payment app from https://github.com/ecomplus/app-loyalty-points  ([#92](https://github.com/ecomplus/cloud-commerce/issues/92)) ([f796092](https://github.com/ecomplus/cloud-commerce/commit/f796092efb52a22a10fb1f30e579fbc8b667097b))


### Bug Fixes

* **storefront:** Import `VTooltip` TS src (to be compiled) to prevent ESM error ([22a84f5](https://github.com/ecomplus/cloud-commerce/commit/22a84f5bbd8d548e505dfe52a7d2d9d0207fa9ba))

## [0.1.0](https://github.com/ecomplus/cloud-commerce/compare/v0.0.133...v0.1.0) (2022-12-21)


### Features

* **custom-payment:** Setup custom payments app from https://github.com/ecomplus/app-custom-payment ([#93](https://github.com/ecomplus/cloud-commerce/issues/93)) ([402ea85](https://github.com/ecomplus/cloud-commerce/commit/402ea85aa8046365e4a4c033ad2ec2b2d8ed0fe3))
* **galaxpay:** Setup Galax Pay app from https://github.com/ecomplus/app-galaxpay ([#89](https://github.com/ecomplus/cloud-commerce/issues/89)) ([4ac160a](https://github.com/ecomplus/cloud-commerce/commit/4ac160afd9e4f71bbcf8c5c59b550cdcc6a866bf))
* **i18n:** Add `i19get$1back`, fix `i19get` pt ([d212189](https://github.com/ecomplus/cloud-commerce/commit/d212189d3debb139e522e3bb9f77a0625886a269))
* **jadlog:** Setup Jadlog app from https://github.com/ecomplus/app-jadlog ([c3f82e2](https://github.com/ecomplus/cloud-commerce/commit/c3f82e2771dbb24509d9c4a476b6fb69182d055f))
* **storefront:** Add global directive `v-tooltip` to default Vue instance ([3b41702](https://github.com/ecomplus/cloud-commerce/commit/3b41702503c87bcd17cc1d4e8266a168193e3184))
* **storefront:** Add new global `Fade` component to default Vue instance ([2124406](https://github.com/ecomplus/cloud-commerce/commit/2124406d61ca4109ebb096980827717b3c025ba4))
* **storefront:** Handle loyalty points on `usePrices` composable ([dd20816](https://github.com/ecomplus/cloud-commerce/commit/dd20816d57439b84672fc295ca03fbfb351003f6))
* **storefront:** New `speed` prop with slow and slower options for global Fade component ([5945059](https://github.com/ecomplus/cloud-commerce/commit/5945059cc4563d667e5e878c0c3a981735d4b5b7))
* **storefront:** Setup (almost) renderless `Prices` components, defining components API ([924dda0](https://github.com/ecomplus/cloud-commerce/commit/924dda02ab26582dac34af0ce7c239c30d4e9c56))
* **storefront:** Setup `usePrices` composable ([f03cca4](https://github.com/ecomplus/cloud-commerce/commit/f03cca4d9af32cde56078ae4410434df5d22e272))
* **storefront:** Update `Fade` component to change el height/width on tarnsition with slide ([9ff310e](https://github.com/ecomplus/cloud-commerce/commit/9ff310e3c70cbd09bbe074bf0acb5cb05c73429a))


### Bug Fixes

* **deps:** Update all non-major dependencies ([#94](https://github.com/ecomplus/cloud-commerce/issues/94)) ([f5abf55](https://github.com/ecomplus/cloud-commerce/commit/f5abf55dde1e216a4c22c2a96d0bf00146eafabd))
* **deps:** Update dependency @astrojs/node to v4 ([#95](https://github.com/ecomplus/cloud-commerce/issues/95)) ([7d69a3e](https://github.com/ecomplus/cloud-commerce/commit/7d69a3eed09230e5310b67aab1c1f5e512d5408d))
* **modules:** Skipping not implemented (external) apps por now ([2f139b6](https://github.com/ecomplus/cloud-commerce/commit/2f139b6c15e3c9131842d89a4cfedb4a36bdfb9c))
* **storefront:** Edit `usePrices` composable to peorperly handle optional product prop ([d528de2](https://github.com/ecomplus/cloud-commerce/commit/d528de2be354515680afa5540392539c0caf6e48))

### [0.0.133](https://github.com/ecomplus/cloud-commerce/compare/v0.0.132...v0.0.133) (2022-12-12)


### Bug Fixes

* **storefront:** Problems with Vite auto imports and Astro SSR, removing ([e0dea76](https://github.com/ecomplus/cloud-commerce/commit/e0dea7644158ce1ffea15607629d86e0ebded727))

### [0.0.132](https://github.com/ecomplus/cloud-commerce/compare/v0.0.131...v0.0.132) (2022-12-12)


### Features

* **i18n:** Build each lang/word to txt ([7d7843b](https://github.com/ecomplus/cloud-commerce/commit/7d7843b2e15cd6c6b56b54f3f344d61b075fe64d))
* **storefront:** Handling modules info with Vue Reactivity API ([0d68c44](https://github.com/ecomplus/cloud-commerce/commit/0d68c4488e1956fda89e1df81b70c5d98c04fac0))
* **storefront:** Handling session UTM on <BaseBody> ([90212fd](https://github.com/ecomplus/cloud-commerce/commit/90212fddcfcc00d23b197b438fcdce156eba84a6))
* **storefront:** Setup Vue app globals $t and $formatMoney from `@ecomplus/utils` ([8db559f](https://github.com/ecomplus/cloud-commerce/commit/8db559f3a249076c14b0a1d445deb5c75cbc4847))
* **storefront:** Starting `Price` component with headless approach ([eec5e39](https://github.com/ecomplus/cloud-commerce/commit/eec5e399ed30180bee5180ff5ef26f9253696e9b))


### Bug Fixes

* **deps:** update all non-major dependencies ([#87](https://github.com/ecomplus/cloud-commerce/issues/87)) ([748ccf9](https://github.com/ecomplus/cloud-commerce/commit/748ccf9bdc12f45c37e492405d8cabce4429e652))
* **i18n:** Fix `i19labelOfCustomization` ([06a9b76](https://github.com/ecomplus/cloud-commerce/commit/06a9b76bddfeceae6a74afb7a1d32f5fad41a1b3))
* **pagarme:** Correct path to read `assets/onload-expression.min.js` ([f5831d9](https://github.com/ecomplus/cloud-commerce/commit/f5831d9375a88e53f09782eb0e35deb28a1cbaa6))

### [0.0.131](https://github.com/ecomplus/cloud-commerce/compare/v0.0.130...v0.0.131) (2022-12-08)


### Bug Fixes

* **firebase:** PubSub function handler should return promise ([44edda5](https://github.com/ecomplus/cloud-commerce/commit/44edda5c9d29cb7680a9758c8453f9a719e1df7c))

### [0.0.130](https://github.com/ecomplus/cloud-commerce/compare/v0.0.129...v0.0.130) (2022-12-06)

### [0.0.129](https://github.com/ecomplus/cloud-commerce/compare/v0.0.128...v0.0.129) (2022-12-06)


### Features

* **storefront:** Setup auto import for Vue components, Vue API, Vueuse and i18n ([f41d802](https://github.com/ecomplus/cloud-commerce/commit/f41d8027901e26d315d06ec1b5667fab423bc826))


### Bug Fixes

* **deps:** Update all non-major dependencies ([#86](https://github.com/ecomplus/cloud-commerce/issues/86)) ([6b3c061](https://github.com/ecomplus/cloud-commerce/commit/6b3c061ea8cf01f9cc686b5683a93cc0539e5d7f))
* **infinitepay:** Fix authorization error with `authorization_code` other than '00' ([#85](https://github.com/ecomplus/cloud-commerce/issues/85)) ([dcc55a1](https://github.com/ecomplus/cloud-commerce/commit/dcc55a1ad0933617457070d8d78c97b6048c6c2f))
* **storefront:** Rename `--rgb-*` CSS vars, fix ::selection bg ([192d4b3](https://github.com/ecomplus/cloud-commerce/commit/192d4b3427b0eaef9e51e293aa189aa156825ccb))

### [0.0.128](https://github.com/ecomplus/cloud-commerce/compare/v0.0.127...v0.0.128) (2022-12-01)


### Bug Fixes

* **config:** Check `SETTINGS_FILEPATH` and add last fallback to _functions/ssr/..._ ([ae6e92a](https://github.com/ecomplus/cloud-commerce/commit/ae6e92a03c9a12ad8d8e7b690592f6e673a71362))

### [0.0.127](https://github.com/ecomplus/cloud-commerce/compare/v0.0.126...v0.0.127) (2022-12-01)


### Features

* **cli:** Copy CMS `content/settings.json` to all functions codebases ([98f8895](https://github.com/ecomplus/cloud-commerce/commit/98f8895ec81ef324ad33c1b2932c65fce62cefd0)), closes [#discussion_r1011148218](https://github.com/ecomplus/cloud-commerce/issues/discussion_r1011148218)
* **discounts:** Add buy together recommendations and same product kits ([e94227b](https://github.com/ecomplus/cloud-commerce/commit/e94227b296a6eafc05bd695a4ba725a01168b392))
* **emails:** Crate `@cloudcommerce/emails` package ([#68](https://github.com/ecomplus/cloud-commerce/issues/68)) ([5998c93](https://github.com/ecomplus/cloud-commerce/commit/5998c93c538cfdd82a059bcfa1c161b22ace8f42))
* **emails:** Create default app for sending transactional emails ([#73](https://github.com/ecomplus/cloud-commerce/issues/73)) ([15dbe07](https://github.com/ecomplus/cloud-commerce/commit/15dbe070adbe6b2f0c254632c344f33378813f32)), closes [#62](https://github.com/ecomplus/cloud-commerce/issues/62)
* **events:** Add emails app ([#79](https://github.com/ecomplus/cloud-commerce/issues/79)) ([727dff9](https://github.com/ecomplus/cloud-commerce/commit/727dff9db497f56c115a1abcd8fd4a29dbc1b1e8))
* **firebase:** Parse deployed CMS settinfs JSON and merge to config ([9d34c38](https://github.com/ecomplus/cloud-commerce/commit/9d34c388a80eff883623921581a0e6bad36ec1b7))
* **infinitepay:** Create InfinitePay payment app ([#83](https://github.com/ecomplus/cloud-commerce/issues/83)) ([8c46ca2](https://github.com/ecomplus/cloud-commerce/commit/8c46ca2b61e5b721cbea8d5a7bc0c3c229e33ac1))
* **modules:** Add `buy_together` recommendations to apply discount response schema ([36c56aa](https://github.com/ecomplus/cloud-commerce/commit/36c56aa2f3e00e365994b46f57b89bffb62c910d))
* **pagar-me:** Create app pagar.me ([6c93a46](https://github.com/ecomplus/cloud-commerce/commit/6c93a465931202831b7fe91b8006b6a105a2dd10))
* **pix:** Creating Pix (Bacen API) payment app ([#81](https://github.com/ecomplus/cloud-commerce/issues/81)) ([351279b](https://github.com/ecomplus/cloud-commerce/commit/351279b29f55e62a93a85d36d2495befa909cb78))
* **storefront:** Better handling branc colors tokens with Tailwind colors and CSS vars ([8af936d](https://github.com/ecomplus/cloud-commerce/commit/8af936debdd7f8332c24de2d2270fe32ce2bac54))
* **storefront:** Handle `shoppingCart` state with Vue Reactivity API ([235a329](https://github.com/ecomplus/cloud-commerce/commit/235a329bcc26aab9b2e273bc63c946db2a9dc0ff))


### Bug Fixes

* **cli:** Change import from `index` to `cli` in run.mjs file ([#80](https://github.com/ecomplus/cloud-commerce/issues/80)) ([ab38861](https://github.com/ecomplus/cloud-commerce/commit/ab3886168a7a7f9099ea8c157613cb24fb245a51))
* **config:** Handle `cmsSettings` (optional) to base config object ([25ceb8c](https://github.com/ecomplus/cloud-commerce/commit/25ceb8cfd7544bc4e7a6bd26437bb4ddadad3e2e))
* **create-transaction:** Respond to module promise ([e241d37](https://github.com/ecomplus/cloud-commerce/commit/e241d37330f251693e44b7b8b957654b8503af2d))
* **deps:** Update `@ecomplus/utils` for typedefs and esm imports ([4810a80](https://github.com/ecomplus/cloud-commerce/commit/4810a80c87c01d12c19aa1405507a346f69c3ca0))
* **deps:** Update all non-major dependencies ([#72](https://github.com/ecomplus/cloud-commerce/issues/72)) ([ecdeed0](https://github.com/ecomplus/cloud-commerce/commit/ecdeed041fddf1f939b3a89b05ad33f638ffdf55))
* **deps:** Update all non-major dependencies ([#75](https://github.com/ecomplus/cloud-commerce/issues/75)) ([077076f](https://github.com/ecomplus/cloud-commerce/commit/077076fa7566f43ce5c14195b2dfce03d0c0e4df))
* **deps:** update all non-major dependencies ([#82](https://github.com/ecomplus/cloud-commerce/issues/82)) ([1fe1c1e](https://github.com/ecomplus/cloud-commerce/commit/1fe1c1ea4d57d937e360dfbea75477286fa8947b))
* **deps:** Update all non-major dependencies ([#84](https://github.com/ecomplus/cloud-commerce/issues/84)) ([d12c5a9](https://github.com/ecomplus/cloud-commerce/commit/d12c5a99ae4986b167ae5aec457e1256813af097))
* **deps:** Update dependency @astrojs/node to v3 ([#76](https://github.com/ecomplus/cloud-commerce/issues/76)) ([5d5b20f](https://github.com/ecomplus/cloud-commerce/commit/5d5b20f1df8f7bca250c2ff3eea5038d1f8c38ec))
* **discounts:** Better debug usage limits error ([6ee764f](https://github.com/ecomplus/cloud-commerce/commit/6ee764ff8a4edce62d9b1d3f73ec5c05a35c2c87))
* **emails:** Allow sending emails with ready-made HTML ([#74](https://github.com/ecomplus/cloud-commerce/issues/74)) ([61da656](https://github.com/ecomplus/cloud-commerce/commit/61da6562a1bc459b45db474f1f58e62bfe9c6cb5))
* **firebase-config:** Resolve conflicts ([47a80e3](https://github.com/ecomplus/cloud-commerce/commit/47a80e3d47a1a76adf6ea33dabccad3afdd13493))
* **passport:** Properly await generate token request ([#71](https://github.com/ecomplus/cloud-commerce/issues/71)) ([3f13bb1](https://github.com/ecomplus/cloud-commerce/commit/3f13bb159572384e4a18c09a348421028a05a96c))
* **passport:** Type fix `generateAccessToken` promise never resolves with null ([920326f](https://github.com/ecomplus/cloud-commerce/commit/920326f5d835cedbf01511cfb067dd4690bd7417))
* **storefront:** Fix image transform to high resolution (keep ar) ([5d56c3b](https://github.com/ecomplus/cloud-commerce/commit/5d56c3bc3ff6fea0e784f7412830a25bc76327f3))
* **storefront:** Update pages SSR cache sMaxAge to 5min and SWR to 7 days ([e75d914](https://github.com/ecomplus/cloud-commerce/commit/e75d914bf25c50e61060e0f841f3decd22faad0e))
* **storefront:** Updates to handle new CMS settings object with localization and unique icon ([6ca3b8c](https://github.com/ecomplus/cloud-commerce/commit/6ca3b8ceb5fb096254186f05bd53b6548c977f33))
* **storefront:** Use aliases for iconify collections pkgs ([cf32085](https://github.com/ecomplus/cloud-commerce/commit/cf3208527f714beea84a451eaac8707893fe7033))
* **types:** Adding more required company info to CMS settings types ([ee10856](https://github.com/ecomplus/cloud-commerce/commit/ee10856898c6748f131a4842a65fa1ca64c3936f)), closes [#discussion_r1020415433](https://github.com/ecomplus/cloud-commerce/issues/discussion_r1020415433)
* **types:** Update CMS settings to make secondary and bg colors optionals ([428c4e3](https://github.com/ecomplus/cloud-commerce/commit/428c4e339351070ba5ad6f867f5cf9f56eaa93f5))
* **webhook:** Correct file names ([4ccd557](https://github.com/ecomplus/cloud-commerce/commit/4ccd557076adae4289a9b31fe1c10e5da17107ac))

### [0.0.126](https://github.com/ecomplus/cloud-commerce/compare/v0.0.125...v0.0.126) (2022-11-02)


### Bug Fixes

* **checkout:** Better error handling update and other checkout improvements ([#56](https://github.com/ecomplus/cloud-commerce/issues/56)) ([99cb75e](https://github.com/ecomplus/cloud-commerce/commit/99cb75e4e74ec66ba10369f56f1be1daa4db4ea7))
* **deps:** Update all non-major dependencies ([#64](https://github.com/ecomplus/cloud-commerce/issues/64)) ([42cfc11](https://github.com/ecomplus/cloud-commerce/commit/42cfc11dc951d66aac772a8baf59e54a706359ba))
* **deps:** Update all non-major dependencies ([#69](https://github.com/ecomplus/cloud-commerce/issues/69)) ([8c0e4bc](https://github.com/ecomplus/cloud-commerce/commit/8c0e4bc084928331ba07c36562f02c4026b1526f))
* **deps:** Update dependency @astrojs/node to v2 ([#60](https://github.com/ecomplus/cloud-commerce/issues/60)) ([3c0f5a4](https://github.com/ecomplus/cloud-commerce/commit/3c0f5a40afd7322b7eaaddfbfb193913df5cb264))
* **deps:** update dependency firebase-functions to v4 ([77627f5](https://github.com/ecomplus/cloud-commerce/commit/77627f539b9d3be4edb65506ee48be9e2fd56aeb))
* **firebase:** Update config `ssrFunctionOptions` to no min instances by default ([2bf0a52](https://github.com/ecomplus/cloud-commerce/commit/2bf0a52418267074a39e76aa7a3440c186b6a25f))
* Update `import logger from 'firebase-functions/logger'` for firebase-functions v4 ([1728d07](https://github.com/ecomplus/cloud-commerce/commit/1728d071dc1a00376a69619c8277d4f6a813da06))

### [0.0.125](https://github.com/ecomplus/cloud-commerce/compare/v0.0.124...v0.0.125) (2022-10-16)

### [0.0.124](https://github.com/ecomplus/cloud-commerce/compare/v0.0.123...v0.0.124) (2022-10-16)

### [0.0.123](https://github.com/ecomplus/cloud-commerce/compare/v0.0.122...v0.0.123) (2022-10-16)

### [0.0.122](https://github.com/ecomplus/cloud-commerce/compare/v0.0.120...v0.0.122) (2022-10-16)

### [0.0.121](https://github.com/ecomplus/cloud-commerce/compare/v0.0.120...v0.0.121) (2022-10-16)

### [0.0.120](https://github.com/ecomplus/cloud-commerce/compare/v0.0.119...v0.0.120) (2022-10-16)


### Bug Fixes

* **deps:** Update `@astrojs/image` and all non-major ([45be751](https://github.com/ecomplus/cloud-commerce/commit/45be751329030c7cace01571e111523f41af17d6))
* **ssr:** Add `@cloudcommerce/i18n` to pkg dependencies ([d3bf23d](https://github.com/ecomplus/cloud-commerce/commit/d3bf23da42c10ef7561fdcb3802ef2d50f7f1959))

### [0.0.119](https://github.com/ecomplus/cloud-commerce/compare/v0.0.118...v0.0.119) (2022-10-15)

### [0.0.118](https://github.com/ecomplus/cloud-commerce/compare/v0.0.117...v0.0.118) (2022-10-15)

### [0.0.117](https://github.com/ecomplus/cloud-commerce/compare/v0.0.116...v0.0.117) (2022-10-15)

### [0.0.116](https://github.com/ecomplus/cloud-commerce/compare/v0.0.115...v0.0.116) (2022-10-15)


### Features

* **api:** Export `{Resource}List` array types ([63884cf](https://github.com/ecomplus/cloud-commerce/commit/63884cf3c17107e464479087eb5d3c6159f709b2))
* **storefront:** Handle `@@components/*` with nested folders ([6562c84](https://github.com/ecomplus/cloud-commerce/commit/6562c845967b81c699a3ac0c838dcfbc6e1de17e))
* **storefront:** Header subcomponents for easy customization ([ba29efa](https://github.com/ecomplus/cloud-commerce/commit/ba29efa24d7311f27a4d9a8d0b8c1df1f8a51101))
* **storefront:** Improving header subcomponents ([2744b7c](https://github.com/ecomplus/cloud-commerce/commit/2744b7cf4230a13487f3e7ee271e198702ff1c8f))
* **storefront:** More header subcomponents ([32f37bd](https://github.com/ecomplus/cloud-commerce/commit/32f37bd8caf512b156263141894fa5726528622c))
* **storefront:** More header subcomponents ([48e56fb](https://github.com/ecomplus/cloud-commerce/commit/48e56fba439ac114a19487fb8f0d6022350ba924))
* **storefront:** New `form-button-content` slot on `LoginDrawer` component ([2e4e2d3](https://github.com/ecomplus/cloud-commerce/commit/2e4e2d3f270305e76cac4ccd4e8adc76367cebb0))


### Bug Fixes

* **config:** Preset `ECOM_*` env vars ([1734759](https://github.com/ecomplus/cloud-commerce/commit/173475998b21a37925852491b0b5afb55565f3a9))
* **deps:** Update Vue, Astro and other non-major dependencies ([688bb20](https://github.com/ecomplus/cloud-commerce/commit/688bb200454f40642426c90b4cc857c14c0847b8))
* **firebase:** Route with URL replaces to handle Hosting rewrites ([#59](https://github.com/ecomplus/cloud-commerce/issues/59)) ([3be5eae](https://github.com/ecomplus/cloud-commerce/commit/3be5eae2bb21408355206f9172d40db2de438d07))
* **storefront:** Add required `compilerOptions.baseUrl` for aliases ([c48f57a](https://github.com/ecomplus/cloud-commerce/commit/c48f57a6dc42c0587ab8c26974872f9fd60e66cf))
* **storefront:** Edit `ADrawer` to remove parent (header) brackdrop if any ([bf65fde](https://github.com/ecomplus/cloud-commerce/commit/bf65fde92cf136e661257e26bfad297925420940))
* **storefront:** Fix `apiState.categories` typedef (`CategoriesList`) ([15275ba](https://github.com/ecomplus/cloud-commerce/commit/15275ba31969322554135bf26893861798fc7abc))
* **storefront:** Fixing aliases, set `~` for src, `content` and `public` ([c7e28c6](https://github.com/ecomplus/cloud-commerce/commit/c7e28c6f2c7df88d4e66752c5c8998b51f0004f0))
* **storefront:** Fixing some PicoCSS base styles for Tailwind compatibilty ([b5743a9](https://github.com/ecomplus/cloud-commerce/commit/b5743a9a5bf2a1194c75ab54583c5d8dffd6f8c5))
* **storefront:** Increasing default nav link spacings ([9d0b3cf](https://github.com/ecomplus/cloud-commerce/commit/9d0b3cfff6bb28e6746dcaa8ed6e80bb9f518fd6))
* **storefront:** Set all `window.ECOM_*` globals for `ecomUtils` support ([ab3d90f](https://github.com/ecomplus/cloud-commerce/commit/ab3d90fe67b17457ef541baf4224ca0fcfc38996))
* **storefront:** Update PicoCSS typography for smoth font size responsive variation ([eb96802](https://github.com/ecomplus/cloud-commerce/commit/eb968024385e2342ecff2fd400f60f365282f7e3))
* **storefront:** Using `content` alias to import CMS JSONs instead of relative paths ([b818c5d](https://github.com/ecomplus/cloud-commerce/commit/b818c5d215b13c389c37402f158ea66a94b7868a))

### [0.0.115](https://github.com/ecomplus/cloud-commerce/compare/v0.0.114...v0.0.115) (2022-10-11)


### Features

* **storefront:** Setup `@[@storefront](https://github.com/storefront)` and `@[@components](https://github.com/components)` import aliases ([e24d271](https://github.com/ecomplus/cloud-commerce/commit/e24d271597bf1a8c037433ab3fcff37adccc0434))


### Bug Fixes

* **deps:** Bump dependency axios to v1 ([#58](https://github.com/ecomplus/cloud-commerce/issues/58)) ([229f798](https://github.com/ecomplus/cloud-commerce/commit/229f7986f6ba354935139d55aad2e7ecc130e51b))
* **deps:** Update all non-major dependencies ([#57](https://github.com/ecomplus/cloud-commerce/issues/57)) ([2082b79](https://github.com/ecomplus/cloud-commerce/commit/2082b793b58bf88a0808ae034f1fb4a58ab86d21))
* **storefront:** Remove link variations injected styles from lib ([b6ef5d8](https://github.com/ecomplus/cloud-commerce/commit/b6ef5d80a0b4ee22a2f855cd6402ac9e56dc03ea))

### [0.0.114](https://github.com/ecomplus/cloud-commerce/compare/v0.0.113...v0.0.114) (2022-10-09)

### [0.0.113](https://github.com/ecomplus/cloud-commerce/compare/v0.0.112...v0.0.113) (2022-10-09)


### Features

* **cli:** Handle `dev` (default) script to storefront dev server (`astro dev`) ([e3e8fcd](https://github.com/ecomplus/cloud-commerce/commit/e3e8fcdd73a56102cc1a75968461f3885697b6e5))
* **mercadopago:** Create Mercado Pago payment app ([#54](https://github.com/ecomplus/cloud-commerce/issues/54)) ([d4587b4](https://github.com/ecomplus/cloud-commerce/commit/d4587b485033cc48c1c005e5da67f976ac9df11b))
* **storefront:** Start passing deep props also for Astro components (layout -> header) ([12dbd89](https://github.com/ecomplus/cloud-commerce/commit/12dbd89624987d27289143bae8fb65c023bfe0a8))

### [0.0.112](https://github.com/ecomplus/cloud-commerce/compare/v0.0.111...v0.0.112) (2022-10-09)

### [0.0.111](https://github.com/ecomplus/cloud-commerce/compare/v0.0.110...v0.0.111) (2022-10-09)


### Bug Fixes

* **deps:** Update astro to v1.4 (lastest) again ([1a7a737](https://github.com/ecomplus/cloud-commerce/commit/1a7a737d1425abc6af4f599c83f113ee4a02cdd0))
* **storefront:** Remove default `firebaseConfig` from lib ([ad08c6c](https://github.com/ecomplus/cloud-commerce/commit/ad08c6c1cb3084b05c31fea04d1371d7fb44b9d1))

### [0.0.110](https://github.com/ecomplus/cloud-commerce/compare/v0.0.109...v0.0.110) (2022-10-06)


### Features

* **modules:** Schema updates from https://github.com/ecomplus/modules-api/releases/tag/v0.12.53 ([32dedbb](https://github.com/ecomplus/cloud-commerce/commit/32dedbb4c835c551892e826fa70e462fa02d1a95))
* **storefront:** Setup `state/customer-session` with Nano Stores for authentication ([c02eab9](https://github.com/ecomplus/cloud-commerce/commit/c02eab953f4609c3a84d6ec554a0d781892b4791))
* **storefront:** Update `LoginDrawer` handling customer session ([86b5a49](https://github.com/ecomplus/cloud-commerce/commit/86b5a496e33a7e8509c0553651470d11a92e68a7))
* **types:** Add `{Resource}Set` types without auto set doc properties ([9be7c0b](https://github.com/ecomplus/cloud-commerce/commit/9be7c0b18a1b7128796d4146796311bdbf699b44))


### Bug Fixes

* **api:** Better type defs for list requests results (partial docs with IDs) ([8f407c2](https://github.com/ecomplus/cloud-commerce/commit/8f407c23a1674a032a8f44a5330646af2a081dd4))
* **frenet:** Calculate shipping updates with https://github.com/ecomplus/app-frenet/tree/v0.2.32 ([b6d21c0](https://github.com/ecomplus/cloud-commerce/commit/b6d21c0663448032ed34b5f703a1861c16406d8d))
* **modules:** Properly handling modules API base URL on checkout ([968c90a](https://github.com/ecomplus/cloud-commerce/commit/968c90a4a865ab55f0d6781119a1a2555e305efb))
* **modules:** Update checkout params and typedef to require `customer` field ([0c2ac51](https://github.com/ecomplus/cloud-commerce/commit/0c2ac517856329fae52ec0ee3e22635baf7c1056))
* **passport:** Must check `email_verified` to generate customer access token ([26674b4](https://github.com/ecomplus/cloud-commerce/commit/26674b46515c0a795b04ffc3d9864b49d4a54994))
* **passport:** Receive token from (web standard) Authorization header instead ([31d2a71](https://github.com/ecomplus/cloud-commerce/commit/31d2a718f42f234f6d790dd160910bfab232ecf0))
* **storefront:** Check customer session `isAuthorized` with token expires +10s ([3a33701](https://github.com/ecomplus/cloud-commerce/commit/3a3370184d15eaaa0995021384209d7abeb52c35))

### [0.0.109](https://github.com/ecomplus/cloud-commerce/compare/v0.0.108...v0.0.109) (2022-10-04)


### Features

* **storefront:** Start handling email link sign in within `LoginForm` ([a1f17bb](https://github.com/ecomplus/cloud-commerce/commit/a1f17bba3cb8a4ec78deaefcb8caac3736d7e4f5))


### Bug Fixes

* **deps:** Update all non-major dependencies ([c5d6f56](https://github.com/ecomplus/cloud-commerce/commit/c5d6f56c37edbadc04dbcefae35408118bc22111))

### [0.0.108](https://github.com/ecomplus/cloud-commerce/compare/v0.0.107...v0.0.108) (2022-10-01)


### Bug Fixes

* **ssr:** Add `@astrojs/image` to direct pkg dependencies ([d2b79ef](https://github.com/ecomplus/cloud-commerce/commit/d2b79ef9ae4dce6e1e6013a0d9445a9a0f28fdfd))

### [0.0.107](https://github.com/ecomplus/cloud-commerce/compare/v0.0.106...v0.0.107) (2022-10-01)


### Features

* **i18n:** Setup new `@cloudcommerce/i18n` pkg ([bd02d8b](https://github.com/ecomplus/cloud-commerce/commit/bd02d8beaff45597947da2efdfac96dcce878c1e))
* **storefront:** Basic `LoginForm` component interactions for sign in/up ([eb5b462](https://github.com/ecomplus/cloud-commerce/commit/eb5b462dbbf13840572e531295ab57f18022873e))
* **storefront:** Supporting SSG (for branch previews) with `BIULD_OUTPUT` env ([4330c0f](https://github.com/ecomplus/cloud-commerce/commit/4330c0f10ee5c8e6d44c970085d9e2a185ad1937))


### Bug Fixes

* **modules:** Properly adding order transaction on checkout ([#55](https://github.com/ecomplus/cloud-commerce/issues/55)) ([b27e83d](https://github.com/ecomplus/cloud-commerce/commit/b27e83d19e07c050e50db2fc083e362ae08e67a1))
* **ssr:** Remove CSL header at all (yet) ([6a68407](https://github.com/ecomplus/cloud-commerce/commit/6a684079803cdd3e2f5903b333696233d4bf7368))
* **ssr:** Setup feeds function with 512MiB by default ([a55de47](https://github.com/ecomplus/cloud-commerce/commit/a55de4781d92973a3c860ae6e69be43a5f08f5ff))
* **storefront:** Removing Tailwind incompatible .outline (button) classes from pico.css ([4598955](https://github.com/ecomplus/cloud-commerce/commit/4598955b23dfc2e6f7da1908576654b09771afe0))

### [0.0.106](https://github.com/ecomplus/cloud-commerce/compare/v0.0.105...v0.0.106) (2022-09-29)


### Bug Fixes

* **ssr:** Change `Content-Security-Policy` header to `script-src "none"` ([51b8536](https://github.com/ecomplus/cloud-commerce/commit/51b8536cee1a70143df959e2536dd0fe0a1ee985))

### [0.0.105](https://github.com/ecomplus/cloud-commerce/compare/v0.0.104...v0.0.105) (2022-09-29)


### Features

* **cli:** Update `firebase.json` with rewrites for sitemap and feeds ([019356e](https://github.com/ecomplus/cloud-commerce/commit/019356eaa6df494af898702fb89e12eb213389bb))
* **ssr:** Getting deploy options from config `ssrFunctionOptions` ([c795e90](https://github.com/ecomplus/cloud-commerce/commit/c795e90b2e8b9f463d571763e19b9f4508b5fd1a))


### Bug Fixes

* **cli:** Updating default SSR function region to `us-central1` ([9f76842](https://github.com/ecomplus/cloud-commerce/commit/9f76842356a23800c44e82e2125bd7ad1b5b0963))
* **passport:** Memory 128MiB option may be overwritten with `httpsFunctionOptions` ([a23fb67](https://github.com/ecomplus/cloud-commerce/commit/a23fb67100679c20103877c453c18d813fee8ac1))
* **ssr:** Hardset XSS/CSP security response headers ([6e20063](https://github.com/ecomplus/cloud-commerce/commit/6e200630c064fff1fa89a6cee9196b7d0165ad1d))
* **ssr:** Update default function deploy options ([c1d3cbd](https://github.com/ecomplus/cloud-commerce/commit/c1d3cbddaec4b5a0111dd9d0f4e9476e28aac283))
* **storefront:** Remove unecessary (startup time) import/start `firebase/app` ([f4b80ec](https://github.com/ecomplus/cloud-commerce/commit/f4b80ec2ab91feb40d0a00edfb19b16654661863))

### [0.0.104](https://github.com/ecomplus/cloud-commerce/compare/v0.0.103...v0.0.104) (2022-09-28)

### [0.0.103](https://github.com/ecomplus/cloud-commerce/compare/v0.0.102...v0.0.103) (2022-09-27)


### Bug Fixes

* **ssr:** Add `astro` to pkg dependencies and remove Astro subdependencies ([4ff62b3](https://github.com/ecomplus/cloud-commerce/commit/4ff62b377b6a76bb78ea95ef83d59674ad051252))

### [0.0.102](https://github.com/ecomplus/cloud-commerce/compare/v0.0.101...v0.0.102) (2022-09-27)

### [0.0.101](https://github.com/ecomplus/cloud-commerce/compare/v0.0.100...v0.0.101) (2022-09-27)


### Features

* **firebase:** Get additional deploy options from `process.env` ([b6c38e3](https://github.com/ecomplus/cloud-commerce/commit/b6c38e309fea94bf27eadc2f03ca697c73f56360))


### Bug Fixes

* **firebase:** Update config `httpsFunctionOptions` type def with optional props ([ff91e72](https://github.com/ecomplus/cloud-commerce/commit/ff91e723a919f2e0d6369da7a2f904691a619bab))
* **modules:** Trying default deloy options with concurrency 12 ([5052ac6](https://github.com/ecomplus/cloud-commerce/commit/5052ac6b6c93b18d2979c39d5f88cf6c458b5794))

### [0.0.100](https://github.com/ecomplus/cloud-commerce/compare/v0.0.99...v0.0.100) (2022-09-27)


### Bug Fixes

* **storefront:** Replace `@ecomplus/i18n` with local dictionary modules ([1e236a6](https://github.com/ecomplus/cloud-commerce/commit/1e236a6c0062163e7f5558513af0f1831d48b3b4))

### [0.0.99](https://github.com/ecomplus/cloud-commerce/compare/v0.0.98...v0.0.99) (2022-09-27)


### Bug Fixes

* **storefront:** Bump `@ecomplus/i18n` and fix alias to .mjs ([fa33b44](https://github.com/ecomplus/cloud-commerce/commit/fa33b44ffa63d48f3de075d44cf09d9e4066f9fe))

### [0.0.98](https://github.com/ecomplus/cloud-commerce/compare/v0.0.97...v0.0.98) (2022-09-27)


### Bug Fixes

* **storefront:** Fix handling `loginOffcanvasProps` from Astro component ([1897907](https://github.com/ecomplus/cloud-commerce/commit/1897907ecb948b476ffbd8d3916e8a452f541421))

### [0.0.97](https://github.com/ecomplus/cloud-commerce/compare/v0.0.96...v0.0.97) (2022-09-27)


### Features

* **storefront:** Login offcanvas with first Firebase Auth interaction ([01519b0](https://github.com/ecomplus/cloud-commerce/commit/01519b0af00fda5db95eab69dddd6e96869f1e44))


### Bug Fixes

* **app-correios:** XML parsing fix to json ([#52](https://github.com/ecomplus/cloud-commerce/issues/52)) ([58a922f](https://github.com/ecomplus/cloud-commerce/commit/58a922f125640b24ee5a132d74f13a8400da4fee))
* **deps:** Update all non-major dependencies ([#51](https://github.com/ecomplus/cloud-commerce/issues/51)) ([8d447a2](https://github.com/ecomplus/cloud-commerce/commit/8d447a23868ec5e07211ba3058e535c3ddf3681a))
* **storefront:** Edit `pico.css` styles to remove link background on focus ([fd14624](https://github.com/ecomplus/cloud-commerce/commit/fd14624e56c6989ac1c98acc34370a7634b3af53))

### [0.0.96](https://github.com/ecomplus/cloud-commerce/compare/v0.0.95...v0.0.96) (2022-09-24)


### Bug Fixes

* **storefront:** Image size input with full image path using `STOREFRONT_BASE_DIR` ([59bb3f6](https://github.com/ecomplus/cloud-commerce/commit/59bb3f67fb074536fa280326ae8c268187b065f7))
* **storefront:** Must always set `process.env.STOREFRONT_BASE_DIR` instead of `import.meta.env` ([d4b0812](https://github.com/ecomplus/cloud-commerce/commit/d4b0812e4119119c4ac6489bbee7116b4927ac74))

### [0.0.95](https://github.com/ecomplus/cloud-commerce/compare/v0.0.94...v0.0.95) (2022-09-24)


### Bug Fixes

* **storefront:** Prevent error with undefined `import.meta.env` on config ([19ffb5b](https://github.com/ecomplus/cloud-commerce/commit/19ffb5bcc859d972d17ba45e4d0ad739333d38ad))

### [0.0.94](https://github.com/ecomplus/cloud-commerce/compare/v0.0.93...v0.0.94) (2022-09-24)


### Bug Fixes

* **storefront:** Properly resolve base dir with `STOREFRONT_BASE_DIR` env from cwd ([0ae3512](https://github.com/ecomplus/cloud-commerce/commit/0ae35122d757ce7bd1381d7b5262f55f330e79c7))

### [0.0.93](https://github.com/ecomplus/cloud-commerce/compare/v0.0.92...v0.0.93) (2022-09-24)


### Features

* **modules:** Add checkout handler to Modules API ([#49](https://github.com/ecomplus/cloud-commerce/issues/49)) ([febf332](https://github.com/ecomplus/cloud-commerce/commit/febf3326ec4951416802b9afa7a6c92c948cd5cf))


### Bug Fixes

* **cli:** Fix ignored Storefront source files for SSR function deploy on `firebase.json` ([11b9d05](https://github.com/ecomplus/cloud-commerce/commit/11b9d05c9fa5bd43acfe99e24c24f1f5dd50ac38))

### [0.0.92](https://github.com/ecomplus/cloud-commerce/compare/v0.0.91...v0.0.92) (2022-09-23)

### [0.0.91](https://github.com/ecomplus/cloud-commerce/compare/v0.0.90...v0.0.91) (2022-09-23)


### Bug Fixes

* **cli:** Update default `firebase.json` isolating storefront deps for SSR deploy ([7b491b1](https://github.com/ecomplus/cloud-commerce/commit/7b491b13dbef4512c48ba4b4cb8835d84040b458))

### [0.0.90](https://github.com/ecomplus/cloud-commerce/compare/v0.0.89...v0.0.90) (2022-09-23)

### [0.0.89](https://github.com/ecomplus/cloud-commerce/compare/v0.0.88...v0.0.89) (2022-09-23)


### Bug Fixes

* **ssr:** Directly add compiled server function dependencies ([f87e4b1](https://github.com/ecomplus/cloud-commerce/commit/f87e4b1db76a4b6480cc89a3a76da7693932fefe))

### [0.0.88](https://github.com/ecomplus/cloud-commerce/compare/v0.0.87...v0.0.88) (2022-09-23)

### [0.0.87](https://github.com/ecomplus/cloud-commerce/compare/v0.0.86...v0.0.87) (2022-09-23)


### Bug Fixes

* **storefront:** Fix `getImage` helper to transform images using high resolution sizes ([de12963](https://github.com/ecomplus/cloud-commerce/commit/de12963acdd1b74088a61994d80e60a7dc080ce4))
* **storefront:** Remove `.container` and `.grid` from pico.css and to compose layout with utils ([a216f33](https://github.com/ecomplus/cloud-commerce/commit/a216f338de39765c04fddb515deb10ea16e0c438))
* **storefront:** Reorganizing Astro pages/layouts to fix wrong /html before /body ([ec518f6](https://github.com/ecomplus/cloud-commerce/commit/ec518f687d15e960801b78f6ff8b200634be5160))

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
