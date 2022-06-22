# Contribution guidelines

:blush:

## Prepare your environment

```bash
npm i -g pnpm firebase-tools
```

Clone this repo to your local machine and install the dependencies:

```bash
pnpm install
```

### Setup Firebase

You may create a Firebase project to test or just setup emulators to test locally:

```
firebase init emulators
```

Select emulators for _Authentication_, _Hosting_, _Functions_, _Firestore_ and _Pub/Sub_.  
You can skip the last two if you're willing to work with Storefront only, and the first two if willing to work if app(s) only.
