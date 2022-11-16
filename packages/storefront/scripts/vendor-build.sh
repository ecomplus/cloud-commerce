#!/bin/bash

cd vendor/sfui
for filepath in src/components/**/**/*.vue
do
  filename=$(basename -- "$filepath")
  extension="${filename##*.}"
  component="${filename%.*}"
  if [[ $component == Sf* ]]
  then
    printf "import $component from './$filepath';
export default $component;
" > "$component.js"
  fi
done
cd ../..
