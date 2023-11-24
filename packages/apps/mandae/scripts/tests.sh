#!/bin/bash

if [ -z "$MANDAE_TOKEN" ]; then
  echo -e "MANDAE_TOKEN not set\n"
else
  node --test tests/
fi
