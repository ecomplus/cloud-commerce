/* eslint-disable no-unused-vars */

import type { AttributifyAttributes } from '@unocss/preset-attributify';

declare global {
  namespace astroHTML.JSX {
    interface HTMLAttributes extends AttributifyAttributes { }
  }
}

declare module '@vue/runtime-dom' {
  interface HTMLAttributes {
    [key: string]: any
  }
}

declare module '@vue/runtime-core' {
  interface AllowedComponentProps {
    [key: string]: any
  }
}

export {};
