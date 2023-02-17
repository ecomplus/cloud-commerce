/// <reference types="@astrojs/image/client" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vue/ref-macros" />
/// <reference types="../client" />
/// <reference types="../server" />

/* eslint-disable import/newline-after-import */

declare module '*.vue' {
  import { type DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
