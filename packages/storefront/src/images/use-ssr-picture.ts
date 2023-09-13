import type { PictureComponentRemoteImageProps } from '@astrojs/image/components/';
import type {
  GetPictureParams,
  GetPictureResult,
} from '@astrojs/image/dist/lib/get-picture';
import type {
  GetPictureParams as GetBuiltPictureParams,
  GetPictureResult as GetBuiltPictureResult,
} from './get-built-picture';

export type PictureProps = Omit<PictureComponentRemoteImageProps, 'aspectRatio' | 'sizes'> & {
  sizes?: string;
  aspectRatio?: PictureComponentRemoteImageProps['aspectRatio'];
  fetchpriority?: 'high' | 'low' | 'auto';
  hasImg?: boolean;
};

export type ImageSize = { width?: number, height?: number };

export type TryImageSize = (src: string) => ImageSize;

const getAspectRatio = (src: string | ImageSize, tryImageSize: TryImageSize) => {
  if (typeof src === 'string') {
    src = tryImageSize(src);
  } else if (src.width) {
    return src.height ? src.width / src.height : 1;
  }
  return 0;
};

export type UsePictureParams = PictureProps & {
  tryImageSize: TryImageSize;
  getPicture: ((params: GetPictureParams) => Promise<GetPictureResult>)
    | ((params: GetBuiltPictureParams) => Promise<GetBuiltPictureResult>);
};

const useSSRPicture = async (params: UsePictureParams) => {
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
  if (!sizes && attrs.class) {
    const classNames = attrs.class.split(' ');
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
      const classRegex = breakpoint
        ? new RegExp(`^${breakpoint}:max-w-(\\[\\w+\\]|screen-\\w+)$`)
        : /^max-w-(\[\w+\]|screen-\w+)$/;
      let classMaxW: string | undefined;
      classNames.find((_class) => {
        const maxW = _class.replace(classRegex, '$1');
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

  const pictureAttrs: Partial<typeof attrs & { alt: string }> = {};
  if (!hasImg) {
    pictureAttrs['data-alt'] = alt;
    Object.assign(pictureAttrs, attrs);
    delete pictureAttrs.width;
    delete pictureAttrs.height;
  }

  return {
    sizes,
    aspectRatio,
    sources,
    pictureAttrs,
    imgAttrs: !hasImg ? null : {
      ...image,
      alt,
      loading,
      decoding,
      ...attrs,
    },
  };
};

export default useSSRPicture;

export { useSSRPicture };
