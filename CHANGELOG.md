# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
