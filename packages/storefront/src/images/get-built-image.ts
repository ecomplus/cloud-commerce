import { join as joinPath } from 'node:path';
import { readFileSync } from 'node:fs';

export type OutputFormatSupportsAlpha = 'avif' | 'png' | 'webp';

export type OutputFormat = OutputFormatSupportsAlpha | 'jpeg' | 'jpg' | 'svg';

export interface TransformOptions {
  src: string;
  alt?: string;
  format?: OutputFormat;
  quality?: number;
  width?: number;
  height?: number;
  aspectRatio?: number | `${number}:${number}`;
  background?: string;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  position?: 'top' | 'right top' | 'right' | 'right bottom'
    | 'bottom' | 'left bottom' | 'left' | 'left top'
    | 'north' | 'northeast' | 'east' | 'southeast'
    | 'south' | 'southwest' | 'west' | 'northwest'
    | 'center' | 'centre' | 'cover' | 'entropy' | 'attention';
}

const { STOREFRONT_BASE_DIR } = process.env;
const baseDir = STOREFRONT_BASE_DIR || process.cwd();
type BuiltImage = { filename: string, width: number, height: number };
const builtImages: BuiltImage[] = [];
const manifestFilepath = joinPath(baseDir, 'dist/server/images.dist.csv');
readFileSync(manifestFilepath, 'utf-8').split(/\n/).forEach((line) => {
  const [filename, width, height] = line.split(',');
  builtImages.push({
    filename,
    width: Number(width),
    height: Number(height),
  });
});
builtImages.sort((a, b) => {
  if (a.width < b.width) return -1;
  return 1;
});

type ImageOptions = Record<string, any> & {
  src: string,
  width: number,
  format: OutputFormat,
};
const getBuiltImage = async ({ src, width, format }: ImageOptions) => {
  const filename = src.replace(/^.*\//, '').replace(/.\w+(\?.*)?$/, '');
  const filenameRegExp = new RegExp(`[_.][a-z0-9]+\\.${format}$`, 'i');
  const matchFilename = (_builtImage: BuiltImage) => {
    return filename === _builtImage.filename.replace(filenameRegExp, '');
  };
  let builtImage = builtImages.find((_builtImage) => {
    return _builtImage.width >= width && matchFilename(_builtImage);
  });
  if (!builtImage) {
    builtImage = builtImages.find(matchFilename);
  }
  if (builtImage) {
    return {
      src: `/_astro/${builtImage.filename}`,
      width: builtImage.width,
      height: builtImage.height,
    };
  }
  console.warn(`Could not match built ${format} image for ${src} ${width}px`);
  return { src, width };
};

export default getBuiltImage;

export { getBuiltImage };

export type GetBuiltImage = typeof getBuiltImage;
