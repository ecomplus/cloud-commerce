#!/bin/bash

node --test tests-unit/ || exit 1

if [ -z "$FRENET_TOKEN" ]; then
  echo -e "FRENET_TOKEN not set\n"
else
  node --test tests/
fi
