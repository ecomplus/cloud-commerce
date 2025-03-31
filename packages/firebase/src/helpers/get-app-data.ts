import type { Applications } from '@cloudcommerce/types';
import api from '@cloudcommerce/api';
import { configApps, config } from '../config';

export type AppIdOrName = keyof (typeof configApps) | Applications['app_id'];

export const getAppData = async (appIdOrName: AppIdOrName) => {
  const appId = typeof appIdOrName === 'number'
    ? appIdOrName
    : config.get().apps[appIdOrName]?.appId || appIdOrName;
  const [application] = (await api.get('applications', {
    params: { app_id: appId },
    fields: ['hidden_data', 'data'] as const,
    limit: 1,
  })).data.result;
  return {
    ...application?.data,
    ...application?.hidden_data,
  };
};

export default getAppData;
