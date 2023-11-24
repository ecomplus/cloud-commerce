#!/bin/bash

if [ -z "$CORREIOS_POSTCARD" ]; then
  echo -e "CORREIOS_POSTCARD not set\n"
elif [ -z "$CORREIOS_USER" ]; then
  echo -e "CORREIOS_USER not set\n"
elif [ -z "$CORREIOS_ACCESS_CODE" ]; then
  echo -e "CORREIOS_ACCESS_CODE not set\n"
else
  node --test tests/
fi
