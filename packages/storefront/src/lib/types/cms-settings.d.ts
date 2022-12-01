import { CmsSettings as _CmsSettings } from '@cloudcommerce/types';

type CmsSettings = _CmsSettings & typeof import('content/settings.json');

export default CmsSettings;

export type { CmsSettings };
