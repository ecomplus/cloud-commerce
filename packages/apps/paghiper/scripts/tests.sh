#!/bin/bash

# List payments and due date parsing are pure, no PagHiper nor Store API
# credentials needed, just stub env vars for `@cloudcommerce/firebase` config.
export SETTINGS_FILEPATH="$(pwd)/tests/settings.json"
export ECOM_STORE_ID="${ECOM_STORE_ID:-1011}"
export ECOM_AUTHENTICATION_ID="${ECOM_AUTHENTICATION_ID:-000000000000000000000000}"
export ECOM_API_KEY="${ECOM_API_KEY:-test}"
export PAGHIPER_API_KEY="${PAGHIPER_API_KEY:-apk_test}"

if [ ! -d lib ]; then
  echo -e "Run \`pnpm build\` before testing\n"
  exit 1
fi

node --test tests/
