import { createPictureGetter } from './picture-base';
import getBuiltImage from './get-built-image';

export const getBuiltPicture = createPictureGetter(getBuiltImage);

export default getBuiltPicture;
