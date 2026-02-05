import type { Applications } from '@cloudcommerce/types';
import api from '@cloudcommerce/api';
import { configApps, config } from '../config';

export type AppIdOrName = keyof (typeof configApps) | Applications['app_id'];

export const getAppData = async (
  appIdOrName: AppIdOrName,
  fields: Array<'hidden_data' | 'data'> = ['hidden_data', 'data'] as const,
) => {
  const appId = typeof appIdOrName === 'number'
    ? appIdOrName
    : config.get().apps[appIdOrName]?.appId || appIdOrName;
  const [application] = (await api.get('applications', {
    params: { app_id: appId },
    fields,
    limit: 1,
  })).data.result;
  return {
    ...application?.data,
    ...application?.hidden_data,
  };
};

export default getAppData;
