/// <reference types="astro/astro-jsx" />
import type { HTMLAttributes } from 'astro/types';
import type { GetPictureParams, GetPictureResult } from './picture-base';
import type { OutputFormat, TransformOptions } from './get-built-image';
import { resolve as resolvePath, basename } from 'node:path';

export interface PictureComponentRemoteImageProps
  extends astroHTML.JSX.HTMLAttributes,
    TransformOptions,
    Pick<HTMLAttributes<'img'>, 'loading' | 'decoding' | 'fetchpriority'> {
  src: string;
  alt: string;
  widths: number[];
  aspectRatio: TransformOptions['aspectRatio'];
  sizes?: HTMLImageElement['sizes'];
  formats?: OutputFormat[];
  background?: TransformOptions['background'];
}

export type PictureProps = Omit<PictureComponentRemoteImageProps, 'aspectRatio' | 'sizes'> & {
  sizes?: string;
  aspectRatio?: PictureComponentRemoteImageProps['aspectRatio'];
  fetchpriority?: 'high' | 'low' | 'auto';
  hasImg?: boolean;
};

export type ImageSize = { width?: number, height?: number };

export type TryImageSize = (src: string) => ImageSize;

const resetGlobalAstroAssets = () => {
  if (!globalThis.astroAsset) return;
  if (!globalThis.astroAsset.staticImages) {
    globalThis.astroAsset.staticImages = new Map();
    // @ts-expect-error: Internal `__ready`.
  } else if (globalThis.astroAsset.staticImages.get.__ready) {
    return;
  }
  const _get = globalThis.astroAsset.staticImages.get;
  const _set = globalThis.astroAsset.staticImages.set;
  const publicDir = resolvePath(import.meta.env.STOREFRONT_BASE_DIR, 'public');
  globalThis.astroAsset.staticImages.get = function get(...args) {
    if (args[0].includes(publicDir)) {
      args[0] = args[0].replace(publicDir, '');
    }
    return _get.apply(globalThis.astroAsset.staticImages, args);
  };
  // @ts-expect-error: Internal `__ready`.
  globalThis.astroAsset.staticImages.get.__ready = true;
  globalThis.astroAsset.staticImages.set = function set(...args) {
    if (args[0].includes(publicDir)) {
      args[0] = args[0].replace(publicDir, '');
    }
    const _transformsSet = args[1].transforms.set;
    args[1].transforms.set = function transformsSet(...transformArgs) {
      const { finalPath } = transformArgs[1];
      if (finalPath.includes(publicDir)) {
        transformArgs[1].finalPath = `/_astro/${basename(finalPath)}`;
      }
      return _transformsSet.apply(args[1].transforms, transformArgs);
    };
    return _set.apply(globalThis.astroAsset.staticImages, args);
  };
};
resetGlobalAstroAssets();

const getAspectRatio = (src: string | ImageSize, tryImageSize: TryImageSize) => {
  if (typeof src === 'string') {
    src = tryImageSize(src);
  }
  if (src.width) {
    return src.height ? src.width / src.height : 1;
  }
  return 0;
};

export type UsePictureParams = PictureProps & {
  tryImageSize: TryImageSize;
  getPicture: ((params: GetPictureParams) => Promise<GetPictureResult>)
    | ((params: GetPictureParams) => Promise<GetPictureResult>);
  assetsPrefix?: string;
};

