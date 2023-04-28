#!/bin/bash

rm -rf content && ln -s ../../store/functions/ssr/content content
rm -rf public && ln -s ../../store/functions/ssr/public public
rm -rf src/content && ln -s ../../../store/functions/ssr/src/content src/content
rm -rf src/pages && ln -s ../../../store/functions/ssr/src/pages src/pages
rm -rf src/layouts && ln -s ../../../store/functions/ssr/src/layouts src/layouts
rm -rf src/main && ln -s ../../../store/functions/ssr/src/main src/main
rm -rf src/components && ln -s ../../../store/functions/ssr/src/components src/components
rm -rf src/scripts && ln -s ../../../store/functions/ssr/src/scripts src/scripts
rm -rf src/assets && ln -s ../../../store/functions/ssr/src/assets src/assets
rm -rf tina && ln -s ../../store/functions/ssr/tina tina
