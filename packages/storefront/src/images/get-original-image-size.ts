import type { ImageSize } from './use-ssr-picture';
import { join as joinPath } from 'node:path';
import { readFileSync } from 'node:fs';

type OriginalImageSizes = Map<string, ImageSize>;

// Rows written by `scripts/build-prod.sh`: "<filepath>",<width>,<height>
export const parseOriginalImagesCsv = (csv: string) => {
  const originalImageSizes: OriginalImageSizes = new Map();
  csv.split(/\n/).forEach((line) => {
    if (!line) return;
    const cols = line.split(',');
    let height = Number(cols.pop());
    let width = Number(cols.pop());
    const filepath = cols.join(',').replace(/^"|"$/g, '').replace(/""/g, '"');
    if (!filepath) return;
    if (Number.isNaN(height)) {
      if (width) height = width;
    } else if (Number.isNaN(width)) {
      if (height) width = height;
    }
    const key = `/${filepath}`;
    if (!originalImageSizes.has(key)) {
      originalImageSizes.set(key, { width, height });
    }
  });
  return originalImageSizes;
};

export const createOriginalImageSizeGetter = (originalImageSizes: OriginalImageSizes) => {
  return async (src: string): Promise<ImageSize> => {
    if (typeof src !== 'string' || src.charAt(0) !== '/') return {};
    const queryIndex = src.indexOf('?');
    const size = originalImageSizes.get(queryIndex > -1 ? src.slice(0, queryIndex) : src);
    return size ? { ...size } : {};
  };
};

const { STOREFRONT_BASE_DIR } = process.env;
const baseDir = STOREFRONT_BASE_DIR || process.cwd();
const manifestFilepath = joinPath(baseDir, 'dist/server/images.src.csv');
let originalImageSizes: OriginalImageSizes = new Map();
try {
  originalImageSizes = parseOriginalImagesCsv(readFileSync(manifestFilepath, 'utf-8'));
} catch (err) {
  if (global.$renderStorefront) {
    console.error(err);
  }
}

export const getOriginalImageSize = createOriginalImageSizeGetter(originalImageSizes);

export default getOriginalImageSize;
