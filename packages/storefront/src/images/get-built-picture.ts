import type { GetPictureParams, GetPictureResult } from './picture-base';
import { createPictureGetter } from './picture-base';
import getBuiltImage from './get-built-image';

export const getBuiltPicture = createPictureGetter(getBuiltImage);

// SSR only: unknown image size, e.g. a new CMS upload not deployed yet (CMS preview).
// The image getter would throw in the middle of the SSR stream and hang the response,
// so render the original file instead (broken until deployed, but the page renders).
// Static build must keep failing to have every deployed image optimized
export const withOriginalImageFallback = (
  getPicture: (params: GetPictureParams) => Promise<GetPictureResult>,
) => async (params: GetPictureParams): Promise<GetPictureResult> => {
  if (params.src && !params.aspectRatio) {
    console.warn(`Could not get size of image ${params.src}, rendering original file`);
    return { image: { src: params.src }, sources: [] };
  }
  return getPicture(params);
};

export const getBuiltPictureOrOriginal = withOriginalImageFallback(getBuiltPicture);

export default getBuiltPicture;
