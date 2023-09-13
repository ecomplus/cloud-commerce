#!/bin/bash

if [ -z ${MERCADOPAGO_TOKEN+x} ]; then
  echo -e "MERCADOPAGO_TOKEN not set\n"
else
  node --test tests/
fi
