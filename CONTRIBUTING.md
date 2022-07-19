# Contribution guidelines

:blush:

## Prepare your environment

```console
npm i -g pnpm firebase-tools
```

Clone this repo to your local machine and install the dependencies:

```console
git clone --recurse-submodules git@github.com:ecomplus/cloud-commerce.git
cd cloud-commerce
pnpm install
```

### Setup Firebase

You may create a Firebase project to test or just setup emulators to test locally:

```console
firebase init emulators
```

Select emulators for _Authentication_, _Hosting_, _Functions_, _Firestore_, _Pub/Sub_ and  _Storage_.  
You can skip the last three if you're willing to work with Storefront only, and the first two if willing to work if app(s) only.

#### Creating a Firebase project

If you want to deploy to a new Firebase project (needed for larger changes):

1. Start creating new project on [Firebase console](https://console.firebase.google.com/):
    - Set a nice project name (ID) and remember it;
    - You may enable Firebase Analytics for enhanced remote config options and A/B testing;

2. Go to _Firestore Database_ page (on sidebar) and _create database_:
    - Just bypass with default production mode and rules;
    - Select region `us-east1` (recommended);

3. Firebase free plan doesn't support sending external HTTP requests, so you'll need to upgrade to _Blaze_ (on demand) plan;

4. Go to `/store` folder and edit `.firebaserc` setting your project ID (don't commit this file);

5. Deploy with `firebase login && npm run deploy`;

## Development 

To emulate Firebase and serve starter Store locally, run the following command on the monorepo root:

```console
pnpm serve
```

To run tests for all packages:

```console
pnpm test
```
