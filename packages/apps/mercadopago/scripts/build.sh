#!/bin/bash

rm firebase.ts
node ../../../scripts/public-apps-minification.mjs mercadopago 
sh ../../../scripts/build-lib.sh

echo "/* eslint-disable */ 
export * from './lib/firebase'" >> firebase.ts
