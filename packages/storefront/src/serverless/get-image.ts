import type { OutputFormat } from '@astrojs/image/dist/loaders/';
import { join as joinPath } from 'node:path';
import { readFileSync } from 'node:fs';

type BuiltImage = { filename: string, width: number, height: number };
const builtImages: BuiltImage[] = [];
const manifestFilepath = joinPath(process.cwd(), 'dist/server/images.dist.csv');
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
const getImage = async ({ src, width, format }: ImageOptions) => {
  const filename = src.replace(/^.*\//, '').replace(/.\w+(\?.*)?$/, '');
  const matchFilename = (_builtImage: BuiltImage) => {
    return filename === _builtImage.filename
      .replace(new RegExp(`[_.][a-z0-9]+\\.${format}$`, 'i'), '');
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

export default getImage;

export { getImage };
