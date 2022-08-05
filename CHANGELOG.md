# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
