#!/bin/bash

cd ecomplus-stores/$1
rm -rf node_modules package-lock.json
rm -rf functions/*/node_modules functions/*/package-lock.json
npm i

for dir in functions/*; do
  if [[ -d "$dir" ]]; then
    echo $dir
    cd $dir
    npm i
    cd ../../
  fi
done

cd ../../
