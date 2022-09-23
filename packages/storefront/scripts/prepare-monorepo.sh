#!/bin/bash

rm -rf content && ln -s ../../store/functions/ssr/storefront/content content
rm -rf public && ln -s ../../store/functions/ssr/storefront/public public
