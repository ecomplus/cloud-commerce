#!/bin/bash

rm -rf lib
npx tsc --outDir lib
find lib -type f -name "*.js" -print0 | xargs -0 sed -i -r "s/(import [^']+)'(\\.[^']+)';/\\1'\\2.js';/g"
npx eslint --rule 'max-len: off' --ext .js lib --fix
