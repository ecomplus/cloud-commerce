import { resolve as resolvePath } from 'path';
import imageSize from 'image-size';
import { getImage as _getImage } from '@astrojs/image';

const tryImageSize = (src: string) => {
  let dimensions: { width?: number, height?: number } = {};
  if (typeof src === 'string' && src.startsWith('/')) {
    const { STOREFRONT_BASE_DIR } = import.meta.env;
    try {
      dimensions = imageSize(resolvePath(STOREFRONT_BASE_DIR, `public${src}`));
    } catch (e) {
      dimensions = {};
    }
  }
  return dimensions;
};

type TransformOptions = Omit<Parameters<typeof _getImage>[0], 'alt'> & {
  isLowResolution?: boolean,
  alt?: string,
};
const getImage = async (options: TransformOptions) => {
  if (!options.isLowResolution) {
    if (options.width) {
      options.width *= 2;
    }
    if (options.height) {
      options.height *= 2;
    }
  }
  if (
    typeof options.src === 'string'
    && !options.aspectRatio
    && (!options.width || !options.height)
  ) {
    const { width, height } = tryImageSize(options.src);
    if (width) {
      if (!options.width) {
        options.width = width;
      }
      options.aspectRatio = height ? width / height : 1;
    }
  }
  const imgAttrs = await _getImage({ alt: '', ...options });
  imgAttrs.src += imgAttrs.src.includes('?') ? '&' : '?';
  imgAttrs.src += `V=${import.meta.env.DEPLOY_RAND || '_'}`;
  if (typeof imgAttrs.width === 'number') {
    imgAttrs.width /= 2;
  }
  if (typeof imgAttrs.height === 'number') {
    imgAttrs.height /= 2;
  }
  return imgAttrs;
};

export default getImage;

export { tryImageSize, getImage };
