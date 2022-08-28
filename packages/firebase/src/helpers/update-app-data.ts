import type { Applications, AppEventsPayload } from '@cloudcommerce/types';
import { PubSub } from '@google-cloud/pubsub';
import logger from 'firebase-functions/lib/logger';
import api from '@cloudcommerce/api';
import getEnv from '../env';
import { EVENT_SKIP_FLAG, GET_PUBSUB_TOPIC } from '../const';

export default async (
  applicationId: Applications['_id'],
  data: Record<string, any>,
  application?: Applications,
  isHiddenData = false,
) => {
  const { apiAuth } = getEnv();
  const subresource = isHiddenData ? 'hidden_data' : 'data';
  if (application) {
    // eslint-disable-next-line no-param-reassign
    application[subresource] = data;
    const json: AppEventsPayload = {
      evName: 'applications-dataSet',
      apiEvent: {
        timestamp: new Date().toISOString(),
        resource_id: applicationId,
        action: 'update',
        modified_fields: [subresource],
        authentication_id: null,
      },
      apiDoc: application,
      app: {
        _id: applicationId,
        app_id: application.app_id,
        data: application.data,
        hidden_data: application.hidden_data,
      },
      isInternal: true,
    };
    try {
      await new PubSub()
        .topic(GET_PUBSUB_TOPIC(application.app_id))
        .publishMessage({ json });
    } catch (err) {
      logger.error(err);
    }
  }
  return api.patch(`applications/${applicationId}/${subresource}`, data, {
    ...apiAuth,
    headers: {
      'X-Event-Flag': EVENT_SKIP_FLAG,
    },
  });
};
