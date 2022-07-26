#!/bin/bash

function build_schema {
  cjs_filepath=$1
  noext_file=${cjs_filepath/.cjs/}
  output_path=${noext_file/\/schemas/\/schemas\/types}
  json_filepath=$base_output_file.json
  schema_filepath=$base_output_file.schema.json
  ts_filepath=$base_output_file.d.ts

  echo $noext_file
  node -p "const { params, response } = require('$cjs_filepath'); \
  console.error(JSON.stringify(params, null, 2)); \
  JSON.stringify(response || {}, null, 2);" \
    > $output_path:response.json 2> $output_path:params.json

  npx json2ts -i $output_path:params.json -o $output_path:params.d.ts \
    --ignoreMinAndMaxItems --style.singleQuote
  if [[ ! $noext_file =~ @checkout$ ]]; then
    npx json2ts -i $output_path:response.json -o $output_path:response.d.ts \
      --ignoreMinAndMaxItems --style.singleQuote
  fi
  rm $output_path:params.json $output_path:response.json
  echo '✓ OK'
}

if [[ ! -z "$1" ]]; then
  build_schema $1
else
  for filepath in $(find schemas/ -type f -print)
  do
    if [[ $filepath =~ \.cjs$ ]]; then
      build_schema $(pwd)/$filepath
    fi
  done
fi
