#!/bin/bash

if [ -z "$PAGARMEV5_API_TOKEN" ]; then
  echo -e "PAGARMEV5_API_TOKEN not set\n"
elif [ -z "$PAGARMEV5_PUBLIC_KEY" ]; then
  echo -e "PAGARMEV5_PUBLIC_KEY not set\n"
else
  node --test tests/
fi
