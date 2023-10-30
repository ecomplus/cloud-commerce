/* eslint-disable */
import 'astro';

declare module 'astro' {
  interface AstroClientDirectives {
    'client:context'?: boolean | 'idle';
  }
}
