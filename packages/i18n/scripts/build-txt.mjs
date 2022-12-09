#!/usr/bin/env zx
/* eslint-disable no-console, no-await-in-loop, import/no-unresolved */
/* global $ */
import 'zx/globals';
import all from '../lib/all.js';

const __dirname = new URL('.', import.meta.url).pathname;
$.cwd = __dirname;
$.verbose = false;

const langs = Object.keys(all);
for (let i = 0; i < langs.length; i++) {
  const lang = langs[i];
  const folder = `../lib/${lang}`;
  await $`mkdir -p ${folder}`;
  const i19 = all[lang];
  const words = Object.keys(i19);
  for (let ii = 0; ii < words.length; ii++) {
    const word = words[ii];
    const text = i19[word];
    if (typeof text === 'string') {
      const file = `${folder}/${word}.txt`;
      await $`echo -n ${text} > ${file}`;
    }
  }
}
