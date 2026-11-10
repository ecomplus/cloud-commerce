import {
  describe,
  test,
  expect,
  vi,
} from 'vitest';
import { useSSRPicture } from '~/images/use-ssr-picture';

const builtPicture = {
  image: { src: '/_astro/banner_abc.jpg', width: 1024, height: 576 },
  sources: [
    { type: 'image/avif', srcset: '/_astro/banner_abc.avif 640w,/_astro/banner_def.avif 1024w' },
    { type: 'image/webp', srcset: '/_astro/banner_abc.webp 640w,/_astro/banner_def.webp 1024w' },
  ],
};

describe('SSR <picture> attributes', () => {
  test('renders the original file when the image size is unknown', async () => {
    // e.g. a new upload on CMS preview, not listed on the deployed images manifest
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const getPicture = vi.fn(async () => {
      throw new Error('`aspectRatio` must be provided for remote images');
    });
    const { sources, imgAttrs } = await useSSRPicture({
      src: '/img/uploads/new-banner.jpg',
      alt: 'New banner',
      widths: [640, 1024],
      tryImageSize: async () => ({}),
      getPicture,
    });
    expect(getPicture).not.toHaveBeenCalled();
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
      getPicture,
    });
    expect(getPicture).toHaveBeenCalledWith(expect.objectContaining({
      src: '/img/uploads/banner.jpg',
      aspectRatio: 1600 / 900,
    }));
    expect(sources).toEqual(builtPicture.sources);
    expect(imgAttrs?.src).toBeNull();
  });
});
