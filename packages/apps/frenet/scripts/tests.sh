#!/bin/bash

if [ -z ${FRENET_TOKEN+x} ]; then
  echo -e "FRENET_TOKEN not set\n"
else
  node --test tests/
fi
