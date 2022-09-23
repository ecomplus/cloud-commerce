import imageSize from 'image-size';
// eslint-disable-next-line import/no-unresolved
import { getImage as _getImage } from '@astrojs/image';

const tryImageSize = (src: string) => {
  let dimensions: { width?: number, height?: number } = {};
  if (typeof src === 'string' && src.startsWith('/')) {
    try {
      dimensions = imageSize(`public${src}`);
    } catch (e) {
      dimensions = {};
    }
  }
  return dimensions;
};

const getImage = (options: Parameters<typeof _getImage>[0]) => {
  const { src } = options;
  if (
    typeof src === 'string'
    && !options.aspectRatio
    && (!options.width || !options.height)
  ) {
    const { width, height } = tryImageSize(src);
    return _getImage({
      width,
      ...options,
      aspectRatio: width && height ? width / height : 1,
    });
  }
  return _getImage(options);
};

export default getImage;

export { tryImageSize, getImage };
