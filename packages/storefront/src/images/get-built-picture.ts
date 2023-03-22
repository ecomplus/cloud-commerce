import type { HTMLAttributes } from 'astro/types';
// import type { ImageMetadata } from '@astrojs/image/dist/vite-plugin-astro-image';
import type { OutputFormat, TransformOptions } from '@astrojs/image/dist/loaders/';
import mime from 'mime';
import getBuiltImage from './get-built-image';

function removeQueryString(src: string) {
  const index = src.lastIndexOf('?');
  return index > 0 ? src.substring(0, index) : src;
}

function basename(src: string) {
  // eslint-disable-next-line
  return removeQueryString(src.replace(/^.*[\\\/]/, ''));
}

const extname = (src: string) => {
  const base = basename(src);
  const index = base.lastIndexOf('.');
  if (index <= 0) {
    return '';
  }
  return base.substring(index);
};

function parseAspectRatio(aspectRatio: TransformOptions['aspectRatio']) {
  if (!aspectRatio) {
    return undefined;
  }
  // Parse aspect ratio strings, if required (ex: "16:9")
  if (typeof aspectRatio === 'number') {
    return aspectRatio;
  }
  const [width, height] = aspectRatio.split(':');
  return parseInt(width, 10) / parseInt(height, 10);
}

export interface GetPictureParams {
  src: string /* | ImageMetadata | Promise<{ default: ImageMetadata }> */;
  alt: string;
  widths: number[];
  formats: OutputFormat[];
  aspectRatio?: TransformOptions['aspectRatio'];
  fit?: TransformOptions['fit'];
  background?: TransformOptions['background'];
  position?: TransformOptions['position'];
}

export interface GetPictureResult {
  image: HTMLAttributes<'img'>;
  sources: { type: string; srcset: string }[];
}

async function resolveAspectRatio({ src, aspectRatio }: GetPictureParams) {
  if (typeof src === 'string') {
    return parseAspectRatio(aspectRatio);
  }
  throw new Error('Custom (faster) `Picture.ssr.astro` works only with string ("remote") src');
  /*
  const metadata = 'then' in src ? (await src).default : src;
  return parseAspectRatio(aspectRatio) || metadata.width / metadata.height;
  */
}

async function resolveFormats({ src, formats }: GetPictureParams) {
  const unique = new Set(formats);
  if (typeof src === 'string') {
    unique.add(extname(src).replace('.', '') as OutputFormat);
  } else {
    throw new Error('Custom `Picture.ssr.astro` works only with string src');
    /*
    const metadata = 'then' in src ? (await src).default : src;
    unique.add(extname(metadata.src).replace('.', '') as OutputFormat);
    */
  }
  return Array.from(unique).filter(Boolean);
}

export async function getBuiltPicture(params: GetPictureParams): Promise<GetPictureResult> {
  const {
    src,
    alt,
    widths,
    fit,
    position,
    background,
  } = params;
  if (!src) {
    throw new Error('[@astrojs/image] `src` is required');
  }
  if (!widths || !Array.isArray(widths)) {
    throw new Error('[@astrojs/image] at least one `width` is required. ex: `widths={[100]}`');
  }
  const aspectRatio = await resolveAspectRatio(params);
  if (!aspectRatio) {
    throw new Error('`aspectRatio` must be provided for remote images');
  }
  // Always include the original image format
  const allFormats = await resolveFormats(params);
  const lastFormat = allFormats[allFormats.length - 1];
  const maxWidth = Math.max(...widths);
  let image: HTMLAttributes<'img'>;
  async function getSource(format: OutputFormat) {
    const imgs = await Promise.all(
      widths.map(async (width) => {
        const img = await getBuiltImage({
          src,
          alt,
          format,
          width,
          fit,
          position,
          background,
          aspectRatio,
        });
        if (format === lastFormat && width === maxWidth) {
          image = img;
        }
        return `${img.src} ${width}w`;
      }),
    );
    return {
      type: mime.getType(format) || format,
      srcset: imgs.join(','),
    };
  }
  const sources = await Promise.all(allFormats.map((format) => getSource(format)));
  return {
    sources,
    image,
  };
}