const useSSRPicture = async (params: UsePictureParams) => {
  resetGlobalAstroAssets();
  const {
    src,
    alt,
    sizes: propSizes,
    widths,
    aspectRatio: propAspectRatio,
    fit,
    background,
    position,
    formats = ['avif', 'webp'],
    loading = 'lazy',
    decoding = 'async',
    hasImg = true,
    tryImageSize,
    getPicture,
    assetsPrefix,
    ...attrs
  } = params;

  let aspectRatio: number | undefined;
  if (propAspectRatio) {
    if (typeof propAspectRatio === 'number') {
      aspectRatio = propAspectRatio;
    } else {
      const [width, height] = propAspectRatio.split(':');
      aspectRatio = Number(width) / Number(height);
    }
  } else if ((!attrs.width || !attrs.height) && typeof src === 'string') {
    const { width, height } = tryImageSize(src);
    if (width && height) {
      aspectRatio = getAspectRatio({ width, height }, tryImageSize);
      let hasSplicedWidths = false;
      for (let i = widths.length - 1; i >= 0; i--) {
        if (widths[i] > width) {
          widths.splice(i, 1);
          hasSplicedWidths = true;
        }
      }
      if (hasSplicedWidths) {
        attrs.width = width;
        attrs.height = height;
        if (!widths.find((w) => w === width)) {
          widths.push(width);
        }
      } else {
        attrs.width = Math.max(...widths);
        attrs.height = Math.round(attrs.width / aspectRatio);
      }
    }
  }
  let sizes: string = propSizes || '';
  let media: string | undefined;
  if (!sizes && attrs.class) {
    const classNames = attrs.class.split(/\s+/);
    let nextSize: string | undefined;
    const breakpoints = {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    };
    ([
      ['', 0],
      ...Object.entries(breakpoints),
    ] as Array<[string, number]>).forEach(([breakpoint, minWidth]) => {
      const maxWClassRegex = breakpoint
        ? new RegExp(`^${breakpoint}:max-w-(\\[\\w+\\]|screen-\\w+)$`)
        : /^max-w-(\[\w+\]|screen-\w+)$/;
      let classMaxW: string | undefined;
      classNames.find((_class) => {
        const maxW = _class.replace(maxWClassRegex, '$1');
        if (maxW !== _class) {
          classMaxW = maxW;
          return true;
        }
        return false;
      });
      if (classMaxW) {
        if (nextSize) {
          // max-w-50px sm:max-w-[... => (max-width: 639px) 50px...
          if (sizes) sizes += ', ';
          sizes += `(max-width: ${(minWidth - 1)}px) ${nextSize}`;
        }
        if (classMaxW.charAt(0) === '[') {
          // [100px] => 100px
          nextSize = classMaxW.slice(1, classMaxW.length - 1);
        } else {
          // screen-2xl => 1536px
          const screenSize = breakpoints[classMaxW.slice(7)];
          if (screenSize) {
            nextSize = `${screenSize}px`;
          }
        }
      }
    });
    if (nextSize) {
      if (sizes) sizes += ', ';
      sizes += nextSize;
    }
    const ascBreakpoints = Object.keys(breakpoints).sort((a, b) => {
      return breakpoints[a] - breakpoints[b];
    }) as Array<keyof typeof breakpoints>;
    if (classNames.includes('hidden')) {
      for (let i = 0; i < ascBreakpoints.length; i++) {
        const bp = ascBreakpoints[i];
        const displayClassRegex = new RegExp(`${bp}:(block|inline|flex|grid)`);
        if (classNames.some((_class) => displayClassRegex.test(_class))) {
          media = `(min-width: ${breakpoints[bp]}px)`;
          break;
        }
      }
    } else {
      for (let i = 0; i < ascBreakpoints.length; i++) {
        const bp = ascBreakpoints[i];
        if (classNames.includes(`${bp}:hidden`)) {
          media = `(max-width: ${breakpoints[bp]}px)`;
          break;
        }
      }
    }
  }
  if (!sizes && widths.length === 1) {
    sizes = `${(widths[0] / 2)}px`;
  }

  const { image, sources } = await getPicture({
    src,
    widths,
    formats,
    aspectRatio,
    fit,
    background,
    position,
    alt,
  });
  delete image.width;
  delete image.height;
  if (import.meta.env.PROD && assetsPrefix && image.src?.charAt(0) === '/') {
    image.src = `${assetsPrefix}${image.src}`;
    sources.forEach((source) => {
      source.srcset = `${assetsPrefix}${source.srcset}`
        .replace(/,\//g, `,${assetsPrefix}/`);
    });
  }

  const pictureAttrs: Partial<typeof attrs & { alt: string }> = {};
  if (!hasImg) {
    pictureAttrs['data-alt'] = alt;
    Object.assign(pictureAttrs, attrs);
    delete pictureAttrs.width;
    delete pictureAttrs.height;
  }
  const imgAttrs = !hasImg ? null : {
    ...image,
    alt,
    loading,
    decoding,
    ...attrs,
  };
  if (imgAttrs?.src && sources.length) {
    imgAttrs.src = null;
  }

  return {
    sizes,
    media,
    aspectRatio,
    sources,
    pictureAttrs,
    imgAttrs,
  };
};

export default useSSRPicture;

export { useSSRPicture };
