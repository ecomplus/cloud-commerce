import type { HTMLAttributes } from 'astro/types';
import type { OutputFormat, TransformOptions, GetBuiltImage } from './get-built-image';
import { lookup } from 'mrmime';

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

async function resolveAspectRatio({ src, aspectRatio }: GetPictureParams) {
  if (typeof src === 'string') {
    return parseAspectRatio(aspectRatio);
  }
  throw new Error('Custom (faster) `Picture.runtime.astro` works only with string ("remote") src');
  /*
  const metadata = 'then' in src ? (await src).default : src;
  return parseAspectRatio(aspectRatio) || metadata.width / metadata.height;
  */
}

export const createPictureGetter = (getImage: GetBuiltImage):
((params: GetPictureParams) => Promise<GetPictureResult>) => {
  return async (params) => {
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
    const originalFormat = extname(src).replace('.', '') as OutputFormat;
    const maxWidth = Math.max(...widths);
    const image = await getImage({
      src,
      alt,
      format: originalFormat,
      width: maxWidth,
      height: maxWidth / aspectRatio,
      fit,
      position,
      background,
      aspectRatio,
    });
    async function getSource(format: OutputFormat) {
      const imgs = await Promise.all(
        widths.map(async (width) => {
          const img = await getImage({
            src,
            alt,
            format,
            width,
            height: width / (aspectRatio as number),
            fit,
            position,
            background,
            aspectRatio,
          });
          if (!img.src.startsWith('/_image')) {
            return `${encodeURI(img.src)} ${width}w`;
          }
          return `${img.src} ${width}w`;
        }),
      );
      return {
        type: lookup(format) || format,
        srcset: imgs.join(','),
      };
    }
    const uniqueFormats = Array.from(new Set(params.formats)).filter(Boolean);
    const sources = await Promise.all(uniqueFormats.map((format) => getSource(format)));
    return {
      sources,
      // @ts-ignore
      image,
    };
  };
};
