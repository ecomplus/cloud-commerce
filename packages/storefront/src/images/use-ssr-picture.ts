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
    const baseClassRegex = /^max-w-\[(\w+)\]$/;
    const baseClassName = classNames.find((_class) => baseClassRegex.test(_class));
    if (baseClassName) {
      // max-w-[100px] => 100px
      sizes = baseClassName.replace(baseClassRegex, '$1');
    }
    [
      ['sm', 640],
      ['md', 768],
      ['lg', 1024],
      ['xl', 1280],
      ['2xl', 1536],
    ].forEach(([breakpoint, minWidth]) => {
      const classRegex = new RegExp(`^${breakpoint}:max-w-\\[(\\w+)\\]$`);
      const className = classNames.find((_class) => classRegex.test(_class));
      if (className) {
        if (sizes) sizes += ', ';
        sizes += `(min-width: ${minWidth}px) ${className.replace(classRegex, '$1')}`;
      }
    });
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
