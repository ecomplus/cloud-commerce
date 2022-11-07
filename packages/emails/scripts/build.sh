#!/bin/bash

sh ../../scripts/build-lib.sh
cp -r src/types lib/

if [ -d "./content" ]; then
  cp ../storefront/content/settings.json content/settings.json
else
  mkdir content
  cp ../storefront/content/settings.json content/settings.json
fi
