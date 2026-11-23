import {
  describe,
  test,
  expect,
  vi,
  afterEach,
} from 'vitest';
import { useSSRPicture } from '~/images/use-ssr-picture';
import { createPictureGetter } from '~/images/picture-base';
import { withOriginalImageFallback } from '~/images/get-built-picture';
import {
  parseOriginalImagesCsv,
  createOriginalImageSizeGetter,
} from '~/images/get-original-image-size';

const builtPicture = {
  image: { src: '/_astro/banner_abc.jpg', width: 1024, height: 576 },
  sources: [
    { type: 'image/avif', srcset: '/_astro/banner_abc.avif 640w,/_astro/banner_def.avif 1024w' },
    { type: 'image/webp', srcset: '/_astro/banner_abc.webp 640w,/_astro/banner_def.webp 1024w' },
  ],
};

describe('SSR <picture> attributes', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('keeps failing on unknown image size without the SSR fallback', async () => {
    // Static build must not deploy unoptimized images
    const getImage = vi.fn();
    await expect(useSSRPicture({
      src: '/img/uploads/missing.jpg',
      alt: 'Missing',
      widths: [640, 1024],
      tryImageSize: async () => ({}),
      getPicture: createPictureGetter(getImage),
    })).rejects.toThrow('`aspectRatio` must be provided');
    expect(getImage).not.toHaveBeenCalled();
  });

  test('renders the original file when the image size is unknown on SSR', async () => {
    // e.g. a new upload on CMS preview, not listed on the deployed images manifest
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const getPicture = vi.fn(async () => structuredClone(builtPicture));
    const { sources, imgAttrs } = await useSSRPicture({
      src: '/img/uploads/new-banner.jpg',
      alt: 'New banner',
      widths: [640, 1024],
      tryImageSize: async () => ({}),
      getPicture: withOriginalImageFallback(getPicture),
    });
    expect(getPicture).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('/img/uploads/new-banner.jpg'));
    expect(sources).toEqual([]);
    expect(imgAttrs?.src).toBe('/img/uploads/new-banner.jpg');
    expect(imgAttrs?.alt).toBe('New banner');
  });

  test('keeps optimized sources when the image size is known', async () => {
    const getPicture = vi.fn(async () => structuredClone(builtPicture));
    const { sources, imgAttrs } = await useSSRPicture({
      src: '/img/uploads/banner.jpg',
      alt: 'Banner',
      widths: [640, 1024],
      tryImageSize: async () => ({ width: 1600, height: 900 }),
      getPicture: withOriginalImageFallback(getPicture),
    });
    expect(getPicture).toHaveBeenCalledWith(expect.objectContaining({
      src: '/img/uploads/banner.jpg',
      aspectRatio: 1600 / 900,
    }));
    expect(sources).toEqual(builtPicture.sources);
    expect(imgAttrs?.src).toBeNull();
  });
});

describe('Original image sizes manifest', () => {
  const getOriginalImageSize = createOriginalImageSizeGetter(parseOriginalImagesCsv([
    '"img/uploads/banner.jpg",1600,900',
    '"img/uploads/foto (1).jpg",800,600',
    '"img/uploads/a+b.jpg",400,300',
    '"img/uploads/x[1.jpg",200,100',
    '"img/uploads/a, ""b"".png",300,300',
    '"img/uploads/banner.jpg",1,1',
    '',
  ].join('\n')));

  test('matches the exact file path ignoring query string', async () => {
    expect(await getOriginalImageSize('/img/uploads/banner.jpg?V=123'))
      .toEqual({ width: 1600, height: 900 });
    expect(await getOriginalImageSize('/img/uploads/banner.jpgx')).toEqual({});
    expect(await getOriginalImageSize('/img/uploads/missing.jpg')).toEqual({});
    expect(await getOriginalImageSize('img/uploads/banner.jpg')).toEqual({});
  });

  test('matches file names with special characters', async () => {
    expect(await getOriginalImageSize('/img/uploads/foto (1).jpg'))
      .toEqual({ width: 800, height: 600 });
    expect(await getOriginalImageSize('/img/uploads/a+b.jpg'))
      .toEqual({ width: 400, height: 300 });
    expect(await getOriginalImageSize('/img/uploads/x[1.jpg'))
      .toEqual({ width: 200, height: 100 });
    expect(await getOriginalImageSize('/img/uploads/a, "b".png'))
      .toEqual({ width: 300, height: 300 });
  });
});
