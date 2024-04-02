/// <reference types="astro/client" />
/// <reference types="vue/ref-macros" />
/// <reference types="../client" />
/// <reference types="../server" />
/// <reference types="react" />

declare module '*.vue' {
  import { type DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
