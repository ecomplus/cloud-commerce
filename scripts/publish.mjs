#!/usr/bin/env zx
/* eslint-disable no-console */
/* global $ */

const { RELEASE_PLEASE_OUTPUT } = process.env;
console.log({ RELEASE_PLEASE_OUTPUT });

const outputs = JSON.parse(RELEASE_PLEASE_OUTPUT);

Object.keys(outputs).forEach((key) => {
  const value = outputs[key];
  const match = key.match(/^(.*\/.*)--release_created$/);
  if (!match || !value) {
    return;
  }
  const workspace = match[1];
  await $`npm publish -w ${workspace} --access public`;
});
