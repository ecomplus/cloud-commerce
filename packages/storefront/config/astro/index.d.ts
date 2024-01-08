/* eslint-disable */
import 'astro';

type ClientContextOption = 'idle' | `data:${string}`;

declare module 'astro' {
  interface AstroClientDirectives {
    'client:context'?: boolean | ClientContextOption | ClientContextOption[];
  }
}
