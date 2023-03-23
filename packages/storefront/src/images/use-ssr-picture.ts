import type { PictureComponentRemoteImageProps } from '@astrojs/image/components/';
import type {
  GetPictureParams,
  GetPictureResult,
} from '@astrojs/image/dist/lib/get-picture';

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
  getPicture: (params: GetPictureParams) => Promise<GetPictureResult>;
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

  let aspectRatio: number;
  if (propAspectRatio) {
    if (typeof propAspectRatio === 'number') {
      aspectRatio = propAspectRatio;
    } else {
      const [width, height] = propAspectRatio.split(':');
      aspectRatio = Number(width) / Number(height);
    }
  } else if ((!attrs.width || !attrs.height) && typeof src === 'string') {
    const { width, height } = tryImageSize(src);
    if (height) {
      aspectRatio = getAspectRatio({ width, height }, tryImageSize);
      attrs.width = width;
      attrs.height = height;
    }
  }
  let sizes: string = propSizes || '';
  if (!sizes && attrs.class) {
    const classNames = attrs.class.split(' ');
    const classRegex = /^(\w+:)?max-w-\[(\w+)\]$/;
    let nextSize: string;
    [
      [''],
      ['sm', 640],
      ['md', 768],
      ['lg', 1024],
      ['xl', 1280],
      ['2xl', 1536],
    ].forEach(([breakpoint, minWidth]: [string, number | undefined]) => {
      const className = classNames.find((_class) => {
        return _class.startsWith(breakpoint ? `${breakpoint}:max-w-[` : 'max-w-[');
      });
      if (className) {
        if (nextSize) {
          // max-w-50px sm:max-w-[... => (max-width: 639px) 50px...
          if (sizes) sizes += ', ';
          sizes += `(max-width: ${(minWidth - 1)}px) ${nextSize}`;
        }
        nextSize = className.replace(classRegex, '$2');
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
      loading,
      decoding,
      ...attrs,
    },
  };
};

export default useSSRPicture;

export { useSSRPicture };
