#!/bin/bash

rm -rf lib
tsc --outDir lib
cp -r src/types lib/
npx eslint --rule 'max-len: off' --ext .js lib --fix
