#!/bin/bash

if [[ ! -z "$1" ]]; then
  cp -r packages/__skeleton packages/$1
  find packages/$1 -type f -exec sed -i -e "s/__skeleton/$1/g" {} \;
else
  echo "Usage: pnpm new-pkg <package-name>"
fi
