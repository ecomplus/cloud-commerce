import { CmsSettings as _CmsSettings } from '@cloudcommerce/types';

type CmsSettings = _CmsSettings &
  Omit<typeof import('content/settings.json'), keyof _CmsSettings>;

export default CmsSettings;

export type { CmsSettings };
