# Contribution guidelines

:blush:

## Prepare your environment

```console
npm i -g pnpm firebase-tools
```

Clone this repo to your local machine and install the dependencies:

```console
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

If you want to deploy to a new Firebase project:

1. Start creating new project on [Firebase console](https://console.firebase.google.com/):
    - Analytics is not needed;
    - Set a nice project name (ID) and remember it;

2. Go to _Firestore Database_ page (on sidebar) and _create database_:
    - Just bypass with default production mode and rules;
    - Select region `us-east1` (recommended);

3. Firebase free plan doesn't support sending external HTTP requests, so you'll need to upgrade to _Blaze_ (on demand) plan;

4. Then run `firebase login && firebase init` and select the created project;
