/* eslint-disable */
import 'astro';

type ContextEvent = 'data:categories' | 'data:grids' /* | `data:${string}` */;
type ClientContextOptions<HS> = HS | ContextEvent
  | `${ContextEvent},${HS}`
  | Array<HS | ContextEvent>;

declare module 'astro' {
  interface AstroClientDirectives {
    /** @deprecated use `client:sf` (storefront context) instead */
    'client:context'?: boolean | ClientContextOptions<'idle'>;
    'client:sf'?: 'eager' | 'eager,interaction' | 'load' | 'load,interaction'
      | Exclude<ClientContextOptions<'interaction'>, 'interaction'>
      | ClientContextOptions<'lazy' | 'lazy,interaction'>;
  }
}
