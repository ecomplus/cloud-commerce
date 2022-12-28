# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
