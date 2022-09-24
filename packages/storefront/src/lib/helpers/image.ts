import imageSize from 'image-size';

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

const getImageAttrs = async (attrs: {
  src: string,
  width?: number,
  height?: number,
}) => {
  if (!attrs.width || !attrs.height) {
    const { width, height } = tryImageSize(attrs.src);
    if (width) {
      const aspectRatio = height ? width / height : 1;
      if (!attrs.width) {
        attrs.width = attrs.height ? Math.round(attrs.height * aspectRatio) : width;
      }
      if (!attrs.height) {
        attrs.height = Math.round(attrs.width / aspectRatio);
      }
    }
  }
  return attrs;
};

export default getImageAttrs;

export { tryImageSize, getImageAttrs };
